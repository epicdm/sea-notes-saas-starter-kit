"""
Instruction Compiler Utility

Purpose:
  Compile complete agent instructions from multiple sources:
  1. Brand Profile (company identity, brand voice, tone guidelines)
  2. Persona (personality, communication style, core instructions)
  3. Agent Config (agent-specific overrides and customizations)
  4. Call Context (channel-specific instructions, lead data, etc.)

The compiled instructions provide a comprehensive prompt that guides
the AI agent's behavior across all channels.

Architecture:
  Brand Context → Persona Instructions → Agent Overrides → Call Context
  [Company DNA] + [Personality]       + [Customizations] + [Situational]
"""

import logging
from typing import Dict, Optional, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class InstructionCompiler:
    """Compiles agent instructions from brand, persona, agent, and context."""

    def __init__(self, db_session: Session):
        """Initialize compiler with database session."""
        self.db = db_session

    def compile(
        self,
        persona_id: Optional[str] = None,
        brand_profile_id: Optional[str] = None,
        agent_config_id: Optional[str] = None,
        custom_instructions: Optional[str] = None,
        call_context: Optional[Dict[str, Any]] = None,
        channel: str = "voice",
    ) -> str:
        """
        Compile complete instructions from all sources.

        Args:
            persona_id: ID of the persona to use
            brand_profile_id: ID of the brand profile
            agent_config_id: ID of the agent config (for retrieving stored custom instructions)
            custom_instructions: Direct custom instructions override
            call_context: Runtime context (lead data, funnel info, etc.)
            channel: Communication channel (voice, chat, whatsapp, email, sms)

        Returns:
            Compiled instruction string ready for AI agent
        """
        sections = []

        # ========================================
        # Section 1: Brand Context
        # ========================================
        brand_context = self._compile_brand_context(brand_profile_id)
        if brand_context:
            sections.append(brand_context)

        # ========================================
        # Section 2: Persona Instructions (Core)
        # ========================================
        persona_instructions = self._compile_persona_instructions(persona_id, channel)
        if persona_instructions:
            sections.append(persona_instructions)
        else:
            # Fallback if no persona provided
            sections.append("You are a helpful AI assistant.")

        # ========================================
        # Section 3: Agent-Specific Overrides
        # ========================================
        agent_overrides = self._compile_agent_overrides(
            agent_config_id, custom_instructions
        )
        if agent_overrides:
            sections.append(agent_overrides)

        # ========================================
        # Section 4: Call/Channel Context
        # ========================================
        context_instructions = self._compile_call_context(call_context, channel)
        if context_instructions:
            sections.append(context_instructions)

        # Join all sections with clear separators
        compiled = "\n\n---\n\n".join(sections)

        logger.debug(
            f"Compiled instructions for persona={persona_id}, brand={brand_profile_id}, "
            f"agent={agent_config_id}, channel={channel}, length={len(compiled)} chars"
        )

        return compiled

    def _compile_brand_context(self, brand_profile_id: Optional[str]) -> Optional[str]:
        """Compile brand profile context section."""
        if not brand_profile_id:
            return None

        try:
            from database import BrandProfile

            brand = (
                self.db.query(BrandProfile)
                .filter(BrandProfile.id == brand_profile_id)
                .first()
            )

            if not brand:
                logger.warning(f"Brand profile {brand_profile_id} not found")
                return None

            sections = []

            # Company Identity
            sections.append(f"# Company Identity")
            sections.append(f"You represent: {brand.companyName}")

            if brand.industry:
                sections.append(f"Industry: {brand.industry}")

            if brand.websiteUrl:
                sections.append(f"Website: {brand.websiteUrl}")

            # Brand Voice & Tone
            if brand.customBrandVoice or (
                brand.brandData and brand.brandData.get("brand_voice")
            ):
                sections.append(f"\n## Brand Voice")
                voice = brand.customBrandVoice or brand.brandData.get("brand_voice")
                sections.append(voice)

            if brand.customToneGuidelines or (
                brand.brandData and brand.brandData.get("tone_guidelines")
            ):
                sections.append(f"\n## Tone Guidelines")
                tone = brand.customToneGuidelines or brand.brandData.get(
                    "tone_guidelines"
                )
                sections.append(tone)

            # Do's and Don'ts
            if brand.dosAndDonts:
                dos = brand.dosAndDonts.get("dos", [])
                donts = brand.dosAndDonts.get("donts", [])

                if dos:
                    sections.append(f"\n## DO:")
                    for item in dos:
                        sections.append(f"- {item}")

                if donts:
                    sections.append(f"\n## DON'T:")
                    for item in donts:
                        sections.append(f"- {item}")

            # Extracted Brand Data
            if brand.brandData:
                if brand.brandData.get("target_audience"):
                    sections.append(f"\n## Target Audience")
                    sections.append(brand.brandData["target_audience"])

                if brand.brandData.get("key_products"):
                    sections.append(f"\n## Key Products/Services")
                    for product in brand.brandData["key_products"]:
                        sections.append(f"- {product}")

                if brand.brandData.get("unique_selling_points"):
                    sections.append(f"\n## Unique Selling Points")
                    for usp in brand.brandData["unique_selling_points"]:
                        sections.append(f"- {usp}")

                if brand.brandData.get("company_values"):
                    sections.append(f"\n## Company Values")
                    for value in brand.brandData["company_values"]:
                        sections.append(f"- {value}")

            return "\n".join(sections)

        except Exception as e:
            logger.error(f"Error compiling brand context: {e}", exc_info=True)
            return None

    def _compile_persona_instructions(
        self, persona_id: Optional[str], channel: str
    ) -> Optional[str]:
        """Compile persona instructions section."""
        if not persona_id:
            return None

        try:
            from database import Persona

            persona = (
                self.db.query(Persona).filter(Persona.id == persona_id).first()
            )

            if not persona:
                logger.warning(f"Persona {persona_id} not found")
                return None

            sections = []

            # Persona Identity
            sections.append(f"# Personality: {persona.name}")

            if persona.description:
                sections.append(persona.description)

            # Core Instructions
            sections.append(f"\n## Core Instructions")
            sections.append(persona.instructions)

            # Communication Style
            if persona.tone or persona.languageStyle:
                sections.append(f"\n## Communication Style")
                if persona.tone:
                    sections.append(f"Tone: {persona.tone}")
                if persona.languageStyle:
                    sections.append(f"Style: {persona.languageStyle}")

            # Personality Traits
            if persona.personalityTraits:
                sections.append(f"\n## Personality Traits")
                traits = ", ".join(persona.personalityTraits)
                sections.append(f"Embody these traits: {traits}")

            # Channel-Specific Instructions
            channel_instructions = self._get_channel_specific_instructions(
                persona, channel
            )
            if channel_instructions:
                sections.append(f"\n## Channel: {channel.upper()}")
                sections.append(channel_instructions)

            # Tools Available
            if persona.tools and len(persona.tools) > 0:
                enabled_tools = [
                    tool for tool in persona.tools if tool.get("enabled", False)
                ]
                if enabled_tools:
                    sections.append(f"\n## Tools Available")
                    for tool in enabled_tools:
                        sections.append(
                            f"- {tool['name']}: {tool.get('description', '')}"
                        )

            return "\n".join(sections)

        except Exception as e:
            logger.error(f"Error compiling persona instructions: {e}", exc_info=True)
            return None

    def _compile_agent_overrides(
        self, agent_config_id: Optional[str], custom_instructions: Optional[str]
    ) -> Optional[str]:
        """Compile agent-specific override instructions."""
        # Direct custom instructions take precedence
        if custom_instructions:
            return f"# Agent-Specific Instructions\n{custom_instructions}"

        # Otherwise, fetch from database
        if not agent_config_id:
            return None

        try:
            from database import AgentConfig

            agent = (
                self.db.query(AgentConfig)
                .filter(AgentConfig.id == agent_config_id)
                .first()
            )

            if not agent or not agent.customInstructions:
                return None

            return f"# Agent-Specific Instructions\n{agent.customInstructions}"

        except Exception as e:
            logger.error(f"Error compiling agent overrides: {e}", exc_info=True)
            return None

    def _compile_call_context(
        self, call_context: Optional[Dict[str, Any]], channel: str
    ) -> Optional[str]:
        """Compile runtime call/channel context."""
        if not call_context:
            return None

        sections = []
        sections.append(f"# Call Context")

        # Lead/Contact Information
        if call_context.get("lead"):
            lead = call_context["lead"]
            sections.append(f"\n## Contact Information")
            if lead.get("name"):
                sections.append(f"Name: {lead['name']}")
            if lead.get("phone"):
                sections.append(f"Phone: {lead['phone']}")
            if lead.get("email"):
                sections.append(f"Email: {lead['email']}")
            if lead.get("company"):
                sections.append(f"Company: {lead['company']}")
            if lead.get("notes"):
                sections.append(f"Notes: {lead['notes']}")

        # Funnel Context
        if call_context.get("funnel"):
            funnel = call_context["funnel"]
            sections.append(f"\n## Funnel Context")
            if funnel.get("name"):
                sections.append(f"Funnel: {funnel['name']}")
            if funnel.get("stage"):
                sections.append(f"Stage: {funnel['stage']}")
            if funnel.get("objective"):
                sections.append(f"Objective: {funnel['objective']}")

        # Campaign Context
        if call_context.get("campaign"):
            campaign = call_context["campaign"]
            sections.append(f"\n## Campaign Context")
            if campaign.get("name"):
                sections.append(f"Campaign: {campaign['name']}")
            if campaign.get("script"):
                sections.append(f"Script Guidelines: {campaign['script']}")

        # Previous Interactions
        if call_context.get("history"):
            history = call_context["history"]
            sections.append(f"\n## Previous Interactions")
            sections.append(f"Previous contacts: {history.get('count', 0)}")
            if history.get("last_outcome"):
                sections.append(f"Last outcome: {history['last_outcome']}")
            if history.get("summary"):
                sections.append(f"Summary: {history['summary']}")

        # Custom Context Variables
        if call_context.get("custom"):
            sections.append(f"\n## Additional Context")
            for key, value in call_context["custom"].items():
                sections.append(f"{key}: {value}")

        return "\n".join(sections) if len(sections) > 1 else None

    def _get_channel_specific_instructions(
        self, persona: Any, channel: str
    ) -> Optional[str]:
        """Get channel-specific behavioral instructions."""
        channel_instructions = {
            "voice": "You are communicating via phone call. Speak naturally, use verbal cues, and be mindful of tone. Keep responses conversational and avoid lengthy monologues.",
            "chat": "You are communicating via text chat. Be concise, use proper formatting, and consider using emojis when appropriate. Break long responses into multiple messages.",
            "whatsapp": "You are communicating via WhatsApp. Keep messages brief, friendly, and mobile-friendly. Use emojis and formatting sparingly but effectively.",
            "email": "You are communicating via email. Structure your responses professionally with clear subject lines, proper greetings, and well-organized content. Use formatting to improve readability.",
            "sms": "You are communicating via SMS. Be extremely concise (160 characters ideally). Get to the point quickly and use abbreviations when appropriate.",
        }

        return channel_instructions.get(channel.lower())


def compile_instructions(
    db_session: Session,
    persona_id: Optional[str] = None,
    brand_profile_id: Optional[str] = None,
    agent_config_id: Optional[str] = None,
    custom_instructions: Optional[str] = None,
    call_context: Optional[Dict[str, Any]] = None,
    channel: str = "voice",
) -> str:
    """
    Helper function to compile instructions without instantiating class.

    Args:
        db_session: Database session
        persona_id: ID of the persona
        brand_profile_id: ID of the brand profile
        agent_config_id: ID of the agent config
        custom_instructions: Direct custom instructions
        call_context: Runtime context dictionary
        channel: Communication channel

    Returns:
        Compiled instruction string
    """
    compiler = InstructionCompiler(db_session)
    return compiler.compile(
        persona_id=persona_id,
        brand_profile_id=brand_profile_id,
        agent_config_id=agent_config_id,
        custom_instructions=custom_instructions,
        call_context=call_context,
        channel=channel,
    )


# Example usage:
if __name__ == "__main__":
    import sys
    import os

    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

    from database import SessionLocal

    db = SessionLocal()
    try:
        # Test compilation
        instructions = compile_instructions(
            db_session=db,
            persona_id="test-persona-id",
            brand_profile_id="test-brand-id",
            channel="voice",
            call_context={
                "lead": {"name": "John Doe", "phone": "+1234567890"},
                "funnel": {"name": "Sales Funnel", "stage": "qualification"},
            },
        )

        print("=== Compiled Instructions ===")
        print(instructions)
        print("=" * 50)

    except Exception as e:
        print(f"Test failed: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()
