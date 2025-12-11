"""
Multi-Brand Management API (for Agencies)
Endpoints for managing multiple client brands in agency workspace

This API is different from brand_profile_api.py which is for SMB users (single brand).
Agencies can manage multiple brands, each linked to personas and agents.
"""

import os
import uuid
from datetime import datetime, timedelta
from flask import jsonify, request, make_response
from sqlalchemy import text, func
from database import SessionLocal, BrandProfile, User, Persona, AgentConfig, CallLog
from brand_extractor import extract_brand_info
from collections import defaultdict
import csv
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def setup_brands_endpoints(app):
    """Set up multi-brand API endpoints for agencies"""

    @app.route('/api/brands', methods=['GET'])
    def list_brands():
        """
        Get all brands for current agency user
        
        Returns:
            {
                "success": true,
                "data": [BrandProfile[], ...]
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            brands = db.query(BrandProfile).filter(
                BrandProfile.userId == user_id
            ).order_by(BrandProfile.createdAt.desc()).all()

            # Build response with persona counts
            brand_data = []
            for brand in brands:
                # Count personas linked to this brand
                persona_count = db.query(Persona).filter(
                    Persona.brandProfileId == brand.id
                ).count()

                # Count agents linked to this brand (directly)
                agent_count = db.query(AgentConfig).filter(
                    AgentConfig.brandProfileId == brand.id
                ).count()

                brand_data.append({
                    'id': brand.id,
                    'user_id': brand.userId,
                    'company_name': brand.companyName,
                    'industry': brand.industry,
                    'logo_url': brand.logoUrl,
                    'social_media_links': {
                        'website_url': brand.websiteUrl,
                        'facebook_url': brand.facebookUrl,
                        'instagram_url': brand.instagramUrl,
                        'linkedin_url': brand.linkedinUrl,
                        'twitter_url': brand.twitterUrl
                    },
                    'brand_data': brand.brandData or {},
                    'custom_brand_voice': brand.customBrandVoice,
                    'custom_tone_guidelines': brand.customToneGuidelines,
                    'dos_and_donts': brand.dosAndDonts or {'dos': [], 'donts': []},
                    'auto_extract_enabled': brand.autoExtractEnabled,
                    'last_extraction_at': brand.lastExtractionAt.isoformat() if brand.lastExtractionAt else None,
                    'created_at': brand.createdAt.isoformat() if brand.createdAt else None,
                    'updated_at': brand.updatedAt.isoformat() if brand.updatedAt else None,
                    'persona_count': persona_count,
                    'agent_count': agent_count
                })

            return jsonify({
                'success': True,
                'data': brand_data
            }), 200

        except Exception as e:
            print(f"❌ Error fetching brands: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands', methods=['POST'])
    def create_brand():
        """
        Create new brand for current agency user
        
        Body:
            {
                "company_name": str (required),
                "industry": str (optional),
                "logo_url": str (optional),
                "custom_brand_voice": str (optional),
                "custom_tone_guidelines": str (optional),
                "social_media_links": {
                    "website_url": str,
                    "facebook_url": str,
                    "instagram_url": str,
                    "linkedin_url": str,
                    "twitter_url": str
                }
            }
        
        Returns:
            {
                "success": true,
                "data": BrandProfile
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        # Validate required fields
        if not data.get('company_name'):
            return jsonify({'error': 'Company name is required'}), 400

        db = SessionLocal()
        try:
            # Extract social media links from nested object
            social_media = data.get('social_media_links', {})

            # Create brand profile
            brand_profile = BrandProfile(
                id=str(uuid.uuid4()),
                userId=user_id,
                companyName=data['company_name'],
                industry=data.get('industry'),
                logoUrl=data.get('logo_url'),
                facebookUrl=social_media.get('facebook_url'),
                instagramUrl=social_media.get('instagram_url'),
                linkedinUrl=social_media.get('linkedin_url'),
                twitterUrl=social_media.get('twitter_url'),
                websiteUrl=social_media.get('website_url'),
                customBrandVoice=data.get('custom_brand_voice'),
                customToneGuidelines=data.get('custom_tone_guidelines'),
                dosAndDonts=data.get('dos_and_donts'),
                autoExtractEnabled=data.get('auto_extract_enabled', True),
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(brand_profile)
            db.commit()
            db.refresh(brand_profile)

            return jsonify({
                'success': True,
                'data': {
                    'id': brand_profile.id,
                    'user_id': brand_profile.userId,
                    'company_name': brand_profile.companyName,
                    'industry': brand_profile.industry,
                    'logo_url': brand_profile.logoUrl,
                    'social_media_links': {
                        'website_url': brand_profile.websiteUrl,
                        'facebook_url': brand_profile.facebookUrl,
                        'instagram_url': brand_profile.instagramUrl,
                        'linkedin_url': brand_profile.linkedinUrl,
                        'twitter_url': brand_profile.twitterUrl
                    },
                    'brand_data': brand_profile.brandData or {},
                    'custom_brand_voice': brand_profile.customBrandVoice,
                    'custom_tone_guidelines': brand_profile.customToneGuidelines,
                    'dos_and_donts': brand_profile.dosAndDonts or {'dos': [], 'donts': []},
                    'created_at': brand_profile.createdAt.isoformat(),
                    'persona_count': 0,
                    'agent_count': 0
                }
            }), 201

        except Exception as e:
            db.rollback()
            print(f"❌ Error creating brand: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>', methods=['PUT'])
    def update_brand(brand_id):
        """
        Update existing brand
        
        Params:
            brand_id: str - Brand UUID
        
        Body:
            Same as POST /api/brands (all fields optional)
        
        Returns:
            {
                "success": true,
                "data": BrandProfile
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        db = SessionLocal()
        try:
            # Verify ownership
            brand_profile = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand_profile:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Update fields
            if 'company_name' in data:
                brand_profile.companyName = data['company_name']
            if 'industry' in data:
                brand_profile.industry = data['industry']
            if 'logo_url' in data:
                brand_profile.logoUrl = data['logo_url']
            if 'custom_brand_voice' in data:
                brand_profile.customBrandVoice = data['custom_brand_voice']
            if 'custom_tone_guidelines' in data:
                brand_profile.customToneGuidelines = data['custom_tone_guidelines']
            if 'dos_and_donts' in data:
                brand_profile.dosAndDonts = data['dos_and_donts']
            if 'auto_extract_enabled' in data:
                brand_profile.autoExtractEnabled = data['auto_extract_enabled']
            if 'brand_data' in data:
                # Merge with existing brand data
                existing_data = brand_profile.brandData or {}
                existing_data.update(data['brand_data'])
                brand_profile.brandData = existing_data

            # Update social media links
            if 'social_media_links' in data:
                social_media = data['social_media_links']
                if 'facebook_url' in social_media:
                    brand_profile.facebookUrl = social_media['facebook_url']
                if 'instagram_url' in social_media:
                    brand_profile.instagramUrl = social_media['instagram_url']
                if 'linkedin_url' in social_media:
                    brand_profile.linkedinUrl = social_media['linkedin_url']
                if 'twitter_url' in social_media:
                    brand_profile.twitterUrl = social_media['twitter_url']
                if 'website_url' in social_media:
                    brand_profile.websiteUrl = social_media['website_url']

            brand_profile.updatedAt = datetime.utcnow()

            db.commit()
            db.refresh(brand_profile)

            # Get current persona count
            persona_count = db.query(Persona).filter(
                Persona.brandProfileId == brand_profile.id
            ).count()
            
            agent_count = db.query(AgentConfig).filter(
                AgentConfig.brandProfileId == brand_profile.id
            ).count()

            return jsonify({
                'success': True,
                'data': {
                    'id': brand_profile.id,
                    'user_id': brand_profile.userId,
                    'company_name': brand_profile.companyName,
                    'industry': brand_profile.industry,
                    'logo_url': brand_profile.logoUrl,
                    'social_media_links': {
                        'website_url': brand_profile.websiteUrl,
                        'facebook_url': brand_profile.facebookUrl,
                        'instagram_url': brand_profile.instagramUrl,
                        'linkedin_url': brand_profile.linkedinUrl,
                        'twitter_url': brand_profile.twitterUrl
                    },
                    'brand_data': brand_profile.brandData or {},
                    'custom_brand_voice': brand_profile.customBrandVoice,
                    'custom_tone_guidelines': brand_profile.customToneGuidelines,
                    'dos_and_donts': brand_profile.dosAndDonts or {'dos': [], 'donts': []},
                    'updated_at': brand_profile.updatedAt.isoformat(),
                    'persona_count': persona_count,
                    'agent_count': agent_count
                }
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error updating brand: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>', methods=['DELETE'])
    def delete_brand(brand_id):
        """
        Delete brand and all associated personas/agents
        
        Params:
            brand_id: str - Brand UUID
        
        Returns:
            {
                "success": true,
                "message": "Brand deleted successfully"
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Verify ownership
            brand_profile = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand_profile:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Delete brand (CASCADE will delete associated personas/agents)
            db.delete(brand_profile)
            db.commit()

            return jsonify({
                'success': True,
                'message': f'Brand "{brand_profile.companyName}" deleted successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error deleting brand: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>/clone', methods=['POST'])
    def clone_brand(brand_id):
        """
        Clone brand with new name (30-second setup)
        
        Params:
            brand_id: str - Brand UUID to clone
        
        Body:
            {
                "company_name": str (required) - New brand name
            }
        
        Returns:
            {
                "success": true,
                "data": BrandProfile (cloned brand)
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json
        new_name = data.get('company_name')
        clone_personas = data.get('clone_personas', False)

        if not new_name:
            return jsonify({'error': 'New company name is required'}), 400

        db = SessionLocal()
        try:
            # Verify ownership of source brand
            source_brand = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not source_brand:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Clone brand
            cloned_brand = BrandProfile(
                id=str(uuid.uuid4()),
                userId=user_id,
                companyName=new_name,
                industry=source_brand.industry,
                logoUrl=source_brand.logoUrl,
                facebookUrl=source_brand.facebookUrl,
                instagramUrl=source_brand.instagramUrl,
                linkedinUrl=source_brand.linkedinUrl,
                twitterUrl=source_brand.twitterUrl,
                websiteUrl=source_brand.websiteUrl,
                brandData=source_brand.brandData,
                customBrandVoice=source_brand.customBrandVoice,
                customToneGuidelines=source_brand.customToneGuidelines,
                dosAndDonts=source_brand.dosAndDonts,
                autoExtractEnabled=source_brand.autoExtractEnabled,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(cloned_brand)
            db.commit()
            db.refresh(cloned_brand)

            # Clone personas if requested
            cloned_persona_count = 0
            if clone_personas:
                # Query personas linked to source brand
                source_personas = db.query(Persona).filter(
                    Persona.brandProfileId == source_brand.id
                ).all()

                for source_persona in source_personas:
                    cloned_persona = Persona(
                        id=str(uuid.uuid4()),
                        userId=user_id,
                        brandProfileId=cloned_brand.id,  # Link to cloned brand
                        name=source_persona.name,
                        type=source_persona.type,
                        description=source_persona.description,
                        instructions=source_persona.instructions,
                        tone=source_persona.tone,
                        languageStyle=source_persona.languageStyle,
                        personalityTraits=source_persona.personalityTraits,
                        capabilities=source_persona.capabilities,
                        tools=source_persona.tools,
                        suggestedVoice=source_persona.suggestedVoice,
                        voiceConfig=source_persona.voiceConfig,
                        metadata=source_persona.metadata,
                        isTemplate=False,  # Cloned personas are not templates
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow()
                    )
                    db.add(cloned_persona)
                    cloned_persona_count += 1

                db.commit()

            return jsonify({
                'success': True,
                'data': {
                    'id': cloned_brand.id,
                    'user_id': cloned_brand.userId,
                    'company_name': cloned_brand.companyName,
                    'industry': cloned_brand.industry,
                    'logo_url': cloned_brand.logoUrl,
                    'social_media_links': {
                        'website_url': cloned_brand.websiteUrl,
                        'facebook_url': cloned_brand.facebookUrl,
                        'instagram_url': cloned_brand.instagramUrl,
                        'linkedin_url': cloned_brand.linkedinUrl,
                        'twitter_url': cloned_brand.twitterUrl
                    },
                    'brand_data': cloned_brand.brandData or {},
                    'custom_brand_voice': cloned_brand.customBrandVoice,
                    'custom_tone_guidelines': cloned_brand.customToneGuidelines,
                    'dos_and_donts': cloned_brand.dosAndDonts or {'dos': [], 'donts': []},
                    'created_at': cloned_brand.createdAt.isoformat(),
                    'persona_count': cloned_persona_count,
                    'agent_count': 0
                },
                'message': f'Brand cloned as "{new_name}"'
            }), 201

        except Exception as e:
            db.rollback()
            print(f"❌ Error cloning brand: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>/analytics/filters', methods=['GET'])
    def get_brand_analytics_filters(brand_id):
        """
        Get available filter options for brand analytics

        Params:
            brand_id: str - Brand UUID

        Returns:
            {
                "success": true,
                "data": {
                    "agents": [{id, name}],
                    "outcomes": ["completed", "failed", ...],
                    "directions": ["inbound", "outbound"],
                    "time_of_day": ["morning", "afternoon", "evening", "night"]
                }
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Verify ownership
            brand = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Get all personas for this brand
            personas = db.query(Persona).filter(
                Persona.brandProfileId == brand_id
            ).all()
            persona_ids = [p.id for p in personas]

            # Get all agents for these personas
            agents = []
            if persona_ids:
                agents = db.query(AgentConfig).filter(
                    AgentConfig.personaId.in_(persona_ids)
                ).all()

            # Build agent list
            agent_options = [
                {'id': agent.id, 'name': agent.name}
                for agent in agents
            ]

            # Get unique outcomes from call logs
            agent_ids = [a.id for a in agents]
            unique_outcomes = []
            if agent_ids:
                outcome_results = db.query(CallLog.outcome).filter(
                    CallLog.agentConfigId.in_(agent_ids),
                    CallLog.outcome.isnot(None)
                ).distinct().all()
                unique_outcomes = [r[0] for r in outcome_results if r[0]]

            return jsonify({
                'success': True,
                'data': {
                    'agents': agent_options,
                    'outcomes': unique_outcomes,
                    'directions': ['inbound', 'outbound'],
                    'time_of_day': [
                        {'value': 'morning', 'label': 'Morning (6am-12pm)'},
                        {'value': 'afternoon', 'label': 'Afternoon (12pm-5pm)'},
                        {'value': 'evening', 'label': 'Evening (5pm-9pm)'},
                        {'value': 'night', 'label': 'Night (9pm-6am)'}
                    ]
                }
            }), 200

        except Exception as e:
            print(f"❌ Error fetching filter options: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>/analytics', methods=['GET'])
    def get_brand_analytics(brand_id):
        """
        Get analytics for a specific brand

        Params:
            brand_id: str - Brand UUID

        Query Params:
            days: int (optional) - Number of days to analyze (default: 30)

        Returns:
            {
                "success": true,
                "data": {
                    "brand_id": str,
                    "brand_name": str,
                    "total_calls": int,
                    "success_rate": float (0-100),
                    "avg_duration": float (seconds),
                    "total_cost": float,
                    "calls_by_outcome": {outcome: count},
                    "calls_by_day": [{date: str, count: int}],
                    "agent_performance": [{agent_name: str, calls: int, success_rate: float}],
                    "date_range": {
                        "start": str (ISO),
                        "end": str (ISO)
                    }
                }
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        # Get days parameter (default 30)
        days = request.args.get('days', 30, type=int)
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400

        # Get filter parameters
        filter_agent_ids = request.args.get('agent_ids', '')  # Comma-separated agent IDs
        filter_outcomes = request.args.get('outcomes', '')  # Comma-separated outcomes
        filter_direction = request.args.get('direction', '')  # inbound/outbound
        filter_time_of_day = request.args.get('time_of_day', '')  # morning/afternoon/evening/night

        db = SessionLocal()
        try:
            # Verify ownership of brand
            brand = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Get all personas for this brand
            personas = db.query(Persona).filter(
                Persona.brandProfileId == brand_id
            ).all()
            persona_ids = [p.id for p in personas]

            if not persona_ids:
                # No personas for this brand yet - return empty analytics
                return jsonify({
                    'success': True,
                    'data': {
                        'brand_id': brand_id,
                        'brand_name': brand.companyName,
                        'total_calls': 0,
                        'success_rate': 0.0,
                        'avg_duration': 0.0,
                        'total_cost': 0.0,
                        'calls_by_outcome': {},
                        'calls_by_day': [],
                        'agent_performance': [],
                        'date_range': {
                            'start': start_date.isoformat(),
                            'end': end_date.isoformat()
                        }
                    }
                }), 200

            # Get all agents for these personas
            agents = db.query(AgentConfig).filter(
                AgentConfig.personaId.in_(persona_ids)
            ).all()
            agent_ids = [a.id for a in agents]
            agent_map = {a.id: a for a in agents}

            if not agent_ids:
                # No agents for these personas yet - return empty analytics
                return jsonify({
                    'success': True,
                    'data': {
                        'brand_id': brand_id,
                        'brand_name': brand.companyName,
                        'total_calls': 0,
                        'success_rate': 0.0,
                        'avg_duration': 0.0,
                        'total_cost': 0.0,
                        'calls_by_outcome': {},
                        'calls_by_day': [],
                        'agent_performance': [],
                        'date_range': {
                            'start': start_date.isoformat(),
                            'end': end_date.isoformat()
                        }
                    }
                }), 200

            # Build query with filters
            query = db.query(CallLog).filter(
                CallLog.agentConfigId.in_(agent_ids),
                CallLog.startedAt >= start_date,
                CallLog.startedAt <= end_date
            )

            # Apply agent filter
            if filter_agent_ids:
                filter_agent_list = [aid.strip() for aid in filter_agent_ids.split(',') if aid.strip()]
                if filter_agent_list:
                    query = query.filter(CallLog.agentConfigId.in_(filter_agent_list))

            # Apply outcome filter
            if filter_outcomes:
                filter_outcome_list = [o.strip() for o in filter_outcomes.split(',') if o.strip()]
                if filter_outcome_list:
                    query = query.filter(CallLog.outcome.in_(filter_outcome_list))

            # Apply direction filter
            if filter_direction:
                query = query.filter(CallLog.direction == filter_direction)

            # Get all calls
            calls = query.all()

            # Apply time of day filter (post-query since it depends on time extraction)
            if filter_time_of_day and calls:
                filtered_calls = []
                for call in calls:
                    hour = call.startedAt.hour
                    if filter_time_of_day == 'morning' and 6 <= hour < 12:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'afternoon' and 12 <= hour < 17:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'evening' and 17 <= hour < 21:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'night' and (hour >= 21 or hour < 6):
                        filtered_calls.append(call)
                calls = filtered_calls

            # Calculate metrics
            total_calls = len(calls)

            if total_calls == 0:
                return jsonify({
                    'success': True,
                    'data': {
                        'brand_id': brand_id,
                        'brand_name': brand.companyName,
                        'total_calls': 0,
                        'success_rate': 0.0,
                        'avg_duration': 0.0,
                        'total_cost': 0.0,
                        'calls_by_outcome': {},
                        'calls_by_day': [],
                        'agent_performance': [],
                        'date_range': {
                            'start': start_date.isoformat(),
                            'end': end_date.isoformat()
                        }
                    }
                }), 200

            # Success rate (completed calls)
            completed_calls = sum(1 for c in calls if c.outcome == 'completed')
            success_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0.0

            # Average duration
            durations = [c.duration for c in calls if c.duration is not None]
            avg_duration = sum(durations) / len(durations) if durations else 0.0

            # Total cost
            costs = []
            for c in calls:
                if c.cost:
                    try:
                        costs.append(float(c.cost))
                    except (ValueError, TypeError):
                        pass
            total_cost = sum(costs)

            # Calls by outcome
            calls_by_outcome = defaultdict(int)
            for call in calls:
                outcome = call.outcome or 'unknown'
                calls_by_outcome[outcome] += 1

            # Calls by day (for chart)
            calls_by_day_map = defaultdict(int)
            for call in calls:
                day = call.startedAt.date().isoformat()
                calls_by_day_map[day] += 1

            # Fill in missing days with 0
            current_date = start_date.date()
            calls_by_day = []
            while current_date <= end_date.date():
                day_str = current_date.isoformat()
                calls_by_day.append({
                    'date': day_str,
                    'count': calls_by_day_map.get(day_str, 0)
                })
                current_date += timedelta(days=1)

            # Agent performance
            agent_stats = defaultdict(lambda: {'calls': 0, 'completed': 0})
            for call in calls:
                if call.agentConfigId:
                    agent_stats[call.agentConfigId]['calls'] += 1
                    if call.outcome == 'completed':
                        agent_stats[call.agentConfigId]['completed'] += 1

            agent_performance = []
            for agent_id, stats in agent_stats.items():
                agent = agent_map.get(agent_id)
                if agent:
                    success_rate_agent = (stats['completed'] / stats['calls'] * 100) if stats['calls'] > 0 else 0.0
                    agent_performance.append({
                        'agent_id': agent_id,
                        'agent_name': agent.name,
                        'calls': stats['calls'],
                        'success_rate': round(success_rate_agent, 1)
                    })

            # Sort by calls descending
            agent_performance.sort(key=lambda x: x['calls'], reverse=True)

            return jsonify({
                'success': True,
                'data': {
                    'brand_id': brand_id,
                    'brand_name': brand.companyName,
                    'total_calls': total_calls,
                    'success_rate': round(success_rate, 1),
                    'avg_duration': round(avg_duration, 1),
                    'total_cost': round(total_cost, 2),
                    'calls_by_outcome': dict(calls_by_outcome),
                    'calls_by_day': calls_by_day,
                    'agent_performance': agent_performance,
                    'date_range': {
                        'start': start_date.isoformat(),
                        'end': end_date.isoformat()
                    }
                }
            }), 200

        except Exception as e:
            print(f"❌ Error fetching brand analytics: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>/analytics/export/csv', methods=['GET'])
    def export_brand_analytics_csv(brand_id):
        """
        Export brand analytics as CSV

        Params:
            brand_id: str - Brand UUID

        Query Params:
            days: int (optional) - Number of days to analyze (default: 30)

        Returns:
            CSV file download
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        days = request.args.get('days', 30, type=int)
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400

        db = SessionLocal()
        try:
            # Verify ownership
            brand = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Get filter parameters
            filter_agent_ids = request.args.get('agent_ids', '')  # Comma-separated
            filter_outcomes = request.args.get('outcomes', '')  # Comma-separated
            filter_direction = request.args.get('direction', '')  # inbound/outbound
            filter_time_of_day = request.args.get('time_of_day', '')  # morning/afternoon/evening/night

            # Get analytics data (reuse logic from analytics endpoint)
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            personas = db.query(Persona).filter(
                Persona.brandProfileId == brand_id
            ).all()
            persona_ids = [p.id for p in personas]

            if not persona_ids:
                # Create empty CSV
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(['No Data', 'No personas found for this brand'])

                response = make_response(output.getvalue())
                response.headers['Content-Type'] = 'text/csv'
                response.headers['Content-Disposition'] = f'attachment; filename=analytics_{brand.companyName.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.csv'
                return response

            agents = db.query(AgentConfig).filter(
                AgentConfig.personaId.in_(persona_ids)
            ).all()
            agent_ids = [a.id for a in agents]
            agent_map = {a.id: a for a in agents}

            if not agent_ids:
                # Create empty CSV
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(['No Data', 'No agents found for this brand'])

                response = make_response(output.getvalue())
                response.headers['Content-Type'] = 'text/csv'
                response.headers['Content-Disposition'] = f'attachment; filename=analytics_{brand.companyName.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.csv'
                return response

            # Build query with filters
            query = db.query(CallLog).filter(
                CallLog.agentConfigId.in_(agent_ids),
                CallLog.startedAt >= start_date,
                CallLog.startedAt <= end_date
            )

            # Apply agent filter
            if filter_agent_ids:
                filter_agent_list = [aid.strip() for aid in filter_agent_ids.split(',') if aid.strip()]
                if filter_agent_list:
                    query = query.filter(CallLog.agentConfigId.in_(filter_agent_list))

            # Apply outcome filter
            if filter_outcomes:
                filter_outcome_list = [o.strip() for o in filter_outcomes.split(',') if o.strip()]
                if filter_outcome_list:
                    query = query.filter(CallLog.outcome.in_(filter_outcome_list))

            # Apply direction filter
            if filter_direction:
                query = query.filter(CallLog.direction == filter_direction)

            calls = query.all()

            # Apply time of day filter (post-query)
            if filter_time_of_day and calls:
                filtered_calls = []
                for call in calls:
                    hour = call.startedAt.hour
                    if filter_time_of_day == 'morning' and 6 <= hour < 12:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'afternoon' and 12 <= hour < 17:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'evening' and 17 <= hour < 21:
                        filtered_calls.append(call)
                    elif filter_time_of_day == 'night' and (hour >= 21 or hour < 6):
                        filtered_calls.append(call)
                calls = filtered_calls

            # Calculate metrics
            total_calls = len(calls)
            completed_calls = sum(1 for c in calls if c.outcome == 'completed')
            success_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0.0
            durations = [c.duration for c in calls if c.duration is not None]
            avg_duration = sum(durations) / len(durations) if durations else 0.0
            costs = []
            for c in calls:
                if c.cost:
                    try:
                        costs.append(float(c.cost))
                    except (ValueError, TypeError):
                        pass
            total_cost = sum(costs)

            # Agent performance
            agent_stats = defaultdict(lambda: {'calls': 0, 'completed': 0})
            for call in calls:
                if call.agentConfigId:
                    agent_stats[call.agentConfigId]['calls'] += 1
                    if call.outcome == 'completed':
                        agent_stats[call.agentConfigId]['completed'] += 1

            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)

            # Header
            writer.writerow(['Brand Analytics Report'])
            writer.writerow(['Brand Name', brand.companyName])
            writer.writerow(['Date Range', f'{start_date.date()} to {end_date.date()}'])
            writer.writerow(['Generated', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
            writer.writerow([])

            # Summary metrics
            writer.writerow(['Summary Metrics'])
            writer.writerow(['Total Calls', total_calls])
            writer.writerow(['Success Rate', f'{success_rate:.1f}%'])
            writer.writerow(['Average Duration (seconds)', f'{avg_duration:.1f}'])
            writer.writerow(['Total Cost', f'${total_cost:.2f}'])
            writer.writerow([])

            # Calls by outcome
            writer.writerow(['Calls by Outcome'])
            calls_by_outcome = defaultdict(int)
            for call in calls:
                outcome = call.outcome or 'unknown'
                calls_by_outcome[outcome] += 1

            writer.writerow(['Outcome', 'Count'])
            for outcome, count in sorted(calls_by_outcome.items()):
                writer.writerow([outcome.capitalize(), count])
            writer.writerow([])

            # Agent performance
            writer.writerow(['Agent Performance'])
            writer.writerow(['Agent Name', 'Total Calls', 'Completed Calls', 'Success Rate'])
            for agent_id, stats in agent_stats.items():
                agent = agent_map.get(agent_id)
                if agent:
                    agent_success_rate = (stats['completed'] / stats['calls'] * 100) if stats['calls'] > 0 else 0.0
                    writer.writerow([
                        agent.name,
                        stats['calls'],
                        stats['completed'],
                        f'{agent_success_rate:.1f}%'
                    ])
            writer.writerow([])

            # Daily call log
            writer.writerow(['Daily Call Log'])
            calls_by_day = defaultdict(int)
            for call in calls:
                day = call.startedAt.date().isoformat()
                calls_by_day[day] += 1

            writer.writerow(['Date', 'Call Count'])
            for day in sorted(calls_by_day.keys()):
                writer.writerow([day, calls_by_day[day]])

            # Create response
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'text/csv'
            filename = f'analytics_{brand.companyName.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.csv'
            response.headers['Content-Disposition'] = f'attachment; filename={filename}'

            return response

        except Exception as e:
            print(f"❌ Error exporting CSV: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/brands/<brand_id>/analytics/export/pdf', methods=['GET'])
    def export_brand_analytics_pdf(brand_id):
        """
        Export brand analytics as PDF

        Params:
            brand_id: str - Brand UUID

        Query Params:
            days: int (optional) - Number of days to analyze (default: 30)

        Returns:
            PDF file download
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        days = request.args.get('days', 30, type=int)
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400

        db = SessionLocal()
        try:
            # Verify ownership
            brand = db.query(BrandProfile).filter(
                BrandProfile.id == brand_id,
                BrandProfile.userId == user_id
            ).first()

            if not brand:
                return jsonify({'error': 'Brand not found or access denied'}), 404

            # Get filter parameters
            filter_agent_ids = request.args.get('agent_ids', '')  # Comma-separated
            filter_outcomes = request.args.get('outcomes', '')  # Comma-separated
            filter_direction = request.args.get('direction', '')  # inbound/outbound
            filter_time_of_day = request.args.get('time_of_day', '')  # morning/afternoon/evening/night

            # Get analytics data
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            personas = db.query(Persona).filter(
                Persona.brandProfileId == brand_id
            ).all()
            persona_ids = [p.id for p in personas]

            if not persona_ids:
                agents = []
                calls = []
            else:
                agents = db.query(AgentConfig).filter(
                    AgentConfig.personaId.in_(persona_ids)
                ).all()

            agent_ids = [a.id for a in agents]
            agent_map = {a.id: a for a in agents}

            if not agent_ids:
                calls = []
            else:
                # Build query with filters
                query = db.query(CallLog).filter(
                    CallLog.agentConfigId.in_(agent_ids),
                    CallLog.startedAt >= start_date,
                    CallLog.startedAt <= end_date
                )

                # Apply agent filter
                if filter_agent_ids:
                    filter_agent_list = [aid.strip() for aid in filter_agent_ids.split(',') if aid.strip()]
                    if filter_agent_list:
                        query = query.filter(CallLog.agentConfigId.in_(filter_agent_list))

                # Apply outcome filter
                if filter_outcomes:
                    filter_outcome_list = [o.strip() for o in filter_outcomes.split(',') if o.strip()]
                    if filter_outcome_list:
                        query = query.filter(CallLog.outcome.in_(filter_outcome_list))

                # Apply direction filter
                if filter_direction:
                    query = query.filter(CallLog.direction == filter_direction)

                calls = query.all()

                # Apply time of day filter (post-query)
                if filter_time_of_day and calls:
                    filtered_calls = []
                    for call in calls:
                        hour = call.startedAt.hour
                        if filter_time_of_day == 'morning' and 6 <= hour < 12:
                            filtered_calls.append(call)
                        elif filter_time_of_day == 'afternoon' and 12 <= hour < 17:
                            filtered_calls.append(call)
                        elif filter_time_of_day == 'evening' and 17 <= hour < 21:
                            filtered_calls.append(call)
                        elif filter_time_of_day == 'night' and (hour >= 21 or hour < 6):
                            filtered_calls.append(call)
                    calls = filtered_calls

            # Calculate metrics
            total_calls = len(calls)
            completed_calls = sum(1 for c in calls if c.outcome == 'completed')
            success_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0.0
            durations = [c.duration for c in calls if c.duration is not None]
            avg_duration = sum(durations) / len(durations) if durations else 0.0
            costs = []
            for c in calls:
                if c.cost:
                    try:
                        costs.append(float(c.cost))
                    except (ValueError, TypeError):
                        pass
            total_cost = sum(costs)

            # Agent performance
            agent_stats = defaultdict(lambda: {'calls': 0, 'completed': 0})
            for call in calls:
                if call.agentConfigId:
                    agent_stats[call.agentConfigId]['calls'] += 1
                    if call.outcome == 'completed':
                        agent_stats[call.agentConfigId]['completed'] += 1

            # Calls by outcome
            calls_by_outcome = defaultdict(int)
            for call in calls:
                outcome = call.outcome or 'unknown'
                calls_by_outcome[outcome] += 1

            # Create PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []

            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1f2937'),
                spaceAfter=30,
            )
            story.append(Paragraph(f'Brand Analytics Report', title_style))
            story.append(Spacer(1, 0.2*inch))

            # Brand info
            info_style = styles['Normal']
            story.append(Paragraph(f'<b>Brand Name:</b> {brand.companyName}', info_style))
            story.append(Paragraph(f'<b>Date Range:</b> {start_date.date()} to {end_date.date()}', info_style))
            story.append(Paragraph(f'<b>Generated:</b> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', info_style))
            story.append(Spacer(1, 0.3*inch))

            # Summary metrics table
            story.append(Paragraph('<b>Summary Metrics</b>', styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))

            summary_data = [
                ['Metric', 'Value'],
                ['Total Calls', str(total_calls)],
                ['Success Rate', f'{success_rate:.1f}%'],
                ['Avg Duration (seconds)', f'{avg_duration:.1f}'],
                ['Total Cost', f'${total_cost:.2f}']
            ]
            summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(summary_table)
            story.append(Spacer(1, 0.3*inch))

            # Calls by outcome
            if calls_by_outcome:
                story.append(Paragraph('<b>Calls by Outcome</b>', styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))

                outcome_data = [['Outcome', 'Count']]
                for outcome, count in sorted(calls_by_outcome.items()):
                    outcome_data.append([outcome.capitalize(), str(count)])

                outcome_table = Table(outcome_data, colWidths=[3*inch, 2*inch])
                outcome_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(outcome_table)
                story.append(Spacer(1, 0.3*inch))

            # Agent performance
            if agent_stats:
                story.append(Paragraph('<b>Agent Performance</b>', styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))

                agent_data = [['Agent Name', 'Total Calls', 'Completed', 'Success Rate']]
                for agent_id, stats in agent_stats.items():
                    agent = agent_map.get(agent_id)
                    if agent:
                        agent_success_rate = (stats['completed'] / stats['calls'] * 100) if stats['calls'] > 0 else 0.0
                        agent_data.append([
                            agent.name,
                            str(stats['calls']),
                            str(stats['completed']),
                            f'{agent_success_rate:.1f}%'
                        ])

                agent_table = Table(agent_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
                agent_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(agent_table)

            # Build PDF
            doc.build(story)

            # Create response
            buffer.seek(0)
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            filename = f'analytics_{brand.companyName.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.pdf'
            response.headers['Content-Disposition'] = f'attachment; filename={filename}'

            return response

        except Exception as e:
            print(f"❌ Error exporting PDF: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()
