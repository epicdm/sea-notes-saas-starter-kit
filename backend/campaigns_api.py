"""
Autonomous Calling Campaigns API
Endpoints for managing outbound calling campaigns with autonomous execution
"""

import os
import uuid
import csv
import io
from datetime import datetime, timedelta
from flask import jsonify, request
from sqlalchemy import text, func
from database import SessionLocal


def setup_campaigns_endpoints(app):
    """Set up autonomous calling campaigns API endpoints"""

    @app.route('/api/campaigns', methods=['GET'])
    def list_campaigns():
        """
        Get all campaigns for current user

        Query params:
            - status: filter by status (draft, active, paused, completed, cancelled)
            - brand_id: filter by brand

        Returns:
            {
                "success": true,
                "data": [Campaign[], ...]
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Build query
            query = text("""
                SELECT
                    c.id,
                    c."userId",
                    c."brandId",
                    c.name,
                    c.description,
                    c.status,
                    c."agentId",
                    c."scheduleConfig",
                    c."leadSource",
                    c."leadListUrl",
                    c."totalLeads",
                    c.progress,
                    c.called,
                    c.successful,
                    c.remaining,
                    c."qualificationConfig",
                    c."createdAt",
                    c."updatedAt",
                    c."startedAt",
                    c."completedAt",
                    a.name as agent_name,
                    bp."companyName" as brand_name
                FROM campaigns c
                LEFT JOIN agent_configs a ON c."agentId" = a.id
                LEFT JOIN brand_profiles bp ON c."brandId" = bp.id
                WHERE c."userId" = :user_id
            """)

            params = {'user_id': user_id}

            # Add filters
            status_filter = request.args.get('status')
            if status_filter:
                query = text(str(query) + ' AND c.status = :status')
                params['status'] = status_filter

            brand_id_filter = request.args.get('brand_id')
            if brand_id_filter:
                query = text(str(query) + ' AND c."brandId" = :brand_id')
                params['brand_id'] = brand_id_filter

            query = text(str(query) + ' ORDER BY c."createdAt" DESC')

            result = db.execute(query, params)
            campaigns = []

            for row in result:
                campaigns.append({
                    'id': row[0],
                    'userId': row[1],
                    'brandId': row[2],
                    'name': row[3],
                    'description': row[4],
                    'status': row[5],
                    'agentId': row[6],
                    'scheduleConfig': row[7],
                    'leadSource': row[8],
                    'leadListUrl': row[9],
                    'totalLeads': row[10],
                    'progress': row[11],
                    'called': row[12],
                    'successful': row[13],
                    'remaining': row[14],
                    'qualificationConfig': row[15],
                    'createdAt': row[16].isoformat() if row[16] else None,
                    'updatedAt': row[17].isoformat() if row[17] else None,
                    'startedAt': row[18].isoformat() if row[18] else None,
                    'completedAt': row[19].isoformat() if row[19] else None,
                    'agentName': row[20],
                    'brandName': row[21]
                })

            return jsonify({
                'success': True,
                'data': campaigns
            }), 200

        except Exception as e:
            print(f"L Error listing campaigns: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns', methods=['POST'])
    def create_campaign():
        """
        Create a new campaign

        Body:
            {
                "name": "Q1 2024 Outreach",
                "description": "...",
                "brandId": "uuid",
                "agentId": "uuid",
                "scheduleConfig": {
                    "timezone": "America/New_York",
                    "callWindows": [{...}],
                    "maxCallsPerDay": 100,
                    "maxCallsPerLead": 3,
                    "retryDelayHours": 24
                },
                "qualificationConfig": {...}
            }
        """
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'agentId', 'scheduleConfig']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        db = SessionLocal()
        try:
            campaign_id = str(uuid.uuid4())

            db.execute(text("""
                INSERT INTO campaigns (
                    id, "userId", "brandId", name, description, status,
                    "agentId", "scheduleConfig", "leadSource",
                    "qualificationConfig", "createdAt", "updatedAt"
                ) VALUES (
                    :id, :user_id, :brand_id, :name, :description, 'draft',
                    :agent_id, :schedule_config::jsonb, :lead_source,
                    :qualification_config::jsonb, NOW(), NOW()
                )
            """), {
                'id': campaign_id,
                'user_id': user_id,
                'brand_id': data.get('brandId'),
                'name': data['name'],
                'description': data.get('description'),
                'agent_id': data['agentId'],
                'schedule_config': str(data['scheduleConfig']).replace("'", '"'),
                'lead_source': data.get('leadSource', 'csv'),
                'qualification_config': str(data.get('qualificationConfig', {})).replace("'", '"') if data.get('qualificationConfig') else None
            })

            db.commit()

            return jsonify({
                'success': True,
                'data': {'id': campaign_id}
            }), 201

        except Exception as e:
            db.rollback()
            print(f"L Error creating campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>', methods=['GET'])
    def get_campaign(campaign_id):
        """Get single campaign details"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT
                    c.*,
                    a.name as agent_name,
                    bp."companyName" as brand_name
                FROM campaigns c
                LEFT JOIN agent_configs a ON c."agentId" = a.id
                LEFT JOIN brand_profiles bp ON c."brandId" = bp.id
                WHERE c.id = :campaign_id AND c."userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            campaign = {
                'id': row[0],
                'userId': row[1],
                'brandId': row[2],
                'name': row[3],
                'description': row[4],
                'status': row[5],
                'agentId': row[6],
                'scheduleConfig': row[7],
                'leadSource': row[8],
                'leadListUrl': row[9],
                'totalLeads': row[10],
                'progress': row[11],
                'called': row[12],
                'successful': row[13],
                'remaining': row[14],
                'qualificationConfig': row[15],
                'createdAt': row[16].isoformat() if row[16] else None,
                'updatedAt': row[17].isoformat() if row[17] else None,
                'startedAt': row[18].isoformat() if row[18] else None,
                'completedAt': row[19].isoformat() if row[19] else None,
                'agentName': row[20],
                'brandName': row[21]
            }

            return jsonify({
                'success': True,
                'data': campaign
            }), 200

        except Exception as e:
            print(f"L Error getting campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>', methods=['PUT'])
    def update_campaign(campaign_id):
        """Update campaign details"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()

        db = SessionLocal()
        try:
            # Check ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Build update query
            update_fields = []
            params = {'campaign_id': campaign_id, 'user_id': user_id}

            if 'name' in data:
                update_fields.append('name = :name')
                params['name'] = data['name']

            if 'description' in data:
                update_fields.append('description = :description')
                params['description'] = data['description']

            if 'scheduleConfig' in data:
                update_fields.append('"scheduleConfig" = :schedule_config::jsonb')
                params['schedule_config'] = str(data['scheduleConfig']).replace("'", '"')

            if 'qualificationConfig' in data:
                update_fields.append('"qualificationConfig" = :qualification_config::jsonb')
                params['qualification_config'] = str(data['qualificationConfig']).replace("'", '"')

            if not update_fields:
                return jsonify({'error': 'No fields to update'}), 400

            update_fields.append('"updatedAt" = NOW()')

            db.execute(text(f"""
                UPDATE campaigns
                SET {', '.join(update_fields)}
                WHERE id = :campaign_id AND "userId" = :user_id
            """), params)

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign updated successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error updating campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>', methods=['DELETE'])
    def delete_campaign(campaign_id):
        """Delete a campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Check ownership
            result = db.execute(text("""
                SELECT status FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            # Don't allow deleting active campaigns
            if row[0] == 'active':
                return jsonify({'error': 'Cannot delete active campaign. Pause it first.'}), 400

            db.execute(text("""
                DELETE FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign deleted successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error deleting campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    # ============================================
    # Campaign Control Endpoints
    # ============================================

    @app.route('/api/campaigns/<campaign_id>/start', methods=['POST'])
    def start_campaign(campaign_id):
        """Start a campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Check ownership and status
            result = db.execute(text("""
                SELECT status, "totalLeads" FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            status, total_leads = row[0], row[1]

            if status == 'active':
                return jsonify({'error': 'Campaign already active'}), 400

            if total_leads == 0:
                return jsonify({'error': 'Cannot start campaign with no leads'}), 400

            # Update status
            db.execute(text("""
                UPDATE campaigns
                SET status = 'active',
                    "startedAt" = CASE WHEN "startedAt" IS NULL THEN NOW() ELSE "startedAt" END,
                    "updatedAt" = NOW()
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign started successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error starting campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/pause', methods=['POST'])
    def pause_campaign(campaign_id):
        """Pause an active campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT status FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            if row[0] != 'active':
                return jsonify({'error': 'Campaign is not active'}), 400

            db.execute(text("""
                UPDATE campaigns
                SET status = 'paused', "updatedAt" = NOW()
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign paused successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error pausing campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/resume', methods=['POST'])
    def resume_campaign(campaign_id):
        """Resume a paused campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT status FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            if row[0] != 'paused':
                return jsonify({'error': 'Campaign is not paused'}), 400

            db.execute(text("""
                UPDATE campaigns
                SET status = 'active', "updatedAt" = NOW()
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign resumed successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error resuming campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/stop', methods=['POST'])
    def stop_campaign(campaign_id):
        """Stop a campaign (mark as completed or cancelled)"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT status FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            if row[0] in ['completed', 'cancelled']:
                return jsonify({'error': 'Campaign already stopped'}), 400

            db.execute(text("""
                UPDATE campaigns
                SET status = 'cancelled',
                    "completedAt" = NOW(),
                    "updatedAt" = NOW()
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            db.commit()

            return jsonify({
                'success': True,
                'message': 'Campaign stopped successfully'
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error stopping campaign: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    # ============================================
    # Campaign Progress & Analytics
    # ============================================

    @app.route('/api/campaigns/<campaign_id>/progress', methods=['GET'])
    def get_campaign_progress(campaign_id):
        """Get real-time campaign progress metrics"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Get campaign progress
            result = db.execute(text("""
                SELECT
                    c.progress,
                    c."totalLeads",
                    c.called,
                    c.successful,
                    c.remaining,
                    c.status,
                    COUNT(CASE WHEN cc.status = 'in_progress' THEN 1 END) as in_progress_calls,
                    COUNT(CASE WHEN cc.status = 'pending' THEN 1 END) as pending_calls
                FROM campaigns c
                LEFT JOIN campaign_calls cc ON c.id = cc."campaignId"
                WHERE c.id = :campaign_id AND c."userId" = :user_id
                GROUP BY c.id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            row = result.fetchone()
            if not row:
                return jsonify({'error': 'Campaign not found'}), 404

            return jsonify({
                'success': True,
                'data': {
                    'progress': row[0],
                    'totalLeads': row[1],
                    'called': row[2],
                    'successful': row[3],
                    'remaining': row[4],
                    'status': row[5],
                    'inProgressCalls': row[6],
                    'pendingCalls': row[7]
                }
            }), 200

        except Exception as e:
            print(f"L Error getting campaign progress: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/calls', methods=['GET'])
    def get_campaign_calls(campaign_id):
        """Get all calls for a campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Verify ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Get calls
            result = db.execute(text("""
                SELECT
                    cc.*,
                    fl.name as lead_name,
                    fl.email as lead_email
                FROM campaign_calls cc
                LEFT JOIN funnel_leads fl ON cc."leadId" = fl.id
                WHERE cc."campaignId" = :campaign_id
                ORDER BY cc."createdAt" DESC
            """), {'campaign_id': campaign_id})

            calls = []
            for row in result:
                calls.append({
                    'id': row[0],
                    'campaignId': row[1],
                    'leadId': row[2],
                    'phoneNumber': row[3],
                    'callSid': row[4],
                    'liveKitRoomName': row[5],
                    'status': row[6],
                    'outcome': row[7],
                    'duration': row[8],
                    'startedAt': row[9].isoformat() if row[9] else None,
                    'endedAt': row[10].isoformat() if row[10] else None,
                    'cost': float(row[11]) if row[11] else None,
                    'qualificationData': row[12],
                    'transcriptUrl': row[13],
                    'recordingUrl': row[14],
                    'attemptNumber': row[16],
                    'maxAttempts': row[17],
                    'nextRetryAt': row[18].isoformat() if row[18] else None,
                    'createdAt': row[19].isoformat() if row[19] else None,
                    'leadName': row[21],
                    'leadEmail': row[22]
                })

            return jsonify({
                'success': True,
                'data': calls
            }), 200

        except Exception as e:
            print(f"L Error getting campaign calls: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/analytics', methods=['GET'])
    def get_campaign_analytics(campaign_id):
        """Get campaign analytics and statistics"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Verify ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Get analytics
            result = db.execute(text("""
                SELECT
                    COUNT(*) as total_calls,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_calls,
                    COUNT(CASE WHEN status = 'no_answer' THEN 1 END) as no_answer_calls,
                    COUNT(CASE WHEN outcome = 'qualified' THEN 1 END) as qualified_leads,
                    COUNT(CASE WHEN outcome = 'unqualified' THEN 1 END) as unqualified_leads,
                    AVG(duration) as avg_duration,
                    SUM(duration) as total_duration,
                    SUM(cost) as total_cost,
                    MIN("createdAt") as first_call_at,
                    MAX("createdAt") as last_call_at
                FROM campaign_calls
                WHERE "campaignId" = :campaign_id
            """), {'campaign_id': campaign_id})

            row = result.fetchone()

            return jsonify({
                'success': True,
                'data': {
                    'totalCalls': row[0],
                    'completedCalls': row[1],
                    'failedCalls': row[2],
                    'noAnswerCalls': row[3],
                    'qualifiedLeads': row[4],
                    'unqualifiedLeads': row[5],
                    'avgDuration': float(row[6]) if row[6] else 0,
                    'totalDuration': row[7] or 0,
                    'totalCost': float(row[8]) if row[8] else 0,
                    'firstCallAt': row[9].isoformat() if row[9] else None,
                    'lastCallAt': row[10].isoformat() if row[10] else None
                }
            }), 200

        except Exception as e:
            print(f"L Error getting campaign analytics: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    # ============================================
    # Lead Management
    # ============================================

    @app.route('/api/campaigns/<campaign_id>/leads', methods=['GET'])
    def get_campaign_leads(campaign_id):
        """Get all leads for a campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = SessionLocal()
        try:
            # Verify ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Get leads
            result = db.execute(text("""
                SELECT
                    id, name, email, phone, "leadData",
                    "callAttempts", "lastCalledAt", "lastCallOutcome",
                    "createdAt"
                FROM funnel_leads
                WHERE "campaignId" = :campaign_id
                ORDER BY "createdAt" DESC
            """), {'campaign_id': campaign_id})

            leads = []
            for row in result:
                leads.append({
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'phone': row[3],
                    'leadData': row[4],
                    'callAttempts': row[5],
                    'lastCalledAt': row[6].isoformat() if row[6] else None,
                    'lastCallOutcome': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None
                })

            return jsonify({
                'success': True,
                'data': leads
            }), 200

        except Exception as e:
            print(f"L Error getting campaign leads: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/leads/add', methods=['POST'])
    def add_campaign_lead(campaign_id):
        """Add a single lead to campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()

        # Validate required fields
        if not data.get('phone'):
            return jsonify({'error': 'Phone number required'}), 400

        db = SessionLocal()
        try:
            # Verify ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Create lead
            lead_id = str(uuid.uuid4())

            db.execute(text("""
                INSERT INTO funnel_leads (
                    id, "campaignId", name, email, phone, "leadData",
                    "callAttempts", "createdAt"
                ) VALUES (
                    :id, :campaign_id, :name, :email, :phone, :lead_data::jsonb,
                    0, NOW()
                )
            """), {
                'id': lead_id,
                'campaign_id': campaign_id,
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data['phone'],
                'lead_data': str(data.get('leadData', {})).replace("'", '"')
            })

            # Update campaign total leads
            db.execute(text("""
                UPDATE campaigns
                SET "totalLeads" = "totalLeads" + 1,
                    remaining = remaining + 1,
                    "updatedAt" = NOW()
                WHERE id = :campaign_id
            """), {'campaign_id': campaign_id})

            db.commit()

            return jsonify({
                'success': True,
                'data': {'id': lead_id}
            }), 201

        except Exception as e:
            db.rollback()
            print(f"L Error adding lead: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/campaigns/<campaign_id>/leads/upload', methods=['POST'])
    def upload_campaign_leads(campaign_id):
        """Upload CSV of leads to campaign"""
        user_id = app.get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be CSV format'}), 400

        db = SessionLocal()
        try:
            # Verify ownership
            result = db.execute(text("""
                SELECT id FROM campaigns
                WHERE id = :campaign_id AND "userId" = :user_id
            """), {'campaign_id': campaign_id, 'user_id': user_id})

            if not result.fetchone():
                return jsonify({'error': 'Campaign not found'}), 404

            # Parse CSV
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_reader = csv.DictReader(stream)

            leads_added = 0
            for row in csv_reader:
                if not row.get('phone'):
                    continue  # Skip rows without phone

                lead_id = str(uuid.uuid4())

                # Extract lead data
                lead_data = {k: v for k, v in row.items() if k not in ['name', 'email', 'phone']}

                db.execute(text("""
                    INSERT INTO funnel_leads (
                        id, "campaignId", name, email, phone, "leadData",
                        "callAttempts", "createdAt"
                    ) VALUES (
                        :id, :campaign_id, :name, :email, :phone, :lead_data::jsonb,
                        0, NOW()
                    )
                """), {
                    'id': lead_id,
                    'campaign_id': campaign_id,
                    'name': row.get('name'),
                    'email': row.get('email'),
                    'phone': row['phone'],
                    'lead_data': str(lead_data).replace("'", '"')
                })

                leads_added += 1

            # Update campaign total leads
            db.execute(text("""
                UPDATE campaigns
                SET "totalLeads" = "totalLeads" + :leads_added,
                    remaining = remaining + :leads_added,
                    "updatedAt" = NOW()
                WHERE id = :campaign_id
            """), {'campaign_id': campaign_id, 'leads_added': leads_added})

            db.commit()

            return jsonify({
                'success': True,
                'message': f'{leads_added} leads uploaded successfully',
                'data': {'leadsAdded': leads_added}
            }), 200

        except Exception as e:
            db.rollback()
            print(f"L Error uploading leads: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    print(" Autonomous Calling Campaigns API registered at /api/campaigns")
