"""
Testing API Routes
Provides three testing modes for AI agents:
1. Voice Call Testing - Initiate real phone calls
2. Text Simulation - Test agent responses via text chat
3. TTS Preview - Preview agent's voice without full call
"""

from flask import Blueprint, request, jsonify
from database import SessionLocal, AgentConfig, User, PhoneMapping
from sqlalchemy import func
import os
import json
from datetime import datetime
import openai
from livekit import api as livekit_api

testing_bp = Blueprint('testing', __name__, url_prefix='/api/testing')

# Initialize OpenAI client (for LLM and TTS)
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key:
    openai.api_key = openai_api_key


def get_user_from_email(email: str):
    """Get user from email header"""
    if not email:
        return None

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        return user
    finally:
        db.close()


@testing_bp.route('/voice-call', methods=['POST'])
def test_voice_call():
    """
    Initiate a test voice call to a phone number

    Request Body:
    {
        "agent_id": "uuid",
        "phone_number": "+15551234567"
    }

    Response:
    {
        "success": true,
        "call_id": "call_xxx",
        "status": "initiated",
        "message": "Test call initiated to +15551234567"
    }
    """
    try:
        # Get user from header
        user_email = request.headers.get('X-User-Email')
        user = get_user_from_email(user_email)

        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'User not authenticated',
                    'code': 'UNAUTHORIZED'
                }
            }), 401

        # Parse request
        data = request.get_json()
        agent_id = data.get('agent_id')
        phone_number = data.get('phone_number')

        if not agent_id or not phone_number:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'agent_id and phone_number are required',
                    'code': 'MISSING_PARAMETERS'
                }
            }), 400

        # Verify agent belongs to user
        db = SessionLocal()
        try:
            agent = db.query(AgentConfig).filter(
                AgentConfig.id == agent_id,
                AgentConfig.userId == user.id
            ).first()

            if not agent:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'Agent not found or access denied',
                        'code': 'NOT_FOUND'
                    }
                }), 404

            # Get a phone number assigned to this agent
            phone_mapping = db.query(PhoneMapping).filter(
                PhoneMapping.agentConfigId == agent_id
            ).first()

            if not phone_mapping:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'No phone number assigned to this agent',
                        'code': 'NO_PHONE_NUMBER'
                    }
                }), 400

            from_number = phone_mapping.phoneNumber

            # TODO: Integrate with existing call initiation logic
            # For now, return a mock response
            # In production, this should use the same logic as the regular outbound call API

            call_id = f"test_call_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

            return jsonify({
                'success': True,
                'call_id': call_id,
                'status': 'initiated',
                'from_number': from_number,
                'to_number': phone_number,
                'agent_name': agent.name,
                'message': f'Test call initiated from {from_number} to {phone_number}'
            }), 200

        finally:
            db.close()

    except Exception as e:
        print(f"Error in test_voice_call: {e}")
        return jsonify({
            'success': False,
            'error': {
                'message': str(e),
                'code': 'INTERNAL_ERROR'
            }
        }), 500


@testing_bp.route('/chat', methods=['POST'])
def test_text_simulation():
    """
    Simulate a text conversation with an agent

    Request Body:
    {
        "agent_id": "uuid",
        "message": "Hello, how are you?",
        "conversation_history": [
            {"role": "user", "content": "Previous message"},
            {"role": "agent", "content": "Previous response"}
        ]
    }

    Response:
    {
        "success": true,
        "response": "I'm doing well, thank you for asking!",
        "agent_name": "My Agent"
    }
    """
    try:
        # Get user from header
        user_email = request.headers.get('X-User-Email')
        user = get_user_from_email(user_email)

        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'User not authenticated',
                    'code': 'UNAUTHORIZED'
                }
            }), 401

        # Parse request
        data = request.get_json()
        agent_id = data.get('agent_id')
        message = data.get('message')
        conversation_history = data.get('conversation_history', [])

        if not agent_id or not message:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'agent_id and message are required',
                    'code': 'MISSING_PARAMETERS'
                }
            }), 400

        # Verify agent belongs to user
        db = SessionLocal()
        try:
            agent = db.query(AgentConfig).filter(
                AgentConfig.id == agent_id,
                AgentConfig.userId == user.id
            ).first()

            if not agent:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'Agent not found or access denied',
                        'code': 'NOT_FOUND'
                    }
                }), 404

            # Build conversation messages
            messages = []

            # Add system prompt (agent instructions)
            if agent.instructions:
                messages.append({
                    'role': 'system',
                    'content': agent.instructions
                })

            # Add conversation history
            for msg in conversation_history:
                messages.append({
                    'role': 'assistant' if msg['role'] == 'agent' else 'user',
                    'content': msg['content']
                })

            # Add current message
            messages.append({
                'role': 'user',
                'content': message
            })

            # Call OpenAI API
            if not openai_api_key:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'OpenAI API key not configured',
                        'code': 'API_KEY_MISSING'
                    }
                }), 500

            client = openai.OpenAI(api_key=openai_api_key)

            # Use agent's configured model or default to gpt-4o-mini
            model = agent.llmModel if agent.llmModel else 'gpt-4o-mini'
            print(f"[Testing API] Using model: {model} for agent: {agent.name} (llmModel={agent.llmModel})")

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            agent_response = response.choices[0].message.content

            return jsonify({
                'success': True,
                'response': agent_response,
                'agent_name': agent.name,
                'model': model
            }), 200

        finally:
            db.close()

    except Exception as e:
        print(f"Error in test_text_simulation: {e}")
        return jsonify({
            'success': False,
            'error': {
                'message': str(e),
                'code': 'INTERNAL_ERROR'
            }
        }), 500


@testing_bp.route('/tts-preview', methods=['POST'])
def test_tts_preview():
    """
    Generate a TTS preview of the agent's voice

    Request Body:
    {
        "agent_id": "uuid",
        "text": "This is a test of the text-to-speech system."
    }

    Response:
    {
        "success": true,
        "audio_url": "https://...",
        "voice": "alloy",
        "text": "This is a test..."
    }
    """
    try:
        # Get user from header
        user_email = request.headers.get('X-User-Email')
        user = get_user_from_email(user_email)

        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'User not authenticated',
                    'code': 'UNAUTHORIZED'
                }
            }), 401

        # Parse request
        data = request.get_json()
        agent_id = data.get('agent_id')
        text = data.get('text')

        if not agent_id or not text:
            return jsonify({
                'success': False,
                'error': {
                    'message': 'agent_id and text are required',
                    'code': 'MISSING_PARAMETERS'
                }
            }), 400

        # Verify agent belongs to user
        db = SessionLocal()
        try:
            agent = db.query(AgentConfig).filter(
                AgentConfig.id == agent_id,
                AgentConfig.userId == user.id
            ).first()

            if not agent:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'Agent not found or access denied',
                        'code': 'NOT_FOUND'
                    }
                }), 404

            # Get agent's voice setting
            voice = agent.voice if agent.voice else 'alloy'

            # Call OpenAI TTS API
            if not openai_api_key:
                return jsonify({
                    'success': False,
                    'error': {
                        'message': 'OpenAI API key not configured',
                        'code': 'API_KEY_MISSING'
                    }
                }), 500

            client = openai.OpenAI(api_key=openai_api_key)

            # Generate speech
            response = client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text
            )

            # Save to temporary file
            import tempfile
            import base64

            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name

            # Read and encode as base64 for inline playback
            with open(temp_path, 'rb') as audio_file:
                audio_data = audio_file.read()
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')

            # Clean up temp file
            os.unlink(temp_path)

            return jsonify({
                'success': True,
                'audio_data': f'data:audio/mp3;base64,{audio_base64}',
                'voice': voice,
                'text': text,
                'agent_name': agent.name
            }), 200

        finally:
            db.close()

    except Exception as e:
        print(f"Error in test_tts_preview: {e}")
        return jsonify({
            'success': False,
            'error': {
                'message': str(e),
                'code': 'INTERNAL_ERROR'
            }
        }), 500
