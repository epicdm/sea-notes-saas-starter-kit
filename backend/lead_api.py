"""
Lead Management API
Endpoints for managing funnel leads and pipeline
"""
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
import uuid
from datetime import datetime
from database import SessionLocal, FunnelLead, Funnel, User, AgentConfig
from sqlalchemy import or_, and_

logger = logging.getLogger(__name__)

lead_api = Blueprint('lead_api', __name__, url_prefix='/api/user/leads')

def get_current_user_id():
    """Get current user ID from request"""
    from flask import session
    if 'user_id' in session:
        return session['user_id']

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


@lead_api.route('', methods=['GET'])
@cross_origin()
def list_leads():
    """List leads with filters"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        # Get filters from query params
        status_filter = request.args.get('status')
        funnel_id_filter = request.args.get('funnel_id')
        search_query = request.args.get('search')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        db = SessionLocal()
        try:
            # Build query
            query = db.query(FunnelLead).filter(FunnelLead.userId == user_id)

            if status_filter:
                query = query.filter(FunnelLead.status == status_filter)

            if funnel_id_filter:
                query = query.filter(FunnelLead.funnelId == funnel_id_filter)

            if search_query:
                query = query.filter(
                    or_(
                        FunnelLead.firstName.ilike(f'%{search_query}%'),
                        FunnelLead.lastName.ilike(f'%{search_query}%'),
                        FunnelLead.email.ilike(f'%{search_query}%'),
                        FunnelLead.phone.ilike(f'%{search_query}%'),
                        FunnelLead.company.ilike(f'%{search_query}%')
                    )
                )

            # Get total count before pagination
            total_count = query.count()

            # Apply pagination and ordering
            leads = query.order_by(FunnelLead.createdAt.desc()).limit(limit).offset(offset).all()

            lead_list = []
            for lead in leads:
                # Get funnel name
                funnel_name = None
                if lead.funnelId:
                    funnel = db.query(Funnel).filter(Funnel.id == lead.funnelId).first()
                    if funnel:
                        funnel_name = funnel.name

                # Get assigned agent name
                agent_name = None
                if lead.assignedAgentId:
                    agent = db.query(AgentConfig).filter(AgentConfig.id == lead.assignedAgentId).first()
                    if agent:
                        agent_name = agent.name

                lead_list.append({
                    'id': lead.id,
                    'funnelId': lead.funnelId,
                    'funnelName': funnel_name,
                    'source': lead.source,
                    'firstName': lead.firstName,
                    'lastName': lead.lastName,
                    'email': lead.email,
                    'phone': lead.phone,
                    'company': lead.company,
                    'status': lead.status,
                    'assignedAgentId': lead.assignedAgentId,
                    'assignedAgentName': agent_name,
                    'leadScore': lead.leadScore,
                    'tags': lead.tags,
                    'customFields': lead.customFields,
                    'createdAt': lead.createdAt.isoformat(),
                    'updatedAt': lead.updatedAt.isoformat()
                })

            return jsonify({
                'leads': lead_list,
                'count': len(lead_list),
                'total': total_count,
                'limit': limit,
                'offset': offset
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error listing leads: {e}")
        return jsonify({'error': 'Failed to list leads'}), 500


@lead_api.route('/<lead_id>', methods=['GET'])
@cross_origin()
def get_lead(lead_id: str):
    """Get lead details"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            lead = db.query(FunnelLead).filter(
                FunnelLead.id == lead_id,
                FunnelLead.userId == user_id
            ).first()

            if not lead:
                return jsonify({'error': 'Lead not found'}), 404

            # Get funnel details
            funnel = None
            if lead.funnelId:
                funnel_obj = db.query(Funnel).filter(Funnel.id == lead.funnelId).first()
                if funnel_obj:
                    funnel = {
                        'id': funnel_obj.id,
                        'name': funnel_obj.name,
                        'slug': funnel_obj.slug
                    }

            # Get assigned agent details
            agent = None
            if lead.assignedAgentId:
                agent_obj = db.query(AgentConfig).filter(AgentConfig.id == lead.assignedAgentId).first()
                if agent_obj:
                    agent = {
                        'id': agent_obj.id,
                        'name': agent_obj.name
                    }

            return jsonify({
                'id': lead.id,
                'userId': lead.userId,
                'funnelId': lead.funnelId,
                'funnel': funnel,
                'source': lead.source,
                'firstName': lead.firstName,
                'lastName': lead.lastName,
                'email': lead.email,
                'phone': lead.phone,
                'company': lead.company,
                'customFields': lead.customFields,
                'status': lead.status,
                'assignedAgentId': lead.assignedAgentId,
                'assignedAgent': agent,
                'leadScore': lead.leadScore,
                'tags': lead.tags,
                'createdAt': lead.createdAt.isoformat(),
                'updatedAt': lead.updatedAt.isoformat()
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting lead: {e}")
        return jsonify({'error': 'Failed to get lead'}), 500


@lead_api.route('', methods=['POST'])
@cross_origin()
def create_lead():
    """Create lead manually"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json

        # Validate required fields
        if not data.get('email') and not data.get('phone'):
            return jsonify({'error': 'Email or phone required'}), 400

        db = SessionLocal()
        try:
            # Calculate lead score (basic implementation)
            lead_score = 0
            if data.get('email'):
                lead_score += 20
            if data.get('phone'):
                lead_score += 20
            if data.get('company'):
                lead_score += 15
            if data.get('firstName') and data.get('lastName'):
                lead_score += 10

            # Create lead
            lead_id = str(uuid.uuid4())
            lead = FunnelLead(
                id=lead_id,
                userId=user_id,
                funnelId=data.get('funnel_id'),
                source=data.get('source', 'manual'),
                firstName=data.get('firstName'),
                lastName=data.get('lastName'),
                email=data.get('email'),
                phone=data.get('phone'),
                company=data.get('company'),
                customFields=data.get('customFields', {}),
                status=data.get('status', 'new'),
                assignedAgentId=data.get('assignedAgentId'),
                leadScore=lead_score,
                tags=data.get('tags', []),
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

            db.add(lead)
            db.commit()
            db.refresh(lead)

            logger.info(f"Lead created manually: {lead_id} by user {user_id}")

            return jsonify({
                'id': lead.id,
                'firstName': lead.firstName,
                'lastName': lead.lastName,
                'email': lead.email,
                'phone': lead.phone,
                'status': lead.status,
                'leadScore': lead.leadScore,
                'createdAt': lead.createdAt.isoformat()
            }), 201

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error creating lead: {e}", exc_info=True)
        return jsonify({'error': 'Failed to create lead', 'details': str(e)}), 500


@lead_api.route('/<lead_id>', methods=['PUT'])
@cross_origin()
def update_lead(lead_id: str):
    """Update lead information"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json

        db = SessionLocal()
        try:
            lead = db.query(FunnelLead).filter(
                FunnelLead.id == lead_id,
                FunnelLead.userId == user_id
            ).first()

            if not lead:
                return jsonify({'error': 'Lead not found'}), 404

            # Update fields
            if 'firstName' in data:
                lead.firstName = data['firstName']
            if 'lastName' in data:
                lead.lastName = data['lastName']
            if 'email' in data:
                lead.email = data['email']
            if 'phone' in data:
                lead.phone = data['phone']
            if 'company' in data:
                lead.company = data['company']
            if 'customFields' in data:
                lead.customFields = data['customFields']
            if 'status' in data:
                lead.status = data['status']
            if 'tags' in data:
                lead.tags = data['tags']
            if 'leadScore' in data:
                lead.leadScore = data['leadScore']

            lead.updatedAt = datetime.utcnow()

            db.commit()
            db.refresh(lead)

            return jsonify({
                'id': lead.id,
                'status': lead.status,
                'updatedAt': lead.updatedAt.isoformat()
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error updating lead: {e}")
        return jsonify({'error': 'Failed to update lead'}), 500


@lead_api.route('/<lead_id>', methods=['DELETE'])
@cross_origin()
def delete_lead(lead_id: str):
    """Delete lead"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            lead = db.query(FunnelLead).filter(
                FunnelLead.id == lead_id,
                FunnelLead.userId == user_id
            ).first()

            if not lead:
                return jsonify({'error': 'Lead not found'}), 404

            db.delete(lead)
            db.commit()

            logger.info(f"Lead deleted: {lead_id} by user {user_id}")

            return jsonify({
                'success': True,
                'message': 'Lead deleted'
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error deleting lead: {e}")
        return jsonify({'error': 'Failed to delete lead'}), 500


@lead_api.route('/<lead_id>/assign-agent', methods=['POST'])
@cross_origin()
def assign_agent(lead_id: str):
    """Assign lead to an agent"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json
        agent_id = data.get('agent_id')

        if not agent_id:
            return jsonify({'error': 'agent_id required'}), 400

        db = SessionLocal()
        try:
            lead = db.query(FunnelLead).filter(
                FunnelLead.id == lead_id,
                FunnelLead.userId == user_id
            ).first()

            if not lead:
                return jsonify({'error': 'Lead not found'}), 404

            # Verify agent exists and user has access
            agent = db.query(AgentConfig).filter(
                AgentConfig.id == agent_id,
                AgentConfig.userId == user_id
            ).first()

            if not agent:
                return jsonify({'error': 'Agent not found'}), 404

            lead.assignedAgentId = agent_id
            lead.updatedAt = datetime.utcnow()

            db.commit()

            return jsonify({
                'success': True,
                'assignedAgentId': agent_id,
                'assignedAgentName': agent.name
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error assigning agent: {e}")
        return jsonify({'error': 'Failed to assign agent'}), 500


@lead_api.route('/<lead_id>/update-status', methods=['POST'])
@cross_origin()
def update_status(lead_id: str):
    """Update lead status"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json
        new_status = data.get('status')

        if not new_status:
            return jsonify({'error': 'status required'}), 400

        valid_statuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

        db = SessionLocal()
        try:
            lead = db.query(FunnelLead).filter(
                FunnelLead.id == lead_id,
                FunnelLead.userId == user_id
            ).first()

            if not lead:
                return jsonify({'error': 'Lead not found'}), 404

            old_status = lead.status
            lead.status = new_status
            lead.updatedAt = datetime.utcnow()

            db.commit()

            logger.info(f"Lead {lead_id} status changed: {old_status} → {new_status}")

            return jsonify({
                'success': True,
                'oldStatus': old_status,
                'newStatus': new_status
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error updating status: {e}")
        return jsonify({'error': 'Failed to update status'}), 500


@lead_api.route('/stats', methods=['GET'])
@cross_origin()
def get_lead_stats():
    """Get lead pipeline statistics"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            # Total leads
            total_leads = db.query(FunnelLead).filter(FunnelLead.userId == user_id).count()

            # Status breakdown
            status_counts = {}
            for status in ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']:
                count = db.query(FunnelLead).filter(
                    FunnelLead.userId == user_id,
                    FunnelLead.status == status
                ).count()
                status_counts[status] = count

            # Source breakdown
            source_counts = {}
            for source in ['funnel', 'manual', 'api', 'import']:
                count = db.query(FunnelLead).filter(
                    FunnelLead.userId == user_id,
                    FunnelLead.source == source
                ).count()
                if count > 0:
                    source_counts[source] = count

            # Conversion rate
            conversion_rate = (status_counts['converted'] / total_leads * 100) if total_leads > 0 else 0

            # Average lead score
            from sqlalchemy import func
            avg_score = db.query(func.avg(FunnelLead.leadScore)).filter(
                FunnelLead.userId == user_id
            ).scalar() or 0

            return jsonify({
                'totalLeads': total_leads,
                'conversionRate': round(conversion_rate, 2),
                'averageLeadScore': round(float(avg_score), 1),
                'statusBreakdown': status_counts,
                'sourceBreakdown': source_counts
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting lead stats: {e}")
        return jsonify({'error': 'Failed to get stats'}), 500
