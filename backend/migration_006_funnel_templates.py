"""
Funnel Templates Migration

Description:
  - Pre-built funnel templates for quick funnel creation
  - System-provided templates for common use cases
  - Complete configurations ready to deploy

Tables Created:
  1. funnel_templates - Template definitions with complete configurations

Purpose:
  - Enable quick funnel creation from proven templates
  - Reduce time to first funnel
  - Provide best practices examples
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply funnel templates migration"""
    logger.info("🔧 Starting funnel templates migration...")

    # ========================================
    # Table: funnel_templates
    # ========================================
    logger.info("Creating funnel_templates table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS funnel_templates (
          id VARCHAR(36) PRIMARY KEY,

          -- Template Info
          name VARCHAR(255) NOT NULL,
          category VARCHAR(50) NOT NULL,
          -- Categories: lead_capture, appointment, demo, survey, emergency
          description TEXT NOT NULL,

          -- Preview
          "previewImage" TEXT,  -- URL to preview screenshot

          -- Complete Template Data (JSONB)
          -- Structure: {
          --   funnel: {funnelType, themeConfig, seoConfig, trackingConfig},
          --   pages: [{pageOrder, pageType, name, content, formFields}]
          -- }
          "templateData" JSONB NOT NULL,

          -- Meta
          "isActive" BOOLEAN DEFAULT TRUE NOT NULL,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_templates_category ON funnel_templates(category);
        CREATE INDEX IF NOT EXISTS idx_templates_active ON funnel_templates("isActive");
    """))

    db_session.commit()
    logger.info("✅ Funnel templates migration completed successfully!")


def downgrade(db_session):
    """Rollback funnel templates migration"""
    logger.info("🔄 Rolling back funnel templates migration...")

    db_session.execute(text("DROP TABLE IF EXISTS funnel_templates CASCADE;"))

    db_session.commit()
    logger.info("✅ Funnel templates migration rolled back successfully!")


if __name__ == "__main__":
    """Run migration standalone"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal
    import logging

    logging.basicConfig(level=logging.INFO)
    logger.info("Running migration_006_funnel_templates.py...")

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
