"""
Direct database test for multi-channel persona API
Tests persona creation and retrieval through ORM
"""

import sys
import os
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, Persona, User
from datetime import datetime


def test_persona_orm():
    """Test persona creation through ORM"""
    print("\n🧪 Testing Multi-Channel Persona via ORM")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Get a test user
        user = db.query(User).first()
        if not user:
            print("❌ No users found in database")
            return False

        print(f"✅ Using test user: {user.email}")

        # Create test persona with all 5 channels
        persona = Persona(
            id=str(uuid.uuid4()),
            userId=user.id,
            name="API Test Multi-Channel Persona",
            type="customer_service",
            description="Test persona created via ORM",
            instructions="You are a test agent supporting all channels.",
            personalityTraits=["helpful", "test"],
            tone="professional",
            languageStyle="conversational",
            voiceConfig={
                "voice_id": "nova",
                "provider": "openai",
                "model": "tts-1",
                "speed": 1.0,
                "stability": 0.75
            },
            capabilities=["voice", "chat", "whatsapp", "email", "sms"],
            tools=[
                {"name": "test_tool", "description": "Test tool", "enabled": True}
            ],
            isTemplate=False,
            agentCount=0,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )

        db.add(persona)
        db.commit()
        db.refresh(persona)

        print(f"\n✅ Created persona: {persona.name}")
        print(f"   ID: {persona.id}")
        print(f"   User: {persona.userId}")
        print(f"   Capabilities: {persona.capabilities}")
        print(f"   Tools: {persona.tools}")
        print(f"   VoiceConfig: {persona.voiceConfig}")
        print(f"   BrandProfileId: {persona.brandProfileId}")

        # Verify retrieval
        retrieved = db.query(Persona).filter(Persona.id == persona.id).first()
        if retrieved:
            print(f"\n✅ Successfully retrieved persona")
            print(f"   Name: {retrieved.name}")
            print(f"   Capabilities: {retrieved.capabilities}")
            print(f"   Tools count: {len(retrieved.tools)}")

            # Verify all fields are accessible
            assert retrieved.voiceConfig is not None, "voiceConfig is None"
            assert retrieved.capabilities is not None, "capabilities is None"
            assert retrieved.tools is not None, "tools is None"
            assert len(retrieved.capabilities) == 5, f"Expected 5 capabilities, got {len(retrieved.capabilities)}"

            print(f"\n✅ All field validations passed")

            # Cleanup
            db.delete(retrieved)
            db.commit()
            print(f"\n✅ Cleaned up test persona")

            return True
        else:
            print(f"\n❌ Failed to retrieve persona")
            return False

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


def test_persona_relationships():
    """Test persona relationships"""
    print("\n🧪 Testing Persona Relationships")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Get a persona
        persona = db.query(Persona).filter(Persona.isTemplate == True).first()

        if not persona:
            print("❌ No personas found")
            return False

        print(f"✅ Found persona: {persona.name}")
        print(f"   Capabilities: {persona.capabilities}")
        print(f"   Agent count: {persona.agentCount}")
        print(f"   Tools: {len(persona.tools)} tools")

        # Check if user relationship works
        if persona.userId:
            print(f"   Owner: {persona.user.email if persona.user else 'N/A'}")
        else:
            print(f"   Owner: System template (no user)")

        # Check if brand profile relationship works
        if persona.brandProfileId and persona.brand_profile:
            print(f"   Brand: {persona.brand_profile.companyName}")
        else:
            print(f"   Brand: No brand profile")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Multi-Channel Persona ORM Test Suite")
    print("=" * 60)

    success1 = test_persona_orm()
    success2 = test_persona_relationships()

    print("\n" + "=" * 60)
    if success1 and success2:
        print("✅ All ORM tests passed!")
    else:
        print("❌ Some tests failed")
    print("=" * 60)

    sys.exit(0 if (success1 and success2) else 1)
