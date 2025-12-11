"""
Brand Profile System Migration

Description:
  - Add company identity and brand voice management
  - Support AI-powered social media extraction
  - Provide brand context that all agents inherit
  - Enable manual overrides for brand voice and tone

Tables Created:
  1. brand_profiles - Company identity, social media links, extracted brand data

Purpose:
  - One brand profile per user (can be extended to multiple for agencies)
  - All agents inherit brand context from user's brand profile
  - Social media extraction done once, used by all agents
"""

import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)


def upgrade(db_session):
    """Apply brand profiles migration"""
    logger.info("🔧 Starting brand profiles migration...")

    # ========================================
    # Table: brand_profiles
    # ========================================
    logger.info("Creating brand_profiles table...")
    db_session.execute(text("""
        CREATE TABLE IF NOT EXISTS brand_profiles (
          id VARCHAR(36) PRIMARY KEY,
          "userId" VARCHAR(36) NOT NULL UNIQUE,

          -- Company Info
          "companyName" VARCHAR(255) NOT NULL,
          industry VARCHAR(100),
          "logoUrl" TEXT,

          -- Social Media Links
          "facebookUrl" TEXT,
          "instagramUrl" TEXT,
          "linkedinUrl" TEXT,
          "twitterUrl" TEXT,
          "websiteUrl" TEXT,

          -- AI-Extracted Brand Data (JSONB)
          -- Structure: {
          --   business_description: string,
          --   brand_voice: string,
          --   tone_guidelines: string,
          --   target_audience: string,
          --   key_products: string[],
          --   key_services: string[],
          --   company_values: string[],
          --   unique_selling_points: string[],
          --   common_questions: string[],
          --   brand_personality: string,
          --   extracted_at: timestamp,
          --   extraction_source: string
          -- }
          "brandData" JSONB,

          -- Manual Overrides
          "customBrandVoice" TEXT,
          "customToneGuidelines" TEXT,

          -- Do's and Don'ts (JSONB)
          -- Structure: { dos: string[], donts: string[] }
          "dosAndDonts" JSONB,

          -- Settings
          "autoExtractEnabled" BOOLEAN DEFAULT TRUE NOT NULL,
          "lastExtractionAt" TIMESTAMP,

          -- Metadata
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

          CONSTRAINT fk_brand_profile_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_brand_profiles_user ON brand_profiles("userId");
        CREATE INDEX IF NOT EXISTS idx_brand_profiles_created ON brand_profiles("createdAt");
    """))

    db_session.commit()
    logger.info("✅ Brand profiles migration completed successfully")


def downgrade(db_session):
    """Rollback brand profiles migration"""
    logger.info("🔄 Rolling back brand profiles migration...")

    db_session.execute(text("DROP TABLE IF EXISTS brand_profiles CASCADE;"))

    db_session.commit()
    logger.info("✅ Brand profiles migration rolled back successfully")


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
        print("✅ Brand profiles migration test passed!")
    except Exception as e:
        print(f"❌ Brand profiles migration test failed: {e}")
        db.rollback()
    finally:
        db.close()
