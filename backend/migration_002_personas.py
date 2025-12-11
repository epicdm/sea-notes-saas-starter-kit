"""
Persona System Migration

Description:
  - Add reusable personality templates for AI agents
  - Enable persona library that can be shared across multiple agents
  - Support pre-built templates and custom personas
  - Track persona usage across agents

Tables Created:
  1. personas - Reusable personality configurations

Purpose:
  - Create once, use everywhere - one persona can be assigned to multiple agents
  - Update persona once, all agents using it automatically update
  - Separate personality from agent configuration
  - Enable persona templates for quick agent creation
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply personas migration"""
    logger.info("🔧 Starting personas migration...")

    # ========================================
    # Table: personas
    # ========================================
    logger.info("Creating personas table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS personas (
          id VARCHAR(36) PRIMARY KEY,
          "userId" VARCHAR(36),  -- NULL for system templates, required for user personas

          -- Basic Info
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,

          -- Personality Configuration
          instructions TEXT NOT NULL,

          -- Personality Traits (JSONB)
          -- Structure: string[] - e.g., ["helpful", "patient", "empathetic"]
          "personalityTraits" JSONB,

          -- Communication Style
          tone VARCHAR(50),  -- professional, friendly, casual, formal, empathetic
          "languageStyle" VARCHAR(50),  -- concise, detailed, conversational

          -- Suggested Voice (optional)
          "suggestedVoice" VARCHAR(100),

          -- Usage Tracking
          "agentCount" INTEGER DEFAULT 0 NOT NULL,

          -- Meta
          "isTemplate" BOOLEAN DEFAULT FALSE NOT NULL,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_persona_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_personas_user ON personas("userId");
        CREATE INDEX IF NOT EXISTS idx_personas_type ON personas(type);
        CREATE INDEX IF NOT EXISTS idx_personas_template ON personas("isTemplate");
        CREATE INDEX IF NOT EXISTS idx_personas_created ON personas("createdAt");
    """))

    # ========================================
    # Insert Pre-built Persona Templates
    # ========================================
    logger.info("Inserting pre-built persona templates...")

    # Note: Using NULL userId for system templates
    # These can be marked as isTemplate=true for easy filtering
    db_session.execute(text("""
        INSERT INTO personas (
          id, "userId", name, type, description, instructions,
          "personalityTraits", tone, "languageStyle", "suggestedVoice",
          "isTemplate", "agentCount"
        ) VALUES
        (
          gen_random_uuid()::text,
          NULL,
          'Customer Support',
          'customer_support',
          'Helpful agent that answers customer questions and resolves issues',
          'You are a friendly and helpful customer support agent. Your goal is to assist customers with their questions, resolve issues efficiently, and ensure customer satisfaction. Be patient, empathetic, and solution-oriented. Always confirm understanding and offer to help with anything else.',
          '["helpful", "patient", "empathetic", "solution-focused"]'::jsonb,
          'friendly',
          'conversational',
          'nova',
          true,
          0
        ),
        (
          gen_random_uuid()::text,
          NULL,
          'Sales Agent',
          'sales',
          'Persuasive agent that qualifies leads and drives conversions',
          'You are a professional sales agent. Your goal is to understand customer needs, qualify leads, and guide them toward the right solution. Be consultative rather than pushy, focus on value and benefits, and build trust. Ask qualifying questions and match solutions to needs.',
          '["persuasive", "consultative", "confident", "value-focused"]'::jsonb,
          'professional',
          'detailed',
          'alloy',
          true,
          0
        ),
        (
          gen_random_uuid()::text,
          NULL,
          'Receptionist',
          'receptionist',
          'Professional agent that greets callers and routes them appropriately',
          'You are a professional receptionist. Greet callers warmly and professionally, understand their needs quickly, and route them to the right department or person. Be efficient, courteous, and organized. Collect necessary information before transferring.',
          '["courteous", "efficient", "organized", "welcoming"]'::jsonb,
          'professional',
          'concise',
          'echo',
          true,
          0
        ),
        (
          gen_random_uuid()::text,
          NULL,
          'Appointment Setter',
          'appointment_setter',
          'Organized agent that schedules and manages appointments',
          'You are an appointment scheduling specialist. Help customers find convenient times, manage their bookings, send confirmations, and handle rescheduling. Be organized, detail-oriented, and helpful. Always confirm appointment details clearly.',
          '["organized", "detail-oriented", "helpful", "reliable"]'::jsonb,
          'professional',
          'detailed',
          'shimmer',
          true,
          0
        ),
        (
          gen_random_uuid()::text,
          NULL,
          'Technical Support',
          'technical_support',
          'Expert agent that helps with technical issues and troubleshooting',
          'You are a technical support specialist. Help users troubleshoot issues with clear step-by-step guidance. Explain technical concepts in simple terms, be patient with non-technical users, and thorough in your troubleshooting. Always verify the issue is resolved before ending.',
          '["knowledgeable", "patient", "thorough", "clear"]'::jsonb,
          'professional',
          'detailed',
          'onyx',
          true,
          0
        ),
        (
          gen_random_uuid()::text,
          NULL,
          'Survey Collector',
          'survey_collector',
          'Friendly agent that collects feedback and survey responses',
          'You are conducting a survey to collect valuable feedback. Ask questions clearly and conversationally, record responses accurately, and thank participants for their time. Be friendly, respectful of their time, and professional throughout.',
          '["friendly", "efficient", "respectful", "clear"]'::jsonb,
          'friendly',
          'concise',
          'fable',
          true,
          0
        )
        ON CONFLICT DO NOTHING;
    """))

    db_session.commit()
    logger.info("✅ Personas migration completed successfully")


def downgrade(db_session):
    """Rollback personas migration"""
    logger.info("🔄 Rolling back personas migration...")

    db_session.execute(text("DROP TABLE IF EXISTS personas CASCADE;"))

    db_session.commit()
    logger.info("✅ Personas migration rolled back successfully")


if __name__ == "__main__":
    # Test migration
    import sys
    import os

    # Add parent directory to path so we can import database module
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal

    db = SessionLocal()
    try:
        upgrade(db)
        print("✅ Personas migration test passed!")
    except Exception as e:
        print(f"❌ Personas migration test failed: {e}")
        db.rollback()
    finally:
        db.close()
