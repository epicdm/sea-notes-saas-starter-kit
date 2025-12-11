"""
Persona Management API
Endpoints for creating and managing reusable AI agent personas
"""

import os
import uuid
from datetime import datetime
from flask import jsonify, request
from sqlalchemy import text, or_
from database import SessionLocal, Persona, AgentConfig, PersonaTemplate


def setup_persona_endpoints(app):
    """Set up persona API endpoints"""

    @app.route('/api/user/personas', methods=['GET'])
    def get_personas():
        """
        Get all personas (user's custom personas + system templates)

        Query params:
        - include_templates: true/false (default: true)
        - type: filter by persona type
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        include_templates = request.args.get('include_templates', 'true').lower() == 'true'
        persona_type = request.args.get('type')

        db = SessionLocal()
        try:
            # Build query
            query = db.query(Persona)

            if include_templates:
                # Get user personas + system templates
                query = query.filter(
                    or_(
                        Persona.userId == user_id,
                        Persona.isTemplate == True
                    )
                )
            else:
                # Only user personas
                query = query.filter(Persona.userId == user_id)

            if persona_type:
                query = query.filter(Persona.type == persona_type)

            personas = query.order_by(
                Persona.isTemplate.desc(),  # Templates first
                Persona.createdAt.desc()
            ).all()

            return jsonify({
                'success': True,
                'data': [{
                    'id': p.id,
                    'name': p.name,
                    'type': p.type,
                    'description': p.description,
                    'instructions': p.instructions,
                    'personalityTraits': p.personalityTraits or [],
                    'tone': p.tone,
                    'languageStyle': p.languageStyle,
                    'suggestedVoice': p.suggestedVoice,
                    'voiceConfig': p.voiceConfig or {},
                    'capabilities': p.capabilities or ["voice"],
                    'tools': p.tools or [],
                    'brandProfileId': p.brandProfileId,
                    'agentCount': p.agentCount,
                    'isTemplate': p.isTemplate,
                    'isSystem': p.userId is None,  # System templates have NULL userId
                    'createdAt': p.createdAt.isoformat() if p.createdAt else None,
                    'updatedAt': p.updatedAt.isoformat() if p.updatedAt else None
                } for p in personas]
            }), 200

        except Exception as e:
            print(f"❌ Error fetching personas: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/personas/<persona_id>', methods=['GET'])
    def get_persona(persona_id):
        """Get single persona details"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            persona = db.query(Persona).filter(Persona.id == persona_id).first()

            if not persona:
                return jsonify({'error': 'Persona not found'}), 404

            # Check access (user owns it or it's a template)
            if persona.userId != user_id and not persona.isTemplate:
                return jsonify({'error': 'Access denied'}), 403

            return jsonify({
                'success': True,
                'data': {
                    'id': persona.id,
                    'name': persona.name,
                    'type': persona.type,
                    'description': persona.description,
                    'instructions': persona.instructions,
                    'personalityTraits': persona.personalityTraits or [],
                    'tone': persona.tone,
                    'languageStyle': persona.languageStyle,
                    'suggestedVoice': persona.suggestedVoice,
                    'voiceConfig': persona.voiceConfig or {},
                    'capabilities': persona.capabilities or ["voice"],
                    'tools': persona.tools or [],
                    'brandProfileId': persona.brandProfileId,
                    'agentCount': persona.agentCount,
                    'isTemplate': persona.isTemplate,
                    'isSystem': persona.userId is None,
                    'createdAt': persona.createdAt.isoformat() if persona.createdAt else None,
                    'updatedAt': persona.updatedAt.isoformat() if persona.updatedAt else None
                }
            }), 200

        except Exception as e:
            print(f"❌ Error fetching persona: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/personas', methods=['POST'])
    def create_persona():
        """
        Create custom persona

        POST /api/user/personas
        Body: {
            "name": "My Custom Support Agent",
            "type": "customer_support",
            "description": "Handles technical questions",
            "instructions": "You are a technical support specialist...",
            "personalityTraits": ["knowledgeable", "patient"],
            "tone": "professional",
            "languageStyle": "detailed",
            "suggestedVoice": "onyx",
            "voiceConfig": {
                "voice_id": "onyx",
                "provider": "openai",
                "model": "tts-1",
                "speed": 1.0,
                "stability": 0.75
            },
            "capabilities": ["voice", "chat", "email"],
            "tools": [
                {"name": "knowledge_base", "description": "Search KB", "enabled": true}
            ],
            "brandProfileId": "optional-brand-profile-uuid"
        }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        if not data.get('type'):
            return jsonify({'error': 'Type is required'}), 400
        if not data.get('instructions'):
            return jsonify({'error': 'Instructions are required'}), 400

        # Validate capabilities
        capabilities = data.get('capabilities', ['voice'])
        valid_channels = ['voice', 'chat', 'whatsapp', 'email', 'sms']
        if not isinstance(capabilities, list) or len(capabilities) == 0:
            return jsonify({'error': 'At least one capability must be enabled'}), 400
        for cap in capabilities:
            if cap not in valid_channels:
                return jsonify({'error': f'Invalid capability: {cap}. Must be one of {valid_channels}'}), 400

        # Validate voice config if voice capability enabled
        if 'voice' in capabilities:
            voice_config = data.get('voiceConfig')
            if voice_config and not isinstance(voice_config, dict):
                return jsonify({'error': 'voiceConfig must be an object'}), 400

        # Validate tools structure
        tools = data.get('tools', [])
        if not isinstance(tools, list):
            return jsonify({'error': 'tools must be an array'}), 400

        db = SessionLocal()
        try:
            persona = Persona(
                id=str(uuid.uuid4()),
                userId=user_id,
                name=data['name'],
                type=data['type'],
                description=data.get('description'),
                instructions=data['instructions'],
                personalityTraits=data.get('personalityTraits', []),
                tone=data.get('tone', 'professional'),
                languageStyle=data.get('languageStyle', 'conversational'),
                suggestedVoice=data.get('suggestedVoice'),
                voiceConfig=data.get('voiceConfig'),
                capabilities=capabilities,
                tools=tools,
                brandProfileId=data.get('brandProfileId'),
                isTemplate=False,
                agentCount=0,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(persona)
            db.commit()
            db.refresh(persona)

            return jsonify({
                'success': True,
                'data': {
                    'id': persona.id,
                    'name': persona.name,
                    'type': persona.type,
                    'description': persona.description,
                    'instructions': persona.instructions,
                    'personalityTraits': persona.personalityTraits or [],
                    'tone': persona.tone,
                    'languageStyle': persona.languageStyle,
                    'suggestedVoice': persona.suggestedVoice,
                    'voiceConfig': persona.voiceConfig or {},
                    'capabilities': persona.capabilities or ["voice"],
                    'tools': persona.tools or [],
                    'brandProfileId': persona.brandProfileId,
                    'createdAt': persona.createdAt.isoformat()
                }
            }), 201

        except Exception as e:
            db.rollback()
            print(f"❌ Error creating persona: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/personas/<persona_id>', methods=['PUT'])
    def update_persona(persona_id):
        """
        Update persona

        Note: Updating a persona will affect all agents using it
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        db = SessionLocal()
        try:
            persona = db.query(Persona).filter(Persona.id == persona_id).first()

            if not persona:
                return jsonify({'error': 'Persona not found'}), 404

            # Check ownership (can't update system templates)
            if persona.userId != user_id:
                return jsonify({'error': 'Cannot update system templates or other users personas'}), 403

            # Update fields
            if 'name' in data:
                persona.name = data['name']
            if 'description' in data:
                persona.description = data['description']
            if 'instructions' in data:
                persona.instructions = data['instructions']
            if 'personalityTraits' in data:
                persona.personalityTraits = data['personalityTraits']
            if 'tone' in data:
                persona.tone = data['tone']
            if 'languageStyle' in data:
                persona.languageStyle = data['languageStyle']
            if 'suggestedVoice' in data:
                persona.suggestedVoice = data['suggestedVoice']
            if 'voiceConfig' in data:
                persona.voiceConfig = data['voiceConfig']
            if 'capabilities' in data:
                # Validate capabilities
                capabilities = data['capabilities']
                valid_channels = ['voice', 'chat', 'whatsapp', 'email', 'sms']
                if not isinstance(capabilities, list) or len(capabilities) == 0:
                    return jsonify({'error': 'At least one capability must be enabled'}), 400
                for cap in capabilities:
                    if cap not in valid_channels:
                        return jsonify({'error': f'Invalid capability: {cap}'}), 400
                persona.capabilities = capabilities
            if 'tools' in data:
                if not isinstance(data['tools'], list):
                    return jsonify({'error': 'tools must be an array'}), 400
                persona.tools = data['tools']
            if 'brandProfileId' in data:
                persona.brandProfileId = data['brandProfileId']

            persona.updatedAt = datetime.utcnow()

            db.commit()
            db.refresh(persona)

            # Get affected agent count
            affected_agents = persona.agentCount

            return jsonify({
                'success': True,
                'data': {
                    'id': persona.id,
                    'name': persona.name,
                    'type': persona.type,
                    'instructions': persona.instructions,
                    'updatedAt': persona.updatedAt.isoformat(),
                    'agentCount': persona.agentCount
                },
                'message': f'Persona updated. {affected_agents} agents will use the new configuration.'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error updating persona: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/personas/<persona_id>', methods=['DELETE'])
    def delete_persona(persona_id):
        """
        Delete persona

        Note: Cannot delete if agents are using it
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            persona = db.query(Persona).filter(Persona.id == persona_id).first()

            if not persona:
                return jsonify({'error': 'Persona not found'}), 404

            # Check ownership
            if persona.userId != user_id:
                return jsonify({'error': 'Cannot delete system templates or other users personas'}), 403

            # Check if agents are using it
            if persona.agentCount > 0:
                return jsonify({
                    'error': f'Cannot delete persona. {persona.agentCount} agents are using it.',
                    'agentCount': persona.agentCount
                }), 400

            db.delete(persona)
            db.commit()

            return jsonify({
                'success': True,
                'message': 'Persona deleted successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error deleting persona: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/personas/from-template', methods=['POST'])
    def create_from_template():
        """
        Create custom persona from system template

        POST /api/user/personas/from-template
        Body: {
            "templateId": "uuid-of-template",
            "customName": "My Custom Support" (optional),
            "customizations": {
                "instructions": "Additional instructions...",
                "tone": "friendly"
            }
        }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json
        template_id = data.get('templateId')

        if not template_id:
            return jsonify({'error': 'Template ID is required'}), 400

        db = SessionLocal()
        try:
            # Get template
            template = db.query(Persona).filter(
                Persona.id == template_id,
                Persona.isTemplate == True
            ).first()

            if not template:
                return jsonify({'error': 'Template not found'}), 404

            # Create custom persona from template
            customizations = data.get('customizations', {})

            persona = Persona(
                id=str(uuid.uuid4()),
                userId=user_id,
                name=data.get('customName', f"My {template.name}"),
                type=template.type,
                description=template.description,
                instructions=customizations.get('instructions', template.instructions),
                personalityTraits=customizations.get('personalityTraits', template.personalityTraits),
                tone=customizations.get('tone', template.tone),
                languageStyle=customizations.get('languageStyle', template.languageStyle),
                suggestedVoice=customizations.get('suggestedVoice', template.suggestedVoice),
                voiceConfig=customizations.get('voiceConfig', template.voiceConfig),
                capabilities=customizations.get('capabilities', template.capabilities or ["voice"]),
                tools=customizations.get('tools', template.tools or []),
                brandProfileId=customizations.get('brandProfileId', template.brandProfileId),
                isTemplate=False,
                agentCount=0,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(persona)
            db.commit()
            db.refresh(persona)

            return jsonify({
                'success': True,
                'data': {
                    'id': persona.id,
                    'name': persona.name,
                    'type': persona.type,
                    'description': persona.description,
                    'instructions': persona.instructions,
                    'personalityTraits': persona.personalityTraits or [],
                    'tone': persona.tone,
                    'languageStyle': persona.languageStyle,
                    'voiceConfig': persona.voiceConfig or {},
                    'capabilities': persona.capabilities or ["voice"],
                    'tools': persona.tools or [],
                    'brandProfileId': persona.brandProfileId,
                    'createdAt': persona.createdAt.isoformat()
                },
                'message': f'Created custom persona from template: {template.name}'
            }), 201

        except Exception as e:
            db.rollback()
            print(f"❌ Error creating persona from template: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/system/persona-templates', methods=['GET'])
    def get_persona_templates():
        """
        Get all active persona templates from persona_templates table

        Query params:
        - category: filter by category (customer_service, sales, support, etc.)
        """
        # No authentication required for system templates
        category = request.args.get('category')

        db = SessionLocal()
        try:
            query = db.query(PersonaTemplate).filter(PersonaTemplate.isActive == True)

            if category:
                query = query.filter(PersonaTemplate.category == category)

            templates = query.order_by(PersonaTemplate.name).all()

            return jsonify({
                'success': True,
                'data': [{
                    'id': t.id,
                    'name': t.name,
                    'category': t.category,
                    'description': t.description,
                    'templateData': t.templateData or {},
                    'previewImage': t.previewImage,
                    'createdAt': t.createdAt.isoformat() if t.createdAt else None
                } for t in templates]
            }), 200

        except Exception as e:
            print(f"❌ Error fetching persona templates: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()
