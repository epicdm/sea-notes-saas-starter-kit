"""
Working Test Data Seeder for Brand Analytics - v2

Creates test data using exact schema from database.py with all required fields.

Usage:
    python backend/tests/seed_test_data_v2.py
    python backend/tests/seed_test_data_v2.py --clear
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from database import SessionLocal, BrandProfile, Persona, AgentConfig, CallLog, User
from datetime import datetime, timedelta
import random
import uuid


def clear_test_data(session):
    """Clear existing test data"""
    print("Clearing existing test data...")

    # Delete in reverse order of dependencies
    test_agents = session.query(AgentConfig).join(Persona).filter(
        Persona.brandProfileId == "test-brand-123"
    ).all()

    test_agent_ids = [agent.id for agent in test_agents]

    if test_agent_ids:
        session.query(CallLog).filter(CallLog.agentConfigId.in_(test_agent_ids)).delete(synchronize_session=False)

    session.query(AgentConfig).filter(AgentConfig.personaId.in_(
        session.query(Persona.id).filter(Persona.brandProfileId == "test-brand-123")
    )).delete(synchronize_session=False)

    session.query(Persona).filter(Persona.brandProfileId == "test-brand-123").delete()
    session.query(BrandProfile).filter(BrandProfile.id == "test-brand-123").delete()

    session.commit()
    print("✓ Test data cleared")


def seed_test_data(session):
    """Seed test data for brand analytics"""
    print("Seeding test data...")

    # 1. Ensure test user exists
    test_user = session.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            name="Test User",
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
            isActive=True,
            onboardingCompleted=True
        )
        session.add(test_user)
        session.commit()
        print("✓ Created test user")

    # 2. Create test brand
    brand = BrandProfile(
        id="test-brand-123",
        userId=test_user.id,
        companyName="Test Company",
        industry="Technology",
        websiteUrl="https://testcompany.com",
        brandData={"business_description": "Test company for E2E testing"},
        autoExtractEnabled=True,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    session.add(brand)
    print("✓ Created test brand: test-brand-123")

    # 3. Create test personas with all required fields
    personas = []
    for i in range(2):
        persona = Persona(
            id=f"test-persona-{i+1}",
            userId=test_user.id,
            brandProfileId="test-brand-123",
            name=f"Test Persona {i+1}",
            type="customer_support",
            description=f"Test persona {i+1} for testing",
            instructions=f"You are Test Persona {i+1}. Respond professionally to customer inquiries.",
            tone="professional",
            languageStyle="clear",
            capabilities={
                "can_transfer": True,
                "can_schedule": False,
                "can_process_payments": False
            },
            tools=[],
            agentCount=0,
            isTemplate=False,
            createdAt=datetime.now(),
            updatedAt=datetime.now()
        )
        session.add(persona)
        personas.append(persona)
    print(f"✓ Created {len(personas)} test personas")

    # 4. Create test agents with all required fields
    agents = []
    for i, persona in enumerate(personas):
        for j in range(2):
            agent = AgentConfig(
                id=f"test-agent-{i*2+j+1}",
                userId=test_user.id,
                personaId=persona.id,
                brandProfileId="test-brand-123",
                name=f"Test Agent {i*2+j+1}",
                agentType="voice",
                instructions=persona.instructions,
                llmProvider="openai",
                llmModel="gpt-4o-mini",
                sttProvider="deepgram",
                sttModel="nova-2",
                ttsProvider="openai",
                ttsVoiceId="echo",
                voice="echo",
                vadEnabled=True,
                vadProvider="silero",
                noiseCancellationEnabled=False,
                preemptiveGeneration=False,
                resumeFalseInterruption=False,
                greetingEnabled=True,
                greetingMessage="Hello, how can I help you?",
                channels={"voice": True, "chat": False},
                isActive=True,
                createdAt=datetime.now(),
                updatedAt=datetime.now()
            )
            session.add(agent)
            agents.append(agent)
    print(f"✓ Created {len(agents)} test agents")

    session.commit()

    # 5. Create test calls
    outcomes = ["completed", "failed", "no-answer", "busy"]
    directions = ["inbound", "outbound"]

    calls_created = 0
    now = datetime.now()

    # Create calls for last 90 days
    for days_ago in range(90):
        date = now - timedelta(days=days_ago)

        # Random number of calls per day (5-15)
        num_calls = random.randint(5, 15)

        for _ in range(num_calls):
            agent = random.choice(agents)
            outcome = random.choice(outcomes)

            # Completed calls have longer duration
            if outcome == "completed":
                duration = random.randint(60, 300)
            else:
                duration = random.randint(10, 60)

            call = CallLog(
                id=str(uuid.uuid4()),
                userId=test_user.id,
                agentConfigId=agent.id,
                direction=random.choice(directions),
                phoneNumber=f"+1555000{random.randint(1000, 9999)}",
                duration=duration,
                durationSeconds=duration,
                startedAt=date - timedelta(seconds=duration),
                endedAt=date,
                outcome=outcome,
                createdAt=date,
                updatedAt=date
            )
            session.add(call)
            calls_created += 1

            if calls_created % 100 == 0:
                session.commit()

    session.commit()
    print(f"✓ Created {calls_created} test calls across 90 days")

    print("\n✅ Test data seeding complete!")
    print(f"\nTest Data Summary:")
    print(f"  Brand ID: test-brand-123")
    print(f"  User Email: test@example.com")
    print(f"  Personas: {len(personas)}")
    print(f"  Agents: {len(agents)}")
    print(f"  Calls: {calls_created}")
    print(f"\nYou can now run E2E tests with this data.")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Seed test data for brand analytics")
    parser.add_argument("--clear", action="store_true", help="Clear existing test data first")
    args = parser.parse_args()

    session = SessionLocal()

    try:
        if args.clear:
            clear_test_data(session)

        seed_test_data(session)

    except Exception as e:
        print(f"\n❌ Error seeding test data: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
