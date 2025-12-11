"""
Public Funnel API
No authentication required - for public form submissions
"""
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
import uuid
from datetime import datetime
from database import SessionLocal, Funnel, FunnelPage, FunnelLead, FunnelSubmission
import re

logger = logging.getLogger(__name__)

public_funnel_api = Blueprint('public_funnel_api', __name__, url_prefix='/f')


def extract_utm_params(request):
    """Extract UTM parameters from request"""
    utm_params = {}
    for key in ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']:
        value = request.args.get(key)
        if value:
            utm_params[key.replace('utm_', '')] = value
    return utm_params if utm_params else None


def validate_field(field_config, value):
    """Validate field value against field configuration"""
    field_type = field_config.get('fieldType')
    required = field_config.get('required', False)
    validation_pattern = field_config.get('validation')

    # Check required
    if required and not value:
        return False, f"{field_config['label']} is required"

    # Skip validation if value is empty and not required
    if not value:
        return True, None

    # Type-specific validation
    if field_type == 'email':
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, value):
            return False, f"Invalid email format"

    if field_type == 'phone':
        # Basic phone validation (international formats)
        phone_pattern = r'^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$'
        if not re.match(phone_pattern, value):
            return False, f"Invalid phone number format"

    # Custom validation pattern
    if validation_pattern:
        try:
            if not re.match(validation_pattern, value):
                return False, f"{field_config['label']} format is invalid"
        except re.error:
            logger.warning(f"Invalid regex pattern: {validation_pattern}")

    return True, None


@public_funnel_api.route('/<slug>', methods=['GET'])
@cross_origin()
def get_funnel_by_slug(slug: str):
    """Get published funnel by slug (public access)"""
    try:
        db = SessionLocal()
        try:
            funnel = db.query(Funnel).filter(
                Funnel.slug == slug,
                Funnel.isPublished == True
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found or not published'}), 404

            # Get pages
            pages = db.query(FunnelPage).filter(
                FunnelPage.funnelId == funnel.id
            ).order_by(FunnelPage.pageOrder).all()

            page_list = [{
                'id': page.id,
                'pageOrder': page.pageOrder,
                'pageType': page.pageType,
                'name': page.name,
                'content': page.content,
                'formFields': page.formFields
            } for page in pages]

            return jsonify({
                'id': funnel.id,
                'name': funnel.name,
                'slug': funnel.slug,
                'description': funnel.description,
                'funnelType': funnel.funnelType,
                'themeConfig': funnel.themeConfig,
                'seoConfig': funnel.seoConfig,
                'trackingConfig': funnel.trackingConfig,
                'pages': page_list
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting funnel by slug: {e}")
        return jsonify({'error': 'Failed to load funnel'}), 500


@public_funnel_api.route('/<slug>/submit', methods=['POST'])
@cross_origin()
def submit_funnel(slug: str):
    """Submit funnel form (public access)"""
    try:
        data = request.json
        page_id = data.get('page_id')
        form_data = data.get('form_data', {})

        if not page_id:
            return jsonify({'error': 'page_id required'}), 400

        db = SessionLocal()
        try:
            # Get funnel by slug
            funnel = db.query(Funnel).filter(
                Funnel.slug == slug,
                Funnel.isPublished == True
            ).first()

            if not funnel:
                return jsonify({'error': 'Funnel not found or not published'}), 404

            # Get page
            page = db.query(FunnelPage).filter(
                FunnelPage.id == page_id,
                FunnelPage.funnelId == funnel.id
            ).first()

            if not page:
                return jsonify({'error': 'Page not found'}), 404

            # Validate form data against field definitions
            if page.formFields:
                for field_config in page.formFields:
                    field_name = field_config['name']
                    field_value = form_data.get(field_name)

                    is_valid, error_msg = validate_field(field_config, field_value)
                    if not is_valid:
                        return jsonify({'error': error_msg, 'field': field_name}), 400

            # Extract tracking data
            utm_params = extract_utm_params(request)
            ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
            user_agent = request.headers.get('User-Agent')
            referrer = request.headers.get('Referer')

            # Check if this is a lead-generating page (has email or phone)
            has_email = 'email' in form_data and form_data['email']
            has_phone = 'phone' in form_data and form_data['phone']
            create_lead = has_email or has_phone

            lead_id = None
            if create_lead:
                # Check for duplicate lead (by email or phone)
                existing_lead = None
                if has_email:
                    existing_lead = db.query(FunnelLead).filter(
                        FunnelLead.userId == funnel.userId,
                        FunnelLead.email == form_data['email']
                    ).first()

                if not existing_lead and has_phone:
                    existing_lead = db.query(FunnelLead).filter(
                        FunnelLead.userId == funnel.userId,
                        FunnelLead.phone == form_data['phone']
                    ).first()

                if existing_lead:
                    # Update existing lead
                    lead_id = existing_lead.id
                    if 'firstName' in form_data:
                        existing_lead.firstName = form_data['firstName']
                    if 'lastName' in form_data:
                        existing_lead.lastName = form_data['lastName']
                    if 'company' in form_data:
                        existing_lead.company = form_data['company']

                    # Merge custom fields
                    if existing_lead.customFields:
                        existing_lead.customFields.update(form_data)
                    else:
                        existing_lead.customFields = form_data

                    existing_lead.updatedAt = datetime.utcnow()

                    logger.info(f"Updated existing lead: {lead_id}")
                else:
                    # Create new lead
                    lead_id = str(uuid.uuid4())

                    # Calculate basic lead score
                    lead_score = 0
                    if has_email:
                        lead_score += 20
                    if has_phone:
                        lead_score += 20
                    if form_data.get('company'):
                        lead_score += 15
                    if form_data.get('firstName') and form_data.get('lastName'):
                        lead_score += 10

                    lead = FunnelLead(
                        id=lead_id,
                        userId=funnel.userId,
                        funnelId=funnel.id,
                        source='funnel',
                        firstName=form_data.get('firstName'),
                        lastName=form_data.get('lastName'),
                        email=form_data.get('email'),
                        phone=form_data.get('phone'),
                        company=form_data.get('company'),
                        customFields=form_data,
                        status='new',
                        leadScore=lead_score,
                        tags=[],
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow()
                    )
                    db.add(lead)

                    logger.info(f"Created new lead: {lead_id} from funnel {funnel.id}")

            # Create submission record
            submission_id = str(uuid.uuid4())
            submission = FunnelSubmission(
                id=submission_id,
                funnelId=funnel.id,
                leadId=lead_id,
                pageId=page_id,
                submissionData=form_data,
                ipAddress=ip_address,
                userAgent=user_agent,
                referrer=referrer,
                utmParams=utm_params,
                submittedAt=datetime.utcnow()
            )
            db.add(submission)

            db.commit()

            # Determine response based on page type and configuration
            response = {
                'success': True,
                'submissionId': submission_id
            }

            if lead_id:
                response['leadId'] = lead_id

            # Check if instant callback is configured (for emergency forms)
            if page.content and page.content.get('sections'):
                for section in page.content['sections']:
                    if section.get('type') == 'urgency':
                        response['instantCallback'] = True
                        response['callbackTime'] = '30 seconds'

            logger.info(f"Funnel submission: {submission_id} for funnel {slug}")

            return jsonify(response), 201

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error submitting funnel: {e}", exc_info=True)
        return jsonify({'error': 'Failed to submit form', 'details': str(e)}), 500


@public_funnel_api.route('/templates', methods=['GET'])
@cross_origin()
def list_templates():
    """List available funnel templates (public)"""
    try:
        db = SessionLocal()
        try:
            from sqlalchemy import text
            templates = db.execute(
                text('SELECT id, name, category, description, "previewImage" FROM funnel_templates WHERE "isActive" = TRUE ORDER BY category, name')
            ).fetchall()

            template_list = [{
                'id': t[0],
                'name': t[1],
                'category': t[2],
                'description': t[3],
                'previewImage': t[4]
            } for t in templates]

            return jsonify({
                'templates': template_list,
                'count': len(template_list)
            })

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error listing templates: {e}")
        return jsonify({'error': 'Failed to list templates'}), 500
