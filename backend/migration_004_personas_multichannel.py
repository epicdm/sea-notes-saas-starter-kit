"""
Multi-Channel Persona Migration

Description:
  - Extend personas table to support multi-channel capabilities (voice, chat, whatsapp, email, sms)
  - Add voice configuration, tools, and channel-specific settings
  - Create persona_templates table for system templates
  - Add persona_phone_numbers junction table for channel assignments
  - Extend agent_configs with channels and deployment_mode
  - Enable multi-channel agent deployments

Tables Updated:
  1. personas - Add voice_config, capabilities, tools, brand_profile_id
  2. agent_configs - Add channels, deployment_mode, custom_instructions

Tables Created:
  1. persona_templates - System templates for quick persona creation
  2. personas_phone_numbers - Junction table for persona-phone channel mappings

Purpose:
  - Single persona can handle multiple communication channels
  - Each channel can have custom configuration
  - Agents can deploy to specific channels from their persona
  - Instructions are compiled: brand + persona + agent + channel context
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply multi-channel persona migration"""
    logger.info("🔧 Starting multi-channel persona migration...")

    # ========================================
    # Update: personas table
    # ========================================
    logger.info("Extending personas table for multi-channel support...")

    db_session.execute(text("""
        -- Add multi-channel fields to personas
        ALTER TABLE personas
          ADD COLUMN IF NOT EXISTS "voiceConfig" JSONB,
          ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '["voice"]'::jsonb NOT NULL,
          ADD COLUMN IF NOT EXISTS tools JSONB DEFAULT '[]'::jsonb NOT NULL,
          ADD COLUMN IF NOT EXISTS "brandProfileId" VARCHAR(36);

        -- Add foreign key to brand_profiles
        ALTER TABLE personas
          ADD CONSTRAINT fk_persona_brand_profile
            FOREIGN KEY ("brandProfileId")
            REFERENCES brand_profiles(id)
            ON DELETE SET NULL;  -- If brand profile deleted, persona continues with no brand context

        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_personas_brand ON personas("brandProfileId");
        CREATE INDEX IF NOT EXISTS idx_personas_capabilities ON personas USING GIN (capabilities);

        -- Add comment for capabilities structure
        COMMENT ON COLUMN personas.capabilities IS 'Array of enabled channels: ["voice", "chat", "whatsapp", "email", "sms"]';
        COMMENT ON COLUMN personas."voiceConfig" IS 'Voice configuration: {voice_id, model, speed, stability, provider}';
        COMMENT ON COLUMN personas.tools IS 'Array of tool configurations: [{name, description, parameters, enabled}]';
    """))

    # ========================================
    # Table: persona_templates
    # ========================================
    logger.info("Creating persona_templates table...")

    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS persona_templates (
          id VARCHAR(36) PRIMARY KEY,

          -- Template Info
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,  -- customer_service, sales, support, receptionist, etc.
          description TEXT,

          -- Template Data (Complete persona configuration)
          -- Structure: {name, type, instructions, voice_config, capabilities, tools, personality_traits, tone, language_style}
          "templateData" JSONB NOT NULL,

          -- Visual
          "previewImage" TEXT,  -- URL or path to preview image

          -- Status
          "isActive" BOOLEAN DEFAULT TRUE NOT NULL,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_persona_templates_category ON persona_templates(category);
        CREATE INDEX IF NOT EXISTS idx_persona_templates_active ON persona_templates("isActive");
        CREATE INDEX IF NOT EXISTS idx_persona_templates_created ON persona_templates("createdAt");

        COMMENT ON TABLE persona_templates IS 'System-provided persona templates for quick agent creation';
    """))

    # ========================================
    # Update: agent_configs table
    # ========================================
    logger.info("Extending agent_configs for multi-channel deployments...")

    db_session.execute(text("""
        -- Add multi-channel fields to agent_configs
        ALTER TABLE agent_configs
          ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '{}'::jsonb NOT NULL,
          ADD COLUMN IF NOT EXISTS "deploymentMode" VARCHAR(50) DEFAULT 'production',
          ADD COLUMN IF NOT EXISTS "customInstructions" TEXT;

        -- Add index for deployment mode
        CREATE INDEX IF NOT EXISTS idx_agent_configs_deployment ON agent_configs("deploymentMode");

        -- Add comment for channels structure
        COMMENT ON COLUMN agent_configs.channels IS 'Channel configurations: {voice: {phone_numbers}, chat: {widget_id}, whatsapp: {phone}, email: {address}, sms: {phone}}';
        COMMENT ON COLUMN agent_configs."deploymentMode" IS 'Deployment environment: production, demo, testing';
        COMMENT ON COLUMN agent_configs."customInstructions" IS 'Agent-specific instruction overrides that merge with persona instructions';
    """))

    # ========================================
    # Table: personas_phone_numbers
    # ========================================
    logger.info("Creating personas_phone_numbers junction table...")

    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS personas_phone_numbers (
          id VARCHAR(36) PRIMARY KEY,

          -- References
          "personaId" VARCHAR(36) NOT NULL,
          "phoneNumber" VARCHAR(20) NOT NULL,

          -- Channel Configuration
          "channelType" VARCHAR(20) NOT NULL,  -- voice, sms
          "isPrimary" BOOLEAN DEFAULT FALSE NOT NULL,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_persona_phone_persona
            FOREIGN KEY ("personaId")
            REFERENCES personas(id)
            ON DELETE CASCADE,

          -- Ensure unique phone-channel combinations per persona
          CONSTRAINT uq_persona_phone_channel UNIQUE ("personaId", "phoneNumber", "channelType")
        );

        CREATE INDEX IF NOT EXISTS idx_personas_phones_persona ON personas_phone_numbers("personaId");
        CREATE INDEX IF NOT EXISTS idx_personas_phones_number ON personas_phone_numbers("phoneNumber");
        CREATE INDEX IF NOT EXISTS idx_personas_phones_channel ON personas_phone_numbers("channelType");
        CREATE INDEX IF NOT EXISTS idx_personas_phones_primary ON personas_phone_numbers("isPrimary");

        COMMENT ON TABLE personas_phone_numbers IS 'Maps personas to phone numbers for voice and SMS channels';
    """))

    # ========================================
    # Seed: Convert existing persona templates to multi-channel
    # ========================================
    logger.info("Converting existing personas to multi-channel format...")

    db_session.execute(text("""
        -- Set default capabilities for existing personas (voice only for backward compatibility)
        UPDATE personas
        SET capabilities = '["voice"]'::jsonb
        WHERE capabilities IS NULL OR capabilities::text = '[]';

        -- Set default voice config based on suggestedVoice
        UPDATE personas
        SET "voiceConfig" = jsonb_build_object(
          'voice_id', COALESCE("suggestedVoice", 'alloy'),
          'provider', 'openai',
          'model', 'tts-1',
          'speed', 1.0,
          'stability', 0.75
        )
        WHERE "voiceConfig" IS NULL AND '["voice"]'::jsonb <@ capabilities;

        -- Initialize empty tools array for existing personas
        UPDATE personas
        SET tools = '[]'::jsonb
        WHERE tools IS NULL OR tools::text = 'null';
    """))

    # ========================================
    # Seed: Create initial persona templates
    # ========================================
    logger.info("Creating initial persona templates...")

    db_session.execute(text("""
        INSERT INTO persona_templates (
          id, name, category, description, "templateData", "isActive"
        ) VALUES
        (
          gen_random_uuid()::text,
          'Voice Customer Service',
          'customer_service',
          'Multi-channel customer service agent with voice, chat, and email support',
          '{
            "name": "Customer Service",
            "type": "customer_service",
            "capabilities": ["voice", "chat", "email"],
            "instructions": "You are a helpful customer service agent. Assist customers with their questions, resolve issues efficiently, and ensure satisfaction. Be patient, empathetic, and solution-oriented.",
            "voice_config": {
              "voice_id": "nova",
              "provider": "openai",
              "model": "tts-1",
              "speed": 1.0,
              "stability": 0.75
            },
            "personality_traits": ["helpful", "patient", "empathetic", "solution-focused"],
            "tone": "friendly",
            "language_style": "conversational",
            "tools": [
              {
                "name": "ticket_creation",
                "description": "Create support ticket for complex issues",
                "enabled": true
              },
              {
                "name": "knowledge_base",
                "description": "Search knowledge base for answers",
                "enabled": true
              }
            ]
          }'::jsonb,
          true
        ),
        (
          gen_random_uuid()::text,
          'Omni-Channel Sales SDR',
          'sales',
          'Sales development representative with voice, SMS, and email capabilities',
          '{
            "name": "Sales SDR",
            "type": "sales",
            "capabilities": ["voice", "sms", "email"],
            "instructions": "You are a professional sales development representative. Qualify leads, understand customer needs, and guide them toward solutions. Be consultative, focus on value, and build trust.",
            "voice_config": {
              "voice_id": "alloy",
              "provider": "openai",
              "model": "tts-1",
              "speed": 1.0,
              "stability": 0.8
            },
            "personality_traits": ["persuasive", "consultative", "confident", "value-focused"],
            "tone": "professional",
            "language_style": "detailed",
            "tools": [
              {
                "name": "calendar_booking",
                "description": "Schedule meetings and demos",
                "enabled": true
              },
              {
                "name": "lead_qualification",
                "description": "Assess lead quality and readiness",
                "enabled": true
              },
              {
                "name": "crm_update",
                "description": "Update lead status in CRM",
                "enabled": true
              }
            ]
          }'::jsonb,
          true
        ),
        (
          gen_random_uuid()::text,
          'Appointment Setter',
          'appointment_setter',
          'Organized appointment scheduling agent with voice and SMS',
          '{
            "name": "Appointment Setter",
            "type": "appointment_setter",
            "capabilities": ["voice", "sms"],
            "instructions": "You are an appointment scheduling specialist. Help customers find convenient times, manage bookings, send confirmations, and handle rescheduling. Be organized and detail-oriented.",
            "voice_config": {
              "voice_id": "shimmer",
              "provider": "openai",
              "model": "tts-1",
              "speed": 1.0,
              "stability": 0.75
            },
            "personality_traits": ["organized", "detail-oriented", "helpful", "reliable"],
            "tone": "professional",
            "language_style": "detailed",
            "tools": [
              {
                "name": "calendar_check",
                "description": "Check calendar availability",
                "enabled": true
              },
              {
                "name": "appointment_booking",
                "description": "Book appointments",
                "enabled": true
              },
              {
                "name": "reminder_scheduling",
                "description": "Schedule appointment reminders",
                "enabled": true
              }
            ]
          }'::jsonb,
          true
        )
        ON CONFLICT DO NOTHING;
    """))

    db_session.commit()
    logger.info("✅ Multi-channel persona migration completed successfully")


def downgrade(db_session):
    """Rollback multi-channel persona migration"""
    logger.info("🔄 Rolling back multi-channel persona migration...")

    # Drop new tables
    db_session.execute(text("DROP TABLE IF EXISTS personas_phone_numbers CASCADE;"))
    db_session.execute(text("DROP TABLE IF EXISTS persona_templates CASCADE;"))

    # Remove columns from agent_configs
    db_session.execute(text("""
        ALTER TABLE agent_configs
          DROP COLUMN IF EXISTS channels,
          DROP COLUMN IF EXISTS "deploymentMode",
          DROP COLUMN IF EXISTS "customInstructions";
    """))

    # Remove columns from personas
    db_session.execute(text("""
        ALTER TABLE personas
          DROP CONSTRAINT IF EXISTS fk_persona_brand_profile,
          DROP COLUMN IF EXISTS "voiceConfig",
          DROP COLUMN IF EXISTS capabilities,
          DROP COLUMN IF EXISTS tools,
          DROP COLUMN IF EXISTS "brandProfileId";
    """))

    db_session.commit()
    logger.info("✅ Multi-channel persona migration rolled back successfully")


if __name__ == "__main__":
    # Test migration
    import sys
    import os

    # Add parent directory to path so we can import database module
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal

    db = SessionLocal()
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
            downgrade(db)
            print("✅ Multi-channel persona migration rollback test passed!")
        else:
            upgrade(db)
            print("✅ Multi-channel persona migration test passed!")
    except Exception as e:
        print(f"❌ Multi-channel persona migration test failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
