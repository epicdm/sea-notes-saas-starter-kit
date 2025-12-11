"""
Funnel Management API
Endpoints for creating and managing lead capture funnels
"""
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
import uuid
from datetime import datetime
from database import SessionLocal, Funnel, FunnelPage, FunnelLead, User
from sqlalchemy import text

logger = logging.getLogger(__name__)

funnel_api = Blueprint('funnel_api', __name__, url_prefix='/api/user/funnels')

def get_current_user_id():
    """Get current user ID from request"""
    from flask import session
    if 'user_id' in session:
        return session['user_id']

    # Check X-User-Email header
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


@funnel_api.route('', methods=['GET'])
@cross_origin()
def list_funnels():
    """List all funnels for current user"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnels = db.query(Funnel).filter(Funnel.userId == user_id).all()

            funnel_list = []
            for funnel in funnels:
                # Count pages and submissions
                page_count = len(funnel.pages)
                submission_count = len(funnel.submissions)
                lead_count = db.query(FunnelLead).filter(FunnelLead.funnelId == funnel.id).count()

                funnel_list.append({
                    'id': funnel.id,
                    'name': funnel.name,
                    'slug': funnel.slug,
                    'description': funnel.description,
                    'funnelType': funnel.funnelType,
                    'isPublished': funnel.isPublished,
                    'customDomain': funnel.customDomain,
                    'themeConfig': funnel.themeConfig,
                    'pageCount': page_count,
                    'submissionCount': submission_count,
                    'leadCount': lead_count,
                    'createdAt': funnel.createdAt.isoformat(),
                    'updatedAt': funnel.updatedAt.isoformat()
                })

            return jsonify({
                'funnels': funnel_list,
                'count': len(funnel_list)
            })
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error listing funnels: {e}")
        return jsonify({'error': 'Failed to list funnels'}), 500


@funnel_api.route('/<funnel_id>', methods=['GET'])
@cross_origin()
def get_funnel(funnel_id: str):
    """Get funnel details with pages"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            # Get pages
            pages = db.query(FunnelPage).filter(
                FunnelPage.funnelId == funnel_id
            ).order_by(FunnelPage.pageOrder).all()

            page_list = [{
                'id': page.id,
                'pageOrder': page.pageOrder,
                'pageType': page.pageType,
                'name': page.name,
                'content': page.content,
                'formFields': page.formFields,
                'createdAt': page.createdAt.isoformat(),
                'updatedAt': page.updatedAt.isoformat()
            } for page in pages]

            return jsonify({
                'id': funnel.id,
                'userId': funnel.userId,
                'name': funnel.name,
                'slug': funnel.slug,
                'description': funnel.description,
                'funnelType': funnel.funnelType,
                'isPublished': funnel.isPublished,
                'customDomain': funnel.customDomain,
                'themeConfig': funnel.themeConfig,
                'seoConfig': funnel.seoConfig,
                'trackingConfig': funnel.trackingConfig,
                'pages': page_list,
                'createdAt': funnel.createdAt.isoformat(),
                'updatedAt': funnel.updatedAt.isoformat()
            })
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting funnel: {e}")
        return jsonify({'error': 'Failed to get funnel'}), 500


@funnel_api.route('', methods=['POST'])
@cross_origin()
def create_funnel():
    """Create funnel from template or scratch"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json
        template_id = data.get('template_id')

        db = SessionLocal()
        try:
            # If creating from template, load template data
            if template_id:
                from sqlalchemy import text
                template_row = db.execute(
                    text('SELECT "templateData" FROM funnel_templates WHERE id = :id'),
                    {'id': template_id}
                ).fetchone()

                if not template_row:
                    return jsonify({'error': 'Template not found'}), 404

                template_data = template_row[0]
                funnel_config = template_data['funnel']
                pages_data = template_data['pages']
            else:
                # Create from scratch
                funnel_config = data.get('funnelConfig', {})
                pages_data = data.get('pages', [])

            # Generate unique slug
            base_slug = data.get('slug') or data['name'].lower().replace(' ', '-')
            slug = base_slug
            counter = 1
            while db.query(Funnel).filter(Funnel.slug == slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1

            # Create funnel
            funnel_id = str(uuid.uuid4())
            funnel = Funnel(
                id=funnel_id,
                userId=user_id,
                name=data['name'],
                slug=slug,
                description=data.get('description', ''),
                funnelType=funnel_config.get('funnelType', 'lead_capture'),
                isPublished=False,
                customDomain=data.get('customDomain'),
                themeConfig=funnel_config.get('themeConfig'),
                seoConfig=funnel_config.get('seoConfig'),
                trackingConfig=funnel_config.get('trackingConfig'),
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            db.add(funnel)

            # Create pages
            for page_data in pages_data:
                page = FunnelPage(
                    id=str(uuid.uuid4()),
                    funnelId=funnel_id,
                    pageOrder=page_data.get('pageOrder', 0),
                    pageType=page_data['pageType'],
                    name=page_data['name'],
                    content=page_data.get('content', {}),
                    formFields=page_data.get('formFields', []),
                    createdAt=datetime.utcnow(),
                    updatedAt=datetime.utcnow()
                )
                db.add(page)

            db.commit()
            db.refresh(funnel)

            logger.info(f"Funnel created: {funnel_id} by user {user_id}")

            return jsonify({
                'id': funnel.id,
                'name': funnel.name,
                'slug': funnel.slug,
                'funnelType': funnel.funnelType,
                'isPublished': funnel.isPublished,
                'createdAt': funnel.createdAt.isoformat()
            }), 201

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error creating funnel: {e}", exc_info=True)
        return jsonify({'error': 'Failed to create funnel', 'details': str(e)}), 500


@funnel_api.route('/<funnel_id>', methods=['PUT'])
@cross_origin()
def update_funnel(funnel_id: str):
    """Update funnel configuration"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        data = request.json

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            # Update fields
            if 'name' in data:
                funnel.name = data['name']
            if 'description' in data:
                funnel.description = data['description']
            if 'themeConfig' in data:
                funnel.themeConfig = data['themeConfig']
            if 'seoConfig' in data:
                funnel.seoConfig = data['seoConfig']
            if 'trackingConfig' in data:
                funnel.trackingConfig = data['trackingConfig']

            funnel.updatedAt = datetime.utcnow()

            db.commit()
            db.refresh(funnel)

            return jsonify({
                'id': funnel.id,
                'name': funnel.name,
                'updatedAt': funnel.updatedAt.isoformat()
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error updating funnel: {e}")
        return jsonify({'error': 'Failed to update funnel'}), 500


@funnel_api.route('/<funnel_id>', methods=['DELETE'])
@cross_origin()
def delete_funnel(funnel_id: str):
    """Delete funnel and all pages"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            db.delete(funnel)
            db.commit()

            logger.info(f"Funnel deleted: {funnel_id} by user {user_id}")

            return jsonify({
                'success': True,
                'message': 'Funnel deleted'
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error deleting funnel: {e}")
        return jsonify({'error': 'Failed to delete funnel'}), 500


@funnel_api.route('/<funnel_id>/publish', methods=['POST'])
@cross_origin()
def publish_funnel(funnel_id: str):
    """Publish funnel (make public)"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            funnel.isPublished = True
            funnel.updatedAt = datetime.utcnow()
            db.commit()

            return jsonify({
                'success': True,
                'isPublished': True,
                'publicUrl': f"/f/{funnel.slug}"
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error publishing funnel: {e}")
        return jsonify({'error': 'Failed to publish funnel'}), 500


@funnel_api.route('/<funnel_id>/unpublish', methods=['POST'])
@cross_origin()
def unpublish_funnel(funnel_id: str):
    """Unpublish funnel (make private)"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            funnel.isPublished = False
            funnel.updatedAt = datetime.utcnow()
            db.commit()

            return jsonify({
                'success': True,
                'isPublished': False
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error unpublishing funnel: {e}")
        return jsonify({'error': 'Failed to unpublish funnel'}), 500


@funnel_api.route('/<funnel_id>/analytics', methods=['GET'])
@cross_origin()
def get_funnel_analytics(funnel_id: str):
    """Get funnel analytics and metrics"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.id == funnel_id,
                Funnel.userId == user_id
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found'}), 404

            # Calculate metrics
            total_submissions = len(funnel.submissions)
            total_leads = db.query(FunnelLead).filter(FunnelLead.funnelId == funnel_id).count()

            # Status breakdown
            status_counts = {}
            for status in ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']:
                count = db.query(FunnelLead).filter(
                    FunnelLead.funnelId == funnel_id,
                    FunnelLead.status == status
                ).count()
                status_counts[status] = count

            # Conversion rate (leads converted / total leads)
            conversion_rate = (status_counts['converted'] / total_leads * 100) if total_leads > 0 else 0

            return jsonify({
                'funnelId': funnel_id,
                'totalSubmissions': total_submissions,
                'totalLeads': total_leads,
                'conversionRate': round(conversion_rate, 2),
                'statusBreakdown': status_counts,
                'isPublished': funnel.isPublished
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting funnel analytics: {e}")
        return jsonify({'error': 'Failed to get analytics'}), 500
