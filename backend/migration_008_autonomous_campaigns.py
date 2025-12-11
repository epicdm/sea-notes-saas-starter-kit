"""
Autonomous Calling Campaigns Migration

Description:
  - Outbound calling campaigns with autonomous execution
  - Lead queue management with retry logic
  - Call outcome tracking and qualification scoring
  - Schedule configuration for call windows
  - Integration with voice agents (LiveKit/Twilio)

Tables Created:
  1. campaigns - Campaign configurations and settings
  2. campaign_calls - Individual call attempts and outcomes
  3. campaign_leads - Leads associated with campaigns (extends funnel_leads)

Purpose:
  - Create outbound calling campaigns
  - Automatically dial leads from uploaded CSV lists
  - Track call outcomes and qualification
  - Manage call scheduling and retry logic
  - Measure campaign effectiveness and ROI
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply autonomous campaigns migration"""
    logger.info("🔧 Starting autonomous campaigns migration...")

    # ========================================
    # Table: campaigns
    # ========================================
    logger.info("Creating campaigns table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS campaigns (
          id VARCHAR(36) PRIMARY KEY,
          "userId" VARCHAR(36) NOT NULL,
          "brandId" VARCHAR(36),  -- Optional brand association

          -- Basic Info
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'draft',
          -- Statuses: draft, active, paused, completed, cancelled

          -- Agent Configuration
          "agentId" VARCHAR(36) NOT NULL,  -- Voice agent to use for calls

          -- Schedule Configuration (JSONB)
          -- Structure: {
          --   timezone: "America/New_York",
          --   callWindows: [{dayOfWeek: 1, startHour: 9, endHour: 17}],
          --   maxCallsPerDay: 100,
          --   maxCallsPerLead: 3,
          --   retryDelayHours: 24
          -- }
          "scheduleConfig" JSONB NOT NULL,

          -- Lead Source
          "leadSource" VARCHAR(50) NOT NULL DEFAULT 'csv',
          -- Sources: csv, manual, api, funnel

          "leadListUrl" TEXT,  -- S3/storage URL for uploaded CSV
          "totalLeads" INTEGER DEFAULT 0 NOT NULL,

          -- Campaign Progress (updated by executor)
          progress INTEGER DEFAULT 0 NOT NULL,  -- Percentage 0-100
          called INTEGER DEFAULT 0 NOT NULL,
          successful INTEGER DEFAULT 0 NOT NULL,  -- Completed calls
          remaining INTEGER DEFAULT 0 NOT NULL,

          -- Qualification Configuration (JSONB)
          -- Structure: {
          --   qualificationCriteria: [
          --     {field: "budget", operator: ">=", value: 10000},
          --     {field: "timeline", operator: "in", value: ["immediate", "within_month"]}
          --   ],
          --   minQualificationScore: 70
          -- }
          "qualificationConfig" JSONB,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "startedAt" TIMESTAMP,
          "completedAt" TIMESTAMP,

          CONSTRAINT fk_campaign_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_campaign_brand FOREIGN KEY ("brandId") REFERENCES brand_profiles(id) ON DELETE SET NULL,
          CONSTRAINT fk_campaign_agent FOREIGN KEY ("agentId") REFERENCES agent_configs(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns("userId", status);
        CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON campaigns("brandId");
        CREATE INDEX IF NOT EXISTS idx_campaigns_agent ON campaigns("agentId");
        CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
        CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns("createdAt");
    """))

    # ========================================
    # Table: campaign_calls
    # ========================================
    logger.info("Creating campaign_calls table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS campaign_calls (
          id VARCHAR(36) PRIMARY KEY,
          "campaignId" VARCHAR(36) NOT NULL,
          "leadId" VARCHAR(36),  -- Reference to funnel_leads

          -- Call Information
          "phoneNumber" VARCHAR(50) NOT NULL,
          "callSid" VARCHAR(255),  -- Twilio/provider call ID
          "liveKitRoomName" VARCHAR(255),  -- LiveKit room for this call

          -- Call Outcome
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          -- Statuses: pending, calling, in_progress, completed, failed, no_answer, busy, voicemail

          outcome VARCHAR(50),
          -- Outcomes: qualified, unqualified, callback_requested, not_interested, wrong_number, voicemail

          -- Call Metrics
          duration INTEGER,  -- Seconds
          "startedAt" TIMESTAMP,
          "endedAt" TIMESTAMP,
          cost DECIMAL(10, 4),  -- Call cost in USD

          -- Qualification Data (JSONB)
          -- Structure: {
          --   score: 75,
          --   criteria: {budget: 50000, timeline: "immediate"},
          --   notes: "Interested in premium package",
          --   nextAction: "schedule_demo"
          -- }
          "qualificationData" JSONB,

          -- Transcript and Recording
          "transcriptUrl" TEXT,
          "recordingUrl" TEXT,
          transcript TEXT,  -- Full call transcript

          -- Retry Logic
          "attemptNumber" INTEGER DEFAULT 1 NOT NULL,
          "maxAttempts" INTEGER DEFAULT 3 NOT NULL,
          "nextRetryAt" TIMESTAMP,  -- When to retry if needed

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_call_campaign FOREIGN KEY ("campaignId") REFERENCES campaigns(id) ON DELETE CASCADE,
          CONSTRAINT fk_call_lead FOREIGN KEY ("leadId") REFERENCES funnel_leads(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_campaign_calls_campaign ON campaign_calls("campaignId");
        CREATE INDEX IF NOT EXISTS idx_campaign_calls_lead ON campaign_calls("leadId");
        CREATE INDEX IF NOT EXISTS idx_campaign_calls_status ON campaign_calls(status);
        CREATE INDEX IF NOT EXISTS idx_campaign_calls_outcome ON campaign_calls(outcome);
        CREATE INDEX IF NOT EXISTS idx_campaign_calls_retry ON campaign_calls("nextRetryAt") WHERE status = 'failed' OR status = 'no_answer';
        CREATE INDEX IF NOT EXISTS idx_campaign_calls_created ON campaign_calls("createdAt");
    """))

    # ========================================
    # Table: campaign_leads (extends funnel_leads)
    # ========================================
    logger.info("Adding campaign association to funnel_leads...")
    db_session.execute(text("""
        -- Add campaignId column to funnel_leads if not exists
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'funnel_leads' AND column_name = 'campaignId'
          ) THEN
            ALTER TABLE funnel_leads ADD COLUMN "campaignId" VARCHAR(36);
            ALTER TABLE funnel_leads ADD CONSTRAINT fk_lead_campaign
              FOREIGN KEY ("campaignId") REFERENCES campaigns(id) ON DELETE SET NULL;
            CREATE INDEX idx_funnel_leads_campaign ON funnel_leads("campaignId");
          END IF;
        END $$;
    """))

    # ========================================
    # Add call tracking columns to funnel_leads
    # ========================================
    logger.info("Adding call tracking to funnel_leads...")
    db_session.execute(text("""
        -- Add call tracking columns
        DO $$
        BEGIN
          -- Last call attempt
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'funnel_leads' AND column_name = 'lastCalledAt'
          ) THEN
            ALTER TABLE funnel_leads ADD COLUMN "lastCalledAt" TIMESTAMP;
          END IF;

          -- Total call attempts
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'funnel_leads' AND column_name = 'callAttempts'
          ) THEN
            ALTER TABLE funnel_leads ADD COLUMN "callAttempts" INTEGER DEFAULT 0 NOT NULL;
          END IF;

          -- Last call outcome
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'funnel_leads' AND column_name = 'lastCallOutcome'
          ) THEN
            ALTER TABLE funnel_leads ADD COLUMN "lastCallOutcome" VARCHAR(50);
          END IF;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_funnel_leads_last_called ON funnel_leads("lastCalledAt");
    """))

    db_session.commit()
    logger.info("✅ Autonomous campaigns migration completed successfully!")


def downgrade(db_session):
    """Rollback autonomous campaigns migration"""
    logger.info("🔄 Rolling back autonomous campaigns migration...")

    # Drop tables in reverse dependency order
    db_session.execute(text("""
        -- Drop campaign association from funnel_leads
        ALTER TABLE funnel_leads DROP CONSTRAINT IF EXISTS fk_lead_campaign;
        ALTER TABLE funnel_leads DROP COLUMN IF EXISTS "campaignId";
        ALTER TABLE funnel_leads DROP COLUMN IF EXISTS "lastCalledAt";
        ALTER TABLE funnel_leads DROP COLUMN IF EXISTS "callAttempts";
        ALTER TABLE funnel_leads DROP COLUMN IF EXISTS "lastCallOutcome";
    """))

    db_session.execute(text("DROP TABLE IF EXISTS campaign_calls CASCADE;"))
    db_session.execute(text("DROP TABLE IF EXISTS campaigns CASCADE;"))

    db_session.commit()
    logger.info("✅ Autonomous campaigns migration rolled back successfully!")


if __name__ == "__main__":
    """Run migration standalone"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal
    import logging

    logging.basicConfig(level=logging.INFO)
    logger.info("Running migration_008_autonomous_campaigns.py...")

    db = SessionLocal()
    try:
        upgrade(db)
        logger.info("✅ Migration applied successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()
