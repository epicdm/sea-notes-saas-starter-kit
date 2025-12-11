#!/usr/bin/env python3
"""
Persona Architecture Migration Runner

Executes the three-entity architecture migrations in order:
1. Brand Profiles - Company identity and brand voice
2. Personas - Reusable personality templates
3. Agent References - Update agents to reference personas and brand profiles

Usage:
    python run_persona_migrations.py upgrade    # Apply migrations
    python run_persona_migrations.py downgrade  # Rollback migrations
    python run_persona_migrations.py status     # Check migration status
"""

import sys
import os
import logging
from sqlalchemy import text

# Add parent directory to path so we can import database module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_table_exists(db_session, table_name):
    """Check if a table exists in the database"""
    result = db_session.execute(text(f"""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = '{table_name}'
        );
    """))
    return result.scalar()


def migration_status(db_session):
    """Check status of all migrations"""
    logger.info("=" * 60)
    logger.info("MIGRATION STATUS")
    logger.info("=" * 60)

    tables = {
        'brand_profiles': 'Brand Profiles (Migration 001)',
        'personas': 'Personas (Migration 002)',
    }

    for table, description in tables.items():
        exists = check_table_exists(db_session, table)
        status = "✅ Applied" if exists else "❌ Not Applied"
        logger.info(f"{description}: {status}")

    # Check agent_configs columns
    result = db_session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'agent_configs'
        AND column_name IN ('personaId', 'brandProfileId', 'agentType');
    """))
    agent_columns = [row[0] for row in result]

    if len(agent_columns) == 3:
        logger.info("Agent References (Migration 003): ✅ Applied")
    elif len(agent_columns) > 0:
        logger.info(f"Agent References (Migration 003): ⚠️  Partially Applied ({len(agent_columns)}/3 columns)")
    else:
        logger.info("Agent References (Migration 003): ❌ Not Applied")

    logger.info("=" * 60)


def upgrade_all(db_session):
    """Apply all migrations in order"""
    logger.info("🚀 Starting persona architecture migration...")
    logger.info("=" * 60)

    try:
        # Migration 001: Brand Profiles
        from migration_001_brand_profiles import upgrade as upgrade_001
        logger.info("\n📦 Migration 001: Brand Profiles")
        upgrade_001(db_session)

        # Migration 002: Personas
        from migration_002_personas import upgrade as upgrade_002
        logger.info("\n📦 Migration 002: Personas")
        upgrade_002(db_session)

        # Migration 003: Agent References
        from migration_003_agent_persona_refs import upgrade as upgrade_003
        logger.info("\n📦 Migration 003: Agent-Persona References")
        upgrade_003(db_session)

        logger.info("=" * 60)
        logger.info("✅ All migrations completed successfully!")
        logger.info("=" * 60)

        # Show summary
        migration_status(db_session)

        return True

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        logger.error("Rolling back transaction...")
        db_session.rollback()
        return False


def downgrade_all(db_session):
    """Rollback all migrations in reverse order"""
    logger.info("🔄 Starting persona architecture rollback...")
    logger.info("=" * 60)

    try:
        # Rollback in reverse order
        # Migration 003: Agent References
        from migration_003_agent_persona_refs import downgrade as downgrade_003
        logger.info("\n📦 Rolling back Migration 003: Agent-Persona References")
        downgrade_003(db_session)

        # Migration 002: Personas
        from migration_002_personas import downgrade as downgrade_002
        logger.info("\n📦 Rolling back Migration 002: Personas")
        downgrade_002(db_session)

        # Migration 001: Brand Profiles
        from migration_001_brand_profiles import downgrade as downgrade_001
        logger.info("\n📦 Rolling back Migration 001: Brand Profiles")
        downgrade_001(db_session)

        logger.info("=" * 60)
        logger.info("✅ All migrations rolled back successfully!")
        logger.info("=" * 60)

        return True

    except Exception as e:
        logger.error(f"❌ Rollback failed: {e}")
        db_session.rollback()
        return False


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python run_persona_migrations.py [upgrade|downgrade|status]")
        sys.exit(1)

    command = sys.argv[1].lower()

    db = SessionLocal()
    try:
        if command == 'upgrade':
            success = upgrade_all(db)
            sys.exit(0 if success else 1)
        elif command == 'downgrade':
            # Confirm before downgrade
            print("\n⚠️  WARNING: This will rollback all persona architecture changes!")
            print("This is a destructive operation. All brand profiles and personas will be deleted.")
            response = input("Are you sure you want to continue? (yes/no): ")
            if response.lower() == 'yes':
                success = downgrade_all(db)
                sys.exit(0 if success else 1)
            else:
                print("Rollback cancelled.")
                sys.exit(0)
        elif command == 'status':
            migration_status(db)
            sys.exit(0)
        else:
            print(f"Unknown command: {command}")
            print("Usage: python run_persona_migrations.py [upgrade|downgrade|status]")
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
