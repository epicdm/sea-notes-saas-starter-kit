"""
Agent-Persona Architecture Migration

Description:
  - Update agent_configs table to reference personas and brand profiles
  - Add agent type (inbound, outbound, hybrid)
  - Separate agent identity from personality (persona)
  - Enable computed instructions (persona + brand context)

Tables Updated:
  1. agent_configs - Add persona_id, brand_profile_id, agent_type

Purpose:
  - Agents reference reusable personas instead of embedding instructions
  - Agent instructions are computed: persona.instructions + brand_context
  - Update persona once, all agents using it automatically update
  - Support different agent types for routing logic
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply agent-persona reference migration"""
    logger.info("🔧 Starting agent-persona reference migration...")

    # ========================================
    # Update: agent_configs table
    # ========================================
    logger.info("Updating agent_configs table with persona and brand references...")

    db_session.execute(text("""
        -- Add new columns
        ALTER TABLE agent_configs
          ADD COLUMN IF NOT EXISTS "agentType" VARCHAR(50) DEFAULT 'inbound',
          ADD COLUMN IF NOT EXISTS "personaId" VARCHAR(36),
          ADD COLUMN IF NOT EXISTS "brandProfileId" VARCHAR(36);

        -- Add foreign key constraints
        -- Note: We allow NULL for now for backward compatibility
        -- New agents will require personaId, but existing agents can keep their embedded instructions
        ALTER TABLE agent_configs
          ADD CONSTRAINT fk_agent_persona
            FOREIGN KEY ("personaId")
            REFERENCES personas(id)
            ON DELETE RESTRICT;  -- Prevent deleting persona if agents use it

        ALTER TABLE agent_configs
          ADD CONSTRAINT fk_agent_brand_profile
            FOREIGN KEY ("brandProfileId")
            REFERENCES brand_profiles(id)
            ON DELETE SET NULL;  -- If brand profile deleted, agents continue with no brand context

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS idx_agent_configs_persona ON agent_configs("personaId");
        CREATE INDEX IF NOT EXISTS idx_agent_configs_brand ON agent_configs("brandProfileId");
        CREATE INDEX IF NOT EXISTS idx_agent_configs_type ON agent_configs("agentType");
    """))

    # ========================================
    # Add trigger to update persona.agentCount
    # ========================================
    logger.info("Creating trigger to track persona usage...")

    db_session.execute(text("""
        -- Function to increment persona agent count
        CREATE OR REPLACE FUNCTION increment_persona_agent_count()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW."personaId" IS NOT NULL THEN
            UPDATE personas
            SET "agentCount" = "agentCount" + 1
            WHERE id = NEW."personaId";
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Function to decrement persona agent count
        CREATE OR REPLACE FUNCTION decrement_persona_agent_count()
        RETURNS TRIGGER AS $$
        BEGIN
          IF OLD."personaId" IS NOT NULL THEN
            UPDATE personas
            SET "agentCount" = GREATEST("agentCount" - 1, 0)
            WHERE id = OLD."personaId";
          END IF;
          RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;

        -- Function to handle persona changes
        CREATE OR REPLACE FUNCTION update_persona_agent_count()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Decrement old persona
          IF OLD."personaId" IS NOT NULL AND OLD."personaId" != NEW."personaId" THEN
            UPDATE personas
            SET "agentCount" = GREATEST("agentCount" - 1, 0)
            WHERE id = OLD."personaId";
          END IF;

          -- Increment new persona
          IF NEW."personaId" IS NOT NULL AND OLD."personaId" != NEW."personaId" THEN
            UPDATE personas
            SET "agentCount" = "agentCount" + 1
            WHERE id = NEW."personaId";
          END IF;

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create triggers
        DROP TRIGGER IF EXISTS trigger_agent_persona_insert ON agent_configs;
        CREATE TRIGGER trigger_agent_persona_insert
          AFTER INSERT ON agent_configs
          FOR EACH ROW
          EXECUTE FUNCTION increment_persona_agent_count();

        DROP TRIGGER IF EXISTS trigger_agent_persona_delete ON agent_configs;
        CREATE TRIGGER trigger_agent_persona_delete
          AFTER DELETE ON agent_configs
          FOR EACH ROW
          EXECUTE FUNCTION decrement_persona_agent_count();

        DROP TRIGGER IF EXISTS trigger_agent_persona_update ON agent_configs;
        CREATE TRIGGER trigger_agent_persona_update
          AFTER UPDATE OF "personaId" ON agent_configs
          FOR EACH ROW
          WHEN (OLD."personaId" IS DISTINCT FROM NEW."personaId")
          EXECUTE FUNCTION update_persona_agent_count();
    """))

    db_session.commit()
    logger.info("✅ Agent-persona reference migration completed successfully")


def downgrade(db_session):
    """Rollback agent-persona reference migration"""
    logger.info("🔄 Rolling back agent-persona reference migration...")

    # Drop triggers first
    db_session.execute(text("""
        DROP TRIGGER IF EXISTS trigger_agent_persona_insert ON agent_configs;
        DROP TRIGGER IF EXISTS trigger_agent_persona_delete ON agent_configs;
        DROP TRIGGER IF EXISTS trigger_agent_persona_update ON agent_configs;
        DROP FUNCTION IF EXISTS increment_persona_agent_count();
        DROP FUNCTION IF EXISTS decrement_persona_agent_count();
        DROP FUNCTION IF EXISTS update_persona_agent_count();
    """))

    # Drop constraints and columns
    db_session.execute(text("""
        ALTER TABLE agent_configs
          DROP CONSTRAINT IF EXISTS fk_agent_persona,
          DROP CONSTRAINT IF EXISTS fk_agent_brand_profile,
          DROP COLUMN IF EXISTS "agentType",
          DROP COLUMN IF EXISTS "personaId",
          DROP COLUMN IF EXISTS "brandProfileId";
    """))

    db_session.commit()
    logger.info("✅ Agent-persona reference migration rolled back successfully")


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
        print("✅ Agent-persona reference migration test passed!")
    except Exception as e:
        print(f"❌ Agent-persona reference migration test failed: {e}")
        db.rollback()
    finally:
        db.close()
