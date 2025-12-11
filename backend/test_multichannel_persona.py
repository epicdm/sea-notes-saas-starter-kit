"""
Test script for multi-channel persona functionality.

Tests:
1. Create persona with all 5 channels
2. Create persona with voice only (backward compatibility)
3. Update persona to add channels
4. Verify voice_config, capabilities, and tools
"""

import sys
import os
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, Persona
from sqlalchemy import text


def test_create_multichannel_persona(db):
    """Test creating a persona with all 5 channels."""
    print("\n🧪 Test 1: Create multi-channel persona...")

    persona_id = str(uuid.uuid4())

    # Create persona with all channels
    db.execute(text("""
        INSERT INTO personas (
            id, "userId", name, type, description, instructions,
            "voiceConfig", capabilities, tools,
            "personalityTraits", tone, "languageStyle",
            "isTemplate", "agentCount"
        ) VALUES (
            :id,
            NULL,  -- System template
            'Omni-Channel Assistant',
            'customer_service',
            'Multi-channel customer service agent supporting voice, chat, WhatsApp, email, and SMS',
            'You are a helpful assistant available across all communication channels. Adapt your communication style to the channel being used while maintaining consistent personality.',
            :voice_config,
            :capabilities,
            :tools,
            '["helpful", "adaptable", "professional", "responsive"]'::jsonb,
            'professional',
            'adaptable',
            true,
            0
        )
    """), {
        "id": persona_id,
        "voice_config": """{
            "voice_id": "nova",
            "provider": "openai",
            "model": "tts-1",
            "speed": 1.0,
            "stability": 0.75
        }""",
        "capabilities": '["voice", "chat", "whatsapp", "email", "sms"]',
        "tools": """[
            {"name": "ticket_creation", "description": "Create support ticket", "enabled": true},
            {"name": "knowledge_base", "description": "Search knowledge base", "enabled": true},
            {"name": "escalation", "description": "Escalate to human agent", "enabled": true}
        ]"""
    })

    db.commit()

    # Verify creation
    result = db.execute(text("""
        SELECT id, name, type, capabilities, tools, "voiceConfig"
        FROM personas
        WHERE id = :id
    """), {"id": persona_id}).fetchone()

    assert result is not None, "Persona not created"
    assert result[1] == 'Omni-Channel Assistant', f"Name mismatch: {result[1]}"
    assert len(result[3]) == 5, f"Expected 5 capabilities, got {len(result[3])}"
    assert "voice" in result[3], "Voice capability missing"
    assert "chat" in result[3], "Chat capability missing"
    assert "whatsapp" in result[3], "WhatsApp capability missing"
    assert "email" in result[3], "Email capability missing"
    assert "sms" in result[3], "SMS capability missing"
    assert len(result[4]) == 3, f"Expected 3 tools, got {len(result[4])}"
    assert result[5] is not None, "Voice config missing"
    assert result[5].get("voice_id") == "nova", f"Voice ID mismatch: {result[5].get('voice_id')}"

    print(f"✅ Multi-channel persona created: {result[1]}")
    print(f"   Capabilities: {', '.join(result[3])}")
    print(f"   Tools: {len(result[4])} enabled")
    print(f"   Voice: {result[5].get('voice_id')} ({result[5].get('provider')})")

    return persona_id


def test_voice_only_persona(db):
    """Test creating a voice-only persona (backward compatibility)."""
    print("\n🧪 Test 2: Create voice-only persona...")

    persona_id = str(uuid.uuid4())

    # Create simple voice-only persona
    db.execute(text("""
        INSERT INTO personas (
            id, "userId", name, type, instructions,
            capabilities, tools, "isTemplate", "agentCount"
        ) VALUES (
            :id,
            NULL,
            'Simple Voice Agent',
            'customer_service',
            'You answer calls professionally.',
            '["voice"]'::jsonb,
            '[]'::jsonb,
            true,
            0
        )
    """), {"id": persona_id})

    db.commit()

    # Verify creation
    result = db.execute(text("""
        SELECT id, name, capabilities, tools
        FROM personas
        WHERE id = :id
    """), {"id": persona_id}).fetchone()

    assert result is not None, "Voice-only persona not created"
    assert len(result[2]) == 1, f"Expected 1 capability, got {len(result[2])}"
    assert result[2][0] == "voice", f"Expected voice capability, got {result[2][0]}"
    assert len(result[3]) == 0, f"Expected 0 tools, got {len(result[3])}"

    print(f"✅ Voice-only persona created: {result[1]}")
    print(f"   Capabilities: {', '.join(result[2])}")

    return persona_id


def test_update_persona_channels(db):
    """Test updating persona to add more channels."""
    print("\n🧪 Test 3: Update persona to add channels...")

    # Create initial voice-only persona
    persona_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO personas (
            id, "userId", name, type, instructions,
            capabilities, "isTemplate"
        ) VALUES (
            :id, NULL, 'Expandable Agent', 'sales',
            'You are a sales agent.',
            '["voice"]'::jsonb, true
        )
    """), {"id": persona_id})
    db.commit()

    # Update to add chat and email
    db.execute(text("""
        UPDATE personas
        SET capabilities = '["voice", "chat", "email"]'::jsonb,
            tools = '[{"name": "calendar_booking", "enabled": true}]'::jsonb
        WHERE id = :id
    """), {"id": persona_id})
    db.commit()

    # Verify update
    result = db.execute(text("""
        SELECT name, capabilities, tools
        FROM personas
        WHERE id = :id
    """), {"id": persona_id}).fetchone()

    assert len(result[1]) == 3, f"Expected 3 capabilities after update, got {len(result[1])}"
    assert "voice" in result[1], "Voice capability lost after update"
    assert "chat" in result[1], "Chat capability not added"
    assert "email" in result[1], "Email capability not added"
    assert len(result[2]) == 1, f"Expected 1 tool after update, got {len(result[2])}"

    print(f"✅ Persona updated: {result[0]}")
    print(f"   New capabilities: {', '.join(result[1])}")
    print(f"   New tools: {len(result[2])}")

    return persona_id


def test_persona_templates(db):
    """Test persona template functionality."""
    print("\n🧪 Test 4: Verify persona templates...")

    # Check seeded templates
    result = db.execute(text("""
        SELECT name, category, "templateData"
        FROM persona_templates
        WHERE "isActive" = true
        ORDER BY name
    """)).fetchall()

    assert len(result) >= 3, f"Expected at least 3 templates, got {len(result)}"

    print(f"✅ Found {len(result)} active persona templates:")
    for row in result:
        template_data = row[2]
        capabilities = template_data.get("capabilities", [])
        print(f"   - {row[0]} ({row[1]})")
        print(f"     Capabilities: {', '.join(capabilities)}")
        print(f"     Tools: {len(template_data.get('tools', []))}")


def test_backward_compatibility(db):
    """Test that existing personas still work."""
    print("\n🧪 Test 5: Check backward compatibility...")

    # Check existing personas have default capabilities
    result = db.execute(text("""
        SELECT id, name, capabilities
        FROM personas
        WHERE "userId" IS NULL
        AND "isTemplate" = true
        LIMIT 3
    """)).fetchall()

    print(f"✅ Found {len(result)} existing system personas:")
    for row in result:
        capabilities = row[2] if row[2] else ["voice"]
        print(f"   - {row[1]}: {', '.join(capabilities)}")
        assert len(capabilities) > 0, f"Persona {row[1]} has no capabilities"


def test_instruction_compilation(db):
    """Test instruction compilation utility."""
    print("\n🧪 Test 6: Test instruction compilation...")

    from backend.utils.instruction_compiler import compile_instructions

    # Get a test persona
    persona = db.execute(text("""
        SELECT id FROM personas
        WHERE "isTemplate" = true
        LIMIT 1
    """)).fetchone()

    if persona:
        instructions = compile_instructions(
            db_session=db,
            persona_id=persona[0],
            channel="voice"
        )

        assert len(instructions) > 0, "Compiled instructions are empty"
        assert "Personality:" in instructions, "Persona section missing from instructions"
        assert "Channel: VOICE" in instructions, "Channel section missing from instructions"

        print(f"✅ Instruction compilation successful")
        print(f"   Length: {len(instructions)} characters")
        print(f"   Contains persona: {'Yes' if 'Personality:' in instructions else 'No'}")
        print(f"   Contains channel info: {'Yes' if 'Channel:' in instructions else 'No'}")
    else:
        print("⚠️ No persona found for testing")


def run_all_tests():
    """Run all test cases."""
    print("=" * 60)
    print("🧪 Multi-Channel Persona Test Suite")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Run tests
        persona_1 = test_create_multichannel_persona(db)
        persona_2 = test_voice_only_persona(db)
        persona_3 = test_update_persona_channels(db)
        test_persona_templates(db)
        test_backward_compatibility(db)
        test_instruction_compilation(db)

        # Cleanup test personas
        db.execute(text("""
            DELETE FROM personas
            WHERE id IN (:id1, :id2, :id3)
        """), {"id1": persona_1, "id2": persona_2, "id3": persona_3})
        db.commit()

        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return True

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    except Exception as e:
        print(f"\n❌ Error during tests: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
