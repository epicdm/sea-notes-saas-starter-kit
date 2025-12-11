"""
Agent Management API
Endpoints for creating and managing LiveKit agents from frontend
"""
from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
import logging
import uuid
from datetime import datetime
from agent_creator import AgentCreator
from database import SessionLocal, AgentConfig as AgentConfigModel, Persona, BrandProfile, User, compute_agent_instructions
from phone_number_manager import PhoneNumberPool

logger = logging.getLogger(__name__)

agent_api = Blueprint('agent_api', __name__, url_prefix='/api/user')

def get_current_user_id():
    """Get current user ID using the same method as user_dashboard.py"""
    # Check Flask session first
    from flask import session
    if 'user_id' in session:
        return session['user_id']

    # Check Authorization header (for Next.js frontend)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        try:
            import jwt
            decoded = jwt.decode(token, current_app.secret_key, algorithms=['HS256'])
            return decoded.get('user_id')
        except:
            pass

    # Check for user_id in cookies (NextAuth)
    user_id_cookie = request.cookies.get('user_id')
    if user_id_cookie:
        return user_id_cookie

    # Check for email in headers and look up user
    user_email = request.headers.get('X-User-Email')
    if user_email:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == user_email).first()
            if user:
                return user.id
        finally:
            db.close()

    return None

# Initialize agent creator
agent_creator = AgentCreator()


@agent_api.route('/agents', methods=['POST'])
@cross_origin()
def create_agent():
    """
    Create a new LiveKit agent with persona integration

    POST /api/user/agents
    Body: {
        "name": "Customer Support",
        "description": "Helps customers",
        "agent_type": "inbound",
        "persona_id": "uuid-of-persona",
        "custom_instructions": "Agent-specific instructions...",
        "deployment_mode": "production",
        "channels": {
            "voice": {"enabled": true, "phone_number_id": "..."},
            "chat": {"enabled": false}
        },
        "llm_model": "gpt-4o-mini",
        "voice": "echo",
        "language": "en",
        "temperature": 0.7,
        "vad_enabled": true,
        "turn_detection": "semantic",
        "noise_cancellation": true
    }

    Returns: {
        "id": "uuid",
        "name": "Customer Support",
        "agent_type": "inbound",
        "persona_id": "...",
        "status": "created",
        ...
    }
    """
    try:
        # Get configuration from request
        config = request.json

        # Validate required fields
        required_fields = ['name', 'agent_type', 'persona_id', 'llm_model', 'voice']
        missing_fields = [f for f in required_fields if f not in config]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Get user ID from session/auth
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            # Validate persona exists and user has access
            persona = db.query(Persona).filter(
                Persona.id == config['persona_id']
            ).first()

            if not persona:
                return jsonify({
                    'error': 'Persona not found'
                }), 404

            # Check access (user owns it OR it's a system template)
            if persona.userId != user_id and not persona.isTemplate:
                return jsonify({
                    'error': 'Access denied to this persona'
                }), 403

            # Get brand profile if specified, or inherit from persona
            brand_profile_id = config.get('brand_profile_id')
            # If no brand_profile_id provided, inherit from persona
            if not brand_profile_id and persona.brandProfileId:
                brand_profile_id = persona.brandProfileId
            
            if brand_profile_id:
                brand_profile = db.query(BrandProfile).filter(
                    BrandProfile.id == brand_profile_id,
                    BrandProfile.userId == user_id
                ).first()

                if not brand_profile:
                    return jsonify({
                        'error': 'Brand profile not found or access denied'
                    }), 404

            # Create agent record with persona reference
            agent_id = str(uuid.uuid4())
            agent_record = AgentConfigModel(
                id=agent_id,
                userId=user_id,
                name=config['name'],
                description=config.get('description', ''),
                instructions=f"[Persona-based instructions - compiled at runtime from persona: {persona.name}]",
                agentType=config['agent_type'],
                personaId=config['persona_id'],
                brandProfileId=brand_profile_id,
                customInstructions=config.get('custom_instructions'),
                deploymentMode=config.get('deployment_mode', 'production'),
                channels=config.get('channels', {}),
                llmModel=config['llm_model'],
                voice=config['voice'],
                language=config.get('language', 'en'),
                temperature=config.get('temperature', 0.7),
                vadEnabled=config.get('vad_enabled', True),
                turnDetectionModel=config.get('turn_detection', 'multilingual'),
                noiseCancellationEnabled=config.get('noise_cancellation', True),
                isActive=True,
                status='created',
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(agent_record)
            db.commit()
            db.refresh(agent_record)

            # Compute agent instructions from persona + brand profile
            computed_instructions = compute_agent_instructions(agent_record, db)

            # Build response with persona details
            response = {
                'id': agent_record.id,
                'name': agent_record.name,
                'description': agent_record.description,
                'agent_type': agent_record.agentType,
                'persona_id': agent_record.personaId,
                'persona': {
                    'id': persona.id,
                    'name': persona.name,
                    'type': persona.type,
                    'capabilities': persona.capabilities
                },
                'brand_profile_id': agent_record.brandProfileId,
                'computed_instructions': computed_instructions,
                'custom_instructions': agent_record.customInstructions,
                'deployment_mode': agent_record.deploymentMode,
                'channels': agent_record.channels,
                'llm_model': agent_record.llmModel,
                'voice': agent_record.voice,
                'language': agent_record.language,
                'temperature': agent_record.temperature,
                'status': agent_record.status,
                'is_active': agent_record.isActive,
                'created_at': agent_record.createdAt.isoformat()
            }

            logger.info(f"Agent created: {agent_record.id} with persona {persona.name} for user {user_id}")
            return jsonify(response), 201

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error creating agent: {e}", exc_info=True)
        return jsonify({
            'error': 'Failed to create agent',
            'details': str(e)
        }), 500


@agent_api.route('/agents', methods=['GET'])
@cross_origin()
def list_agents():
    """
    List all agents for the current user with persona details

    GET /api/user/agents

    Returns: {
        "agents": [
            {
                "id": "uuid",
                "name": "Customer Support",
                "agent_type": "inbound",
                "persona": {
                    "id": "...",
                    "name": "...",
                    "type": "...",
                    "capabilities": [...]
                },
                "deployment_mode": "production",
                "channels": {...},
                "status": "active",
                ...
            },
            ...
        ],
        "count": 5
    }
    """
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            # Query agents with join to personas
            agents = db.query(AgentConfigModel).filter(
                AgentConfigModel.userId == user_id
            ).all()

            # Build response with persona details
            agent_list = []
            for agent in agents:
                agent_data = {
                    'id': agent.id,
                    'name': agent.name,
                    'description': agent.description,
                    'agent_type': agent.agentType,
                    'persona_id': agent.personaId,
                    'deployment_mode': agent.deploymentMode,
                    'channels': agent.channels,
                    'llm_model': agent.llmModel,
                    'voice': agent.voice,
                    'status': agent.status,
                    'is_active': agent.isActive,
                    'created_at': agent.createdAt.isoformat() if agent.createdAt else None,
                    'updated_at': agent.updatedAt.isoformat() if agent.updatedAt else None,
                }

                # Add phone number from PhoneNumberPool
                phone_number = db.query(PhoneNumberPool).filter(
                    PhoneNumberPool.assigned_to_agent_id == agent.id
                ).first()

                if phone_number:
                    agent_data['phoneNumber'] = phone_number.phone_number
                    agent_data['phone_number'] = phone_number.phone_number
                    agent_data['phoneNumberId'] = str(phone_number.id)
                else:
                    agent_data['phoneNumber'] = None
                    agent_data['phone_number'] = None
                    agent_data['phoneNumberId'] = None

                # Add persona details if persona exists
                if agent.personaId:
                    persona = db.query(Persona).filter(Persona.id == agent.personaId).first()
                    if persona:
                        agent_data['persona'] = {
                            'id': persona.id,
                            'name': persona.name,
                            'type': persona.type,
                            'capabilities': persona.capabilities
                        }

                        # Add brand details if persona has brandProfileId
                        if persona.brandProfileId:
                            brand = db.query(BrandProfile).filter(BrandProfile.id == persona.brandProfileId).first()
                            if brand:
                                agent_data['persona']['brand'] = {
                                    'id': brand.id,
                                    'company_name': brand.companyName
                                }

                agent_list.append(agent_data)

            return jsonify({
                'agents': agent_list,
                'count': len(agent_list)
            })
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error listing agents: {e}")
        return jsonify({'error': 'Failed to list agents'}), 500


@agent_api.route('/agents/<agent_id>', methods=['GET'])
@cross_origin()
def get_agent(agent_id: str):
    """
    Get a specific agent's configuration
    
    GET /api/user/agents/{agent_id}
    
    Returns: {
        "id": "1",
        "agent_id": "customer_support",
        "name": "Customer Support",
        "config": {...},
        ...
    }
    """
    try:
        user_id = request.headers.get('X-User-Id', 'default_user')
        
        db = SessionLocal()
        try:
            agent = db.query(AgentConfigModel).filter(
                AgentConfigModel.agent_id == agent_id,
                AgentConfigModel.user_id == user_id
            ).first()
            
            if not agent:
                return jsonify({'error': 'Agent not found'}), 404
            
            return jsonify({
                'id': agent.id,
                'agent_id': agent.agent_id,
                'name': agent.name,
                'description': agent.description,
                'config': agent.config_json,
                'status': agent.status,
                'file_path': agent.file_path,
                'created_at': agent.created_at.isoformat(),
                'updated_at': agent.updated_at.isoformat() if agent.updated_at else None,
            })
        finally:
            db.close()
    
    except Exception as e:
        logger.error(f"Error getting agent: {e}")
        return jsonify({'error': 'Failed to get agent'}), 500


@agent_api.route('/agents/<agent_id>/compiled-instructions', methods=['GET'])
@cross_origin()
def get_compiled_instructions(agent_id: str):
    """
    Get compiled instructions for an agent

    Compiles final instructions from:
    - Brand profile context (if configured)
    - Persona instructions
    - Agent custom_instructions
    - Call context (from query params)

    GET /api/user/agents/{agent_id}/compiled-instructions?channel=voice&lead_name=John

    Query Params:
    - channel: voice|chat|whatsapp|email|sms (default: voice)
    - lead_name, lead_phone, lead_email, etc.: Call context data

    Returns: {
        "instructions": "compiled instruction string",
        "compiled_at": "2024-01-01T00:00:00",
        "sources": {
            "brand_profile": true,
            "persona": true,
            "agent_custom": true,
            "call_context": false
        }
    }
    """
    try:
        user_id = request.headers.get('X-User-Id', 'default_user')

        db = SessionLocal()
        try:
            # Get agent
            agent = db.query(AgentConfigModel).filter(
                AgentConfigModel.id == agent_id,
                AgentConfigModel.userId == user_id
            ).first()

            if not agent:
                return jsonify({'error': 'Agent not found'}), 404

            # Get channel from query params
            channel = request.args.get('channel', 'voice')

            # Build call context from query params
            call_context = {}

            # Lead information
            lead_data = {}
            if request.args.get('lead_name'):
                lead_data['name'] = request.args.get('lead_name')
            if request.args.get('lead_phone'):
                lead_data['phone'] = request.args.get('lead_phone')
            if request.args.get('lead_email'):
                lead_data['email'] = request.args.get('lead_email')
            if request.args.get('lead_company'):
                lead_data['company'] = request.args.get('lead_company')

            if lead_data:
                call_context['lead'] = lead_data

            # Funnel information
            funnel_data = {}
            if request.args.get('funnel_name'):
                funnel_data['name'] = request.args.get('funnel_name')
            if request.args.get('funnel_stage'):
                funnel_data['stage'] = request.args.get('funnel_stage')

            if funnel_data:
                call_context['funnel'] = funnel_data

            # Compile instructions using utility
            from utils.instruction_compiler import compile_instructions

            instructions = compile_instructions(
                db_session=db,
                persona_id=agent.personaId,
                brand_profile_id=agent.brandProfileId,
                agent_config_id=agent.id,
                custom_instructions=agent.customInstructions,
                call_context=call_context if call_context else None,
                channel=channel
            )

            # Track which sources were used
            sources = {
                'brand_profile': agent.brandProfileId is not None,
                'persona': agent.personaId is not None,
                'agent_custom': agent.customInstructions is not None,
                'call_context': bool(call_context)
            }

            return jsonify({
                'instructions': instructions,
                'compiled_at': datetime.utcnow().isoformat(),
                'channel': channel,
                'sources': sources,
                'length': len(instructions)
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error compiling instructions: {e}", exc_info=True)
        return jsonify({
            'error': 'Failed to compile instructions',
            'details': str(e)
        }), 500


@agent_api.route('/agents/<agent_id>', methods=['DELETE'])
@cross_origin()
def delete_agent(agent_id: str):
    """
    Delete an agent
    
    DELETE /api/user/agents/{agent_id}
    
    Returns: {
        "success": true,
        "message": "Agent deleted"
    }
    """
    try:
        user_id = request.headers.get('X-User-Id', 'default_user')
        
        db = SessionLocal()
        try:
            agent = db.query(AgentConfigModel).filter(
                AgentConfigModel.agent_id == agent_id,
                AgentConfigModel.user_id == user_id
            ).first()
            
            if not agent:
                return jsonify({'error': 'Agent not found'}), 404
            
            # TODO: Also delete the agent files
            # import shutil
            # shutil.rmtree(agent.file_path, ignore_errors=True)
            
            db.delete(agent)
            db.commit()
            
            logger.info(f"Agent deleted: {agent_id} by user {user_id}")
            
            return jsonify({
                'success': True,
                'message': f'Agent {agent_id} deleted'
            })
        finally:
            db.close()
    
    except Exception as e:
        logger.error(f"Error deleting agent: {e}")
        return jsonify({'error': 'Failed to delete agent'}), 500


@agent_api.route('/agents/<agent_id>/deploy', methods=['POST'])
@cross_origin()
def deploy_agent(agent_id: str):
    """
    Deploy an agent to LiveKit
    
    POST /api/user/agents/{agent_id}/deploy
    
    Returns: {
        "success": true,
        "status": "deployed",
        "worker_id": "..."
    }
    """
    try:
        user_id = request.headers.get('X-User-Id', 'default_user')
        
        db = SessionLocal()
        try:
            agent = db.query(AgentConfigModel).filter(
                AgentConfigModel.agent_id == agent_id,
                AgentConfigModel.user_id == user_id
            ).first()
            
            if not agent:
                return jsonify({'error': 'Agent not found'}), 404
            
            # TODO: Actually deploy the agent
            # This would involve:
            # 1. Starting the agent worker process
            # 2. Registering with LiveKit server
            # 3. Monitoring the worker status
            
            # For now, just update status
            agent.status = 'deployed'
            db.commit()
            
            return jsonify({
                'success': True,
                'status': 'deployed',
                'message': f'Agent {agent_id} deployed successfully'
            })
        finally:
            db.close()
    
    except Exception as e:
        logger.error(f"Error deploying agent: {e}")
        return jsonify({'error': 'Failed to deploy agent'}), 500


# Register blueprint in your main Flask app:
# from agent_api import agent_api
# app.register_blueprint(agent_api)
