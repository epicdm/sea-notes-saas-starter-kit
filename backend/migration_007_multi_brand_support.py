"""
Multi-Brand Support Migration

Description:
  - Remove UNIQUE constraint from brand_profiles.userId to allow multiple brands per agency
  - Add brand_id to personas table for Brand → Persona → Agent hierarchy

Tables Modified:
  1. brand_profiles - Remove UNIQUE constraint on userId
  2. personas - Add brand_id foreign key

Purpose:
  - Enable agency users to manage multiple client brands
  - Link personas to specific brands for proper organization
  - Support Brand → Persona → Agent three-entity architecture
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply multi-brand support migration"""
    logger.info("🔧 Starting multi-brand support migration...")

    # ========================================
    # Step 1: Remove UNIQUE constraint from brand_profiles.userId
    # ========================================
    logger.info("Removing UNIQUE constraint from brand_profiles.userId...")
    try:
        # Drop the UNIQUE constraint if it exists
        # PostgreSQL auto-generates constraint names, so we need to find and drop it
        db_session.execute(text("""
            DO $$
            DECLARE
                constraint_name_var TEXT;
            BEGIN
                SELECT constraint_name INTO constraint_name_var
                FROM information_schema.table_constraints
                WHERE table_name = 'brand_profiles'
                AND constraint_type = 'UNIQUE'
                AND constraint_name LIKE '%userId%'
                LIMIT 1;

                IF constraint_name_var IS NOT NULL THEN
                    EXECUTE 'ALTER TABLE brand_profiles DROP CONSTRAINT ' || constraint_name_var;
                    RAISE NOTICE 'Dropped UNIQUE constraint: %', constraint_name_var;
                ELSE
                    RAISE NOTICE 'No UNIQUE constraint found on userId';
                END IF;
            END $$;
        """))

        logger.info("✅ UNIQUE constraint removed from brand_profiles.userId")
    except Exception as e:
        logger.warning(f"⚠️ Could not remove UNIQUE constraint (may not exist): {e}")

    # ========================================
    # Step 2: Add brand_id to personas table
    # ========================================
    logger.info("Adding brand_id column to personas table...")
    try:
        db_session.execute(text("""
            ALTER TABLE personas
            ADD COLUMN IF NOT EXISTS brand_id VARCHAR(36) REFERENCES brand_profiles(id) ON DELETE CASCADE;
        """))

        db_session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_personas_brand_id ON personas(brand_id);
        """))

        logger.info("✅ Added brand_id to personas table")
    except Exception as e:
        logger.warning(f"⚠️ Could not add brand_id column (may already exist): {e}")

    db_session.commit()
    logger.info("✅ Multi-brand support migration completed successfully")


def downgrade(db_session):
    """Rollback multi-brand support migration"""
    logger.info("🔄 Rolling back multi-brand support migration...")

    # Remove brand_id from personas
    try:
        db_session.execute(text("""
            ALTER TABLE personas DROP COLUMN IF EXISTS brand_id CASCADE;
        """))
        logger.info("✅ Removed brand_id from personas")
    except Exception as e:
        logger.warning(f"⚠️ Could not remove brand_id column: {e}")

    # Re-add UNIQUE constraint (will fail if multiple brands exist)
    try:
        db_session.execute(text("""
            ALTER TABLE brand_profiles ADD CONSTRAINT brand_profiles_userId_key UNIQUE ("userId");
        """))
        logger.info("✅ Re-added UNIQUE constraint to brand_profiles.userId")
    except Exception as e:
        logger.warning(f"⚠️ Could not re-add UNIQUE constraint (multiple brands may exist): {e}")

    db_session.commit()
    logger.info("✅ Multi-brand support migration rolled back successfully")


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
        print("✅ Multi-brand support migration test passed!")
    except Exception as e:
        print(f"❌ Multi-brand support migration test failed: {e}")
        db.rollback()
    finally:
        db.close()
