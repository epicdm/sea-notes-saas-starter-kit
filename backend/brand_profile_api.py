"""
Brand Profile Management API
Endpoints for creating and managing user brand profiles
"""

import os
import uuid
from datetime import datetime
from flask import jsonify, request
from sqlalchemy import text
from database import SessionLocal, BrandProfile, User
from brand_extractor import extract_brand_info


def setup_brand_profile_endpoints(app):
    """Set up brand profile API endpoints"""

    @app.route('/api/user/brand-profile', methods=['GET'])
    def get_brand_profile():
        """Get user's brand profile"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            brand_profile = db.query(BrandProfile).filter(
                BrandProfile.userId == user_id
            ).first()

            if not brand_profile:
                return jsonify({
                    'success': True,
                    'data': None
                }), 200

            return jsonify({
                'success': True,
                'data': {
                    'id': brand_profile.id,
                    'companyName': brand_profile.companyName,
                    'industry': brand_profile.industry,
                    'logoUrl': brand_profile.logoUrl,
                    'facebookUrl': brand_profile.facebookUrl,
                    'instagramUrl': brand_profile.instagramUrl,
                    'linkedinUrl': brand_profile.linkedinUrl,
                    'twitterUrl': brand_profile.twitterUrl,
                    'websiteUrl': brand_profile.websiteUrl,
                    'brandData': brand_profile.brandData or {},
                    'customBrandVoice': brand_profile.customBrandVoice,
                    'customToneGuidelines': brand_profile.customToneGuidelines,
                    'dosAndDonts': brand_profile.dosAndDonts or {'dos': [], 'donts': []},
                    'autoExtractEnabled': brand_profile.autoExtractEnabled,
                    'lastExtractionAt': brand_profile.lastExtractionAt.isoformat() if brand_profile.lastExtractionAt else None,
                    'createdAt': brand_profile.createdAt.isoformat() if brand_profile.createdAt else None,
                    'updatedAt': brand_profile.updatedAt.isoformat() if brand_profile.updatedAt else None
                }
            }), 200

        except Exception as e:
            print(f"❌ Error fetching brand profile: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/brand-profile', methods=['POST'])
    def create_brand_profile():
        """Create user's brand profile"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        # Validate required fields
        if not data.get('companyName'):
            return jsonify({'error': 'Company name is required'}), 400

        db = SessionLocal()
        try:
            # Check if brand profile already exists
            existing = db.query(BrandProfile).filter(
                BrandProfile.userId == user_id
            ).first()

            if existing:
                return jsonify({'error': 'Brand profile already exists. Use PUT to update.'}), 400

            # Create brand profile
            brand_profile = BrandProfile(
                id=str(uuid.uuid4()),
                userId=user_id,
                companyName=data['companyName'],
                industry=data.get('industry'),
                logoUrl=data.get('logoUrl'),
                facebookUrl=data.get('facebookUrl'),
                instagramUrl=data.get('instagramUrl'),
                linkedinUrl=data.get('linkedinUrl'),
                twitterUrl=data.get('twitterUrl'),
                websiteUrl=data.get('websiteUrl'),
                customBrandVoice=data.get('customBrandVoice'),
                customToneGuidelines=data.get('customToneGuidelines'),
                dosAndDonts=data.get('dosAndDonts'),
                autoExtractEnabled=data.get('autoExtractEnabled', True),
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
                    'companyName': brand_profile.companyName,
                    'industry': brand_profile.industry,
                    'logoUrl': brand_profile.logoUrl,
                    'createdAt': brand_profile.createdAt.isoformat()
                }
            }), 201

        except Exception as e:
            db.rollback()
            print(f"❌ Error creating brand profile: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/brand-profile', methods=['PUT'])
    def update_brand_profile():
        """Update user's brand profile"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        db = SessionLocal()
        try:
            brand_profile = db.query(BrandProfile).filter(
                BrandProfile.userId == user_id
            ).first()

            if not brand_profile:
                return jsonify({'error': 'Brand profile not found. Use POST to create.'}), 404

            # Update fields
            if 'companyName' in data:
                brand_profile.companyName = data['companyName']
            if 'industry' in data:
                brand_profile.industry = data['industry']
            if 'logoUrl' in data:
                brand_profile.logoUrl = data['logoUrl']
            if 'facebookUrl' in data:
                brand_profile.facebookUrl = data['facebookUrl']
            if 'instagramUrl' in data:
                brand_profile.instagramUrl = data['instagramUrl']
            if 'linkedinUrl' in data:
                brand_profile.linkedinUrl = data['linkedinUrl']
            if 'twitterUrl' in data:
                brand_profile.twitterUrl = data['twitterUrl']
            if 'websiteUrl' in data:
                brand_profile.websiteUrl = data['websiteUrl']
            if 'customBrandVoice' in data:
                brand_profile.customBrandVoice = data['customBrandVoice']
            if 'customToneGuidelines' in data:
                brand_profile.customToneGuidelines = data['customToneGuidelines']
            if 'dosAndDonts' in data:
                brand_profile.dosAndDonts = data['dosAndDonts']
            if 'autoExtractEnabled' in data:
                brand_profile.autoExtractEnabled = data['autoExtractEnabled']
            if 'brandData' in data:
                # Merge with existing brand data
                existing_data = brand_profile.brandData or {}
                existing_data.update(data['brandData'])
                brand_profile.brandData = existing_data

            brand_profile.updatedAt = datetime.utcnow()

            db.commit()
            db.refresh(brand_profile)

            return jsonify({
                'success': True,
                'data': {
                    'id': brand_profile.id,
                    'companyName': brand_profile.companyName,
                    'industry': brand_profile.industry,
                    'logoUrl': brand_profile.logoUrl,
                    'brandData': brand_profile.brandData or {},
                    'customBrandVoice': brand_profile.customBrandVoice,
                    'customToneGuidelines': brand_profile.customToneGuidelines,
                    'dosAndDonts': brand_profile.dosAndDonts or {'dos': [], 'donts': []},
                    'updatedAt': brand_profile.updatedAt.isoformat()
                }
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error updating brand profile: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/user/brand-profile/extract', methods=['POST'])
    def extract_brand_from_social():
        """
        Extract brand voice from social media URLs

        POST /api/user/brand-profile/extract
        Body: {
            "urls": {
                "facebook": "https://facebook.com/company",
                "instagram": "https://instagram.com/company",
                "website": "https://company.com"
            }
        }

        Returns: {
            "success": true,
            "extracted_data": {
                "business_description": "...",
                "brand_voice": "...",
                "target_audience": "...",
                ...
            }
        }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json
        urls = data.get('urls', {})

        if not urls:
            return jsonify({'error': 'No URLs provided'}), 400

        print(f"🔍 Extracting brand information from URLs: {urls}")

        try:
            # Use real extraction
            extracted_data = extract_brand_info(urls)
            print(f"✅ Brand extraction successful")
        except Exception as extraction_error:
            print(f"❌ Brand extraction failed: {extraction_error}")
            return jsonify({
                'success': False,
                'error': f'Failed to extract brand information: {str(extraction_error)}'
            }), 500

        # Update brand profile with extracted data
        db = SessionLocal()
        try:
            brand_profile = db.query(BrandProfile).filter(
                BrandProfile.userId == user_id
            ).first()

            if brand_profile:
                brand_profile.brandData = extracted_data
                brand_profile.lastExtractionAt = datetime.utcnow()
                brand_profile.updatedAt = datetime.utcnow()
                db.commit()

            return jsonify({
                'success': True,
                'extracted_data': extracted_data,
                'message': 'Brand data extracted successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"❌ Error extracting brand data: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()
