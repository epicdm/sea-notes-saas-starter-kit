"""
Lead Capture Funnel System Migration

Description:
  - Multi-page lead capture funnels with custom themes
  - Funnel pages with flexible form fields
  - Lead management with scoring and assignment
  - Complete submission tracking with UTM parameters

Tables Created:
  1. funnels - Lead capture funnel configurations
  2. funnel_pages - Individual pages within funnels
  3. leads - Captured lead information
  4. funnel_submissions - Complete form submission tracking

Purpose:
  - Create custom lead capture funnels
  - Track lead sources and conversions
  - Assign leads to AI agents for follow-up
  - Analytics and UTM tracking built-in
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply funnels and leads migration"""
    logger.info("🔧 Starting funnels and leads migration...")

    # ========================================
    # Table: funnels
    # ========================================
    logger.info("Creating funnels table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS funnels (
          id VARCHAR(36) PRIMARY KEY,
          "userId" VARCHAR(36) NOT NULL,

          -- Basic Info
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,

          -- Configuration
          "funnelType" VARCHAR(50) NOT NULL DEFAULT 'lead_capture',
          -- Types: lead_capture, appointment_booking, survey, product_inquiry

          "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
          "customDomain" VARCHAR(255),

          -- Theme Configuration (JSONB)
          -- Structure: {
          --   primaryColor, secondaryColor, accentColor,
          --   fontFamily, fontSize, buttonStyle,
          --   backgroundImage, backgroundType (solid|gradient|image)
          -- }
          "themeConfig" JSONB,

          -- SEO Configuration (JSONB)
          -- Structure: {
          --   title, description, ogImage,
          --   ogTitle, ogDescription,
          --   twitterCard, twitterImage
          -- }
          "seoConfig" JSONB,

          -- Tracking Configuration (JSONB)
          -- Structure: {
          --   googleAnalyticsId, facebookPixelId,
          --   linkedInInsightTag, customScripts[]
          -- }
          "trackingConfig" JSONB,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_funnel_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_funnels_user_published ON funnels("userId", "isPublished");
        CREATE INDEX IF NOT EXISTS idx_funnels_slug ON funnels(slug);
        CREATE INDEX IF NOT EXISTS idx_funnels_created ON funnels("createdAt");
    """))

    # ========================================
    # Table: funnel_pages
    # ========================================
    logger.info("Creating funnel_pages table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS funnel_pages (
          id VARCHAR(36) PRIMARY KEY,
          "funnelId" VARCHAR(36) NOT NULL,

          -- Page Configuration
          "pageOrder" INTEGER NOT NULL DEFAULT 0,
          "pageType" VARCHAR(50) NOT NULL,
          -- Types: landing, form, thank_you, call_scheduled

          name VARCHAR(255) NOT NULL,

          -- Page Content (JSONB)
          -- Structure: {
          --   headline, subheadline, bodyText,
          --   imageUrl, videoUrl,
          --   ctaText, ctaStyle,
          --   sections: [{type, content, order}]
          -- }
          content JSONB NOT NULL,

          -- Form Fields (JSONB array)
          -- Structure: [{
          --   fieldType (text|email|phone|select|textarea|checkbox|radio),
          --   name, label, placeholder,
          --   required, validation,
          --   options (for select|radio)
          -- }]
          "formFields" JSONB,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_page_funnel FOREIGN KEY ("funnelId") REFERENCES funnels(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_funnel_pages_funnel ON funnel_pages("funnelId", "pageOrder");
        CREATE INDEX IF NOT EXISTS idx_funnel_pages_type ON funnel_pages("pageType");
    """))

    # ========================================
    # Table: funnel_leads
    # ========================================
    logger.info("Creating funnel_leads table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS funnel_leads (
          id VARCHAR(36) PRIMARY KEY,
          "userId" VARCHAR(36) NOT NULL,  -- Funnel owner
          "funnelId" VARCHAR(36),  -- NULL for manual entry
          source VARCHAR(50) NOT NULL DEFAULT 'funnel',
          -- Sources: funnel, manual, api, import

          -- Contact Information
          "firstName" VARCHAR(255),
          "lastName" VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          company VARCHAR(255),

          -- Custom Fields (JSONB)
          -- Flexible storage for any additional data collected
          "customFields" JSONB,

          -- Lead Management
          status VARCHAR(50) NOT NULL DEFAULT 'new',
          -- Statuses: new, contacted, qualified, unqualified, converted, lost

          "assignedAgentId" VARCHAR(36),  -- References agent_configs
          "leadScore" INTEGER DEFAULT 0 NOT NULL,  -- 0-100

          -- Tags (JSONB array of strings)
          tags JSONB DEFAULT '[]',

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_funnel_lead_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_funnel_lead_funnel FOREIGN KEY ("funnelId") REFERENCES funnels(id) ON DELETE SET NULL,
          CONSTRAINT fk_funnel_lead_agent FOREIGN KEY ("assignedAgentId") REFERENCES agent_configs(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_funnel_leads_user_status ON funnel_leads("userId", status);
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_email ON funnel_leads(email);
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_phone ON funnel_leads(phone);
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_funnel ON funnel_leads("funnelId");
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_agent ON funnel_leads("assignedAgentId");
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_created ON funnel_leads("createdAt");
        CREATE INDEX IF NOT EXISTS idx_funnel_leads_score ON funnel_leads("leadScore" DESC);
    """))

    # ========================================
    # Table: funnel_submissions
    # ========================================
    logger.info("Creating funnel_submissions table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS funnel_submissions (
          id VARCHAR(36) PRIMARY KEY,
          "funnelId" VARCHAR(36) NOT NULL,
          "leadId" VARCHAR(36),  -- Created after submission processing
          "pageId" VARCHAR(36) NOT NULL,

          -- Submission Data (JSONB)
          -- Complete form data as submitted
          "submissionData" JSONB NOT NULL,

          -- Tracking Information
          "ipAddress" VARCHAR(45),  -- IPv6 support
          "userAgent" TEXT,
          referrer TEXT,

          -- UTM Parameters (JSONB)
          -- Structure: {
          --   utmSource, utmMedium, utmCampaign,
          --   utmTerm, utmContent
          -- }
          "utmParams" JSONB,

          -- Metadata
          "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_submission_funnel FOREIGN KEY ("funnelId") REFERENCES funnels(id) ON DELETE CASCADE,
          CONSTRAINT fk_submission_lead FOREIGN KEY ("leadId") REFERENCES funnel_leads(id) ON DELETE SET NULL,
          CONSTRAINT fk_submission_page FOREIGN KEY ("pageId") REFERENCES funnel_pages(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_submissions_funnel_date ON funnel_submissions("funnelId", "submittedAt");
        CREATE INDEX IF NOT EXISTS idx_submissions_lead ON funnel_submissions("leadId");
        CREATE INDEX IF NOT EXISTS idx_submissions_page ON funnel_submissions("pageId");
    """))

    db_session.commit()
    logger.info("✅ Funnels and leads migration completed successfully!")


def downgrade(db_session):
    """Rollback funnels and leads migration"""
    logger.info("🔄 Rolling back funnels and leads migration...")

    # Drop tables in reverse dependency order
    db_session.execute(text("DROP TABLE IF EXISTS funnel_submissions CASCADE;"))
    db_session.execute(text("DROP TABLE IF EXISTS funnel_leads CASCADE;"))
    db_session.execute(text("DROP TABLE IF EXISTS funnel_pages CASCADE;"))
    db_session.execute(text("DROP TABLE IF EXISTS funnels CASCADE;"))

    db_session.commit()
    logger.info("✅ Funnels and leads migration rolled back successfully!")


if __name__ == "__main__":
    """Run migration standalone"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal
    import logging

    logging.basicConfig(level=logging.INFO)
    logger.info("Running migration_005_funnels_leads.py...")

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
