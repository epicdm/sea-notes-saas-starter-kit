"""
Test script for updated Persona API endpoints with multi-channel support.

Tests:
1. GET /api/user/personas - List personas with new fields
2. POST /api/user/personas - Create persona with multi-channel fields
3. GET /api/user/personas/:id - Get single persona
4. PUT /api/user/personas/:id - Update persona with new fields
5. DELETE /api/user/personas/:id - Delete persona
6. GET /api/system/persona-templates - List persona templates
"""

import requests
import json

BASE_URL = "http://localhost:5001"

# Test user credentials (you'll need to adjust these)
TEST_USER_EMAIL = "admin@example.com"  # Adjust as needed
TEST_USER_PASSWORD = "password"  # Adjust as needed


def login():
    """Login and get session cookies"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )
    if response.status_code == 200:
        print("✅ Login successful")
        return response.cookies
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None


def test_get_personas(cookies):
    """Test GET /api/user/personas"""
    print("\n🧪 Test 1: GET /api/user/personas")

    response = requests.get(f"{BASE_URL}/api/user/personas", cookies=cookies)

    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            personas = data.get('data', [])
            print(f"✅ Retrieved {len(personas)} personas")

            # Check if new fields are present
            if personas:
                persona = personas[0]
                has_new_fields = all(k in persona for k in [
                    'voiceConfig', 'capabilities', 'tools', 'brandProfileId'
                ])
                if has_new_fields:
                    print(f"✅ New multi-channel fields present")
                    print(f"   Capabilities: {persona.get('capabilities')}")
                    print(f"   Tools: {len(persona.get('tools', []))} tools")
                    print(f"   VoiceConfig: {persona.get('voiceConfig', {}).get('provider', 'N/A')}")
                else:
                    print(f"⚠️ Some new fields missing")
            return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False


def test_create_persona(cookies):
    """Test POST /api/user/personas"""
    print("\n🧪 Test 2: POST /api/user/personas (Create Multi-Channel Persona)")

    persona_data = {
        "name": "Test Multi-Channel Agent",
        "type": "customer_service",
        "description": "Test persona with all 5 channels",
        "instructions": "You are a test agent supporting all communication channels.",
        "personalityTraits": ["helpful", "adaptable", "professional"],
        "tone": "friendly",
        "languageStyle": "conversational",
        "voiceConfig": {
            "voice_id": "nova",
            "provider": "openai",
            "model": "tts-1",
            "speed": 1.0,
            "stability": 0.75
        },
        "capabilities": ["voice", "chat", "whatsapp", "email", "sms"],
        "tools": [
            {"name": "ticket_creation", "description": "Create support ticket", "enabled": True},
            {"name": "knowledge_base", "description": "Search knowledge base", "enabled": True}
        ]
    }

    response = requests.post(
        f"{BASE_URL}/api/user/personas",
        json=persona_data,
        cookies=cookies
    )

    if response.status_code == 201:
        data = response.json()
        if data.get('success'):
            persona = data.get('data', {})
            persona_id = persona.get('id')
            print(f"✅ Created persona: {persona.get('name')}")
            print(f"   ID: {persona_id}")
            print(f"   Capabilities: {persona.get('capabilities')}")
            print(f"   Tools: {len(persona.get('tools', []))}")
            return persona_id
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None


def test_get_single_persona(cookies, persona_id):
    """Test GET /api/user/personas/:id"""
    print(f"\n🧪 Test 3: GET /api/user/personas/{persona_id}")

    response = requests.get(
        f"{BASE_URL}/api/user/personas/{persona_id}",
        cookies=cookies
    )

    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            persona = data.get('data', {})
            print(f"✅ Retrieved persona: {persona.get('name')}")
            print(f"   Capabilities: {persona.get('capabilities')}")
            print(f"   Tools: {len(persona.get('tools', []))}")
            print(f"   VoiceConfig: {persona.get('voiceConfig', {})}")
            return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False


def test_update_persona(cookies, persona_id):
    """Test PUT /api/user/personas/:id"""
    print(f"\n🧪 Test 4: PUT /api/user/personas/{persona_id}")

    update_data = {
        "capabilities": ["voice", "chat"],  # Reduce to 2 channels
        "tools": [
            {"name": "escalation", "description": "Escalate to human", "enabled": True}
        ]
    }

    response = requests.put(
        f"{BASE_URL}/api/user/personas/{persona_id}",
        json=update_data,
        cookies=cookies
    )

    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✅ Updated persona")
            print(f"   Message: {data.get('message', '')}")
            return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False


def test_get_persona_templates(cookies):
    """Test GET /api/system/persona-templates"""
    print("\n🧪 Test 5: GET /api/system/persona-templates")

    response = requests.get(f"{BASE_URL}/api/system/persona-templates")

    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            templates = data.get('data', [])
            print(f"✅ Retrieved {len(templates)} persona templates")
            for template in templates:
                print(f"   - {template.get('name')} ({template.get('category')})")
                template_data = template.get('templateData', {})
                print(f"     Capabilities: {template_data.get('capabilities', [])}")
                print(f"     Tools: {len(template_data.get('tools', []))}")
            return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False


def test_delete_persona(cookies, persona_id):
    """Test DELETE /api/user/personas/:id"""
    print(f"\n🧪 Test 6: DELETE /api/user/personas/{persona_id}")

    response = requests.delete(
        f"{BASE_URL}/api/user/personas/{persona_id}",
        cookies=cookies
    )

    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✅ Deleted persona")
            print(f"   Message: {data.get('message', '')}")
            return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return False


def test_validation(cookies):
    """Test validation for capabilities and tools"""
    print("\n🧪 Test 7: Validation Tests")

    # Test 1: Invalid capability
    print("  7a. Test invalid capability...")
    response = requests.post(
        f"{BASE_URL}/api/user/personas",
        json={
            "name": "Invalid Test",
            "type": "test",
            "instructions": "Test",
            "capabilities": ["invalid_channel"]
        },
        cookies=cookies
    )
    if response.status_code == 400:
        print("  ✅ Correctly rejected invalid capability")
    else:
        print(f"  ❌ Should have rejected (got {response.status_code})")

    # Test 2: Empty capabilities
    print("  7b. Test empty capabilities...")
    response = requests.post(
        f"{BASE_URL}/api/user/personas",
        json={
            "name": "Empty Test",
            "type": "test",
            "instructions": "Test",
            "capabilities": []
        },
        cookies=cookies
    )
    if response.status_code == 400:
        print("  ✅ Correctly rejected empty capabilities")
    else:
        print(f"  ❌ Should have rejected (got {response.status_code})")

    # Test 3: Invalid tools format
    print("  7c. Test invalid tools format...")
    response = requests.post(
        f"{BASE_URL}/api/user/personas",
        json={
            "name": "Invalid Tools Test",
            "type": "test",
            "instructions": "Test",
            "tools": "not_an_array"
        },
        cookies=cookies
    )
    if response.status_code == 400:
        print("  ✅ Correctly rejected invalid tools format")
    else:
        print(f"  ❌ Should have rejected (got {response.status_code})")


def run_all_tests():
    """Run all API tests"""
    print("=" * 60)
    print("🧪 Persona API Multi-Channel Test Suite")
    print("=" * 60)

    # Login
    cookies = login()
    if not cookies:
        print("\n❌ Cannot proceed without login")
        return False

    # Run tests
    test_get_personas(cookies)
    persona_id = test_create_persona(cookies)

    if persona_id:
        test_get_single_persona(cookies, persona_id)
        test_update_persona(cookies, persona_id)
        test_get_persona_templates(cookies)
        test_validation(cookies)
        test_delete_persona(cookies, persona_id)

    print("\n" + "=" * 60)
    print("✅ All API tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
