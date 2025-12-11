"""
CSV Export API for LiveKit Voice Platform
Provides streaming CSV exports for calls, agents, phone numbers, and analytics
"""

import csv
import uuid
from io import StringIO
from datetime import datetime, timedelta
from flask import Blueprint, Response, stream_with_context, request, jsonify
from flask_cors import cross_origin
from sqlalchemy import func, and_, or_, Integer
from database import (
    SessionLocal, CallLog, AgentConfig, PhoneMapping,
    User, FunnelLead, ExportLog
)

export_api = Blueprint('export_api', __name__)


def get_current_user_id():
    """Extract user ID from X-User-Email header"""
    user_email = request.headers.get('X-User-Email')
    if not user_email:
        return None

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        return user.id if user else None
    finally:
        db.close()


def mask_phone_number(phone: str) -> str:
    """
    Mask middle digits of phone number for privacy.
    Example: +17678189426 → +17***9426
    """
    if not phone or len(phone) < 8:
        return phone
    return f"{phone[:3]}***{phone[-4:]}"


def generate_csv(rows, fieldnames):
    """
    Generator function for streaming CSV output.
    Yields CSV rows as strings for efficient memory usage.

    Args:
        rows: Iterable of dict rows
        fieldnames: List of CSV column names

    Yields:
        CSV rows as strings
    """
    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction='ignore')

    # Write header
    writer.writeheader()
    yield buffer.getvalue()
    buffer.seek(0)
    buffer.truncate(0)

    # Write rows in batches
    for row in rows:
        writer.writerow(row)
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)


def log_export(user_id, export_type, filters, row_count, file_size):
    """
    Log export operation for audit trail.

    Args:
        user_id: UUID of user performing export
        export_type: Type of export (calls|agents|phone_numbers|analytics)
        filters: Dict of filter parameters used
        row_count: Number of rows exported
        file_size: Size of export in bytes
    """
    db = SessionLocal()
    try:
        log = ExportLog(
            id=str(uuid.uuid4()),
            userId=user_id,
            exportType=export_type,
            filters=filters,
            rowCount=row_count,
            fileSizeBytes=file_size,
            ipAddress=request.headers.get('X-Forwarded-For', request.remote_addr),
            userAgent=request.headers.get('User-Agent'),
            createdAt=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to log export: {e}")
        db.rollback()
    finally:
        db.close()


@export_api.route('/calls', methods=['GET'])
@cross_origin()
def export_calls():
    """
    Export call logs to CSV with filtering.

    Query Parameters:
    - start_date: ISO datetime (optional, default: 30 days ago)
    - end_date: ISO datetime (optional, default: now)
    - agent_id: Filter by agent (optional)
    - status: Filter by status (optional)

    Returns: Streaming CSV response
    """
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401

    # Parse filters
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    agent_id = request.args.get('agent_id')
    status = request.args.get('status')

    # Default date range: last 30 days
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        except:
            start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)

    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except:
            end_date = datetime.utcnow()
    else:
        end_date = datetime.utcnow()

    db = SessionLocal()
    try:
        # Build query with filters
        query = db.query(CallLog).filter(CallLog.userId == user_id)
        query = query.filter(CallLog.startedAt >= start_date)
        query = query.filter(CallLog.startedAt <= end_date)

        if agent_id:
            query = query.filter(CallLog.agentConfigId == agent_id)
        if status:
            query = query.filter(CallLog.status == status)

        query = query.order_by(CallLog.startedAt.desc())

        # Generator function for rows
        def row_generator():
            row_count = 0
            total_size = 0

            for call in query.yield_per(100):  # Batch size 100
                # Parse cost (stored as string in database)
                try:
                    total_cost = float(call.cost) if call.cost else 0
                except (ValueError, TypeError):
                    total_cost = 0

                row = {
                    'call_id': call.id,
                    'start_time': call.startedAt.isoformat() if call.startedAt else '',
                    'end_time': call.endedAt.isoformat() if call.endedAt else '',
                    'duration_seconds': call.duration or 0,
                    'agent_name': '',
                    'phone_number': mask_phone_number(call.phoneNumber) if call.phoneNumber else '',
                    'direction': call.direction or 'inbound',
                    'status': call.status or 'unknown',
                    'outcome': call.outcome or '',
                    'total_cost_usd': round(total_cost, 4),
                    'recording_url': call.recordingUrl or ''
                }

                # Get agent name if available
                if call.agentConfigId:
                    agent = db.query(AgentConfig).filter(AgentConfig.id == call.agentConfigId).first()
                    if agent:
                        row['agent_name'] = agent.name

                row_count += 1
                total_size += len(str(row))
                yield row

            # Log export after completion
            try:
                log_export(
                    user_id=user_id,
                    export_type='calls',
                    filters={
                        'start_date': start_date.isoformat(),
                        'end_date': end_date.isoformat(),
                        'agent_id': agent_id,
                        'status': status
                    },
                    row_count=row_count,
                    file_size=total_size
                )
            except Exception as e:
                print(f"Export logging failed: {e}")

        fieldnames = [
            'call_id', 'start_time', 'end_time', 'duration_seconds',
            'agent_name', 'phone_number', 'direction', 'status', 'outcome',
            'total_cost_usd', 'recording_url'
        ]

        filename = f"calls_{user_id[:8]}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

        return Response(
            stream_with_context(generate_csv(row_generator(), fieldnames)),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Cache-Control': 'no-cache'
            }
        )
    except Exception as e:
        print(f"Export calls error: {e}")
        return jsonify({'error': 'Export failed', 'message': str(e)}), 500
    finally:
        db.close()


@export_api.route('/agents', methods=['GET'])
@cross_origin()
def export_agents():
    """
    Export agents list to CSV.

    Query Parameters:
    - format: csv (default)

    Returns: Streaming CSV response
    """
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401

    db = SessionLocal()
    try:
        query = db.query(AgentConfig).filter(AgentConfig.userId == user_id)
        query = query.order_by(AgentConfig.createdAt.desc())

        def row_generator():
            row_count = 0
            total_size = 0

            for agent in query.yield_per(100):
                # Count phone numbers assigned
                phone_count = db.query(func.count(PhoneMapping.phoneNumber)).filter(
                    PhoneMapping.agentConfigId == agent.id
                ).scalar() or 0

                # Count total calls
                call_count = db.query(func.count(CallLog.id)).filter(
                    CallLog.agentConfigId == agent.id
                ).scalar() or 0

                # Truncate instructions
                instructions = agent.instructions or ''
                if len(instructions) > 200:
                    instructions = instructions[:197] + '...'

                row = {
                    'agent_id': agent.id,
                    'agent_name': agent.name,
                    'description': agent.description or '',
                    'agent_type': agent.agentType or 'inbound',
                    'tts_provider': agent.ttsProvider or '',
                    'tts_voice_id': agent.ttsVoiceId or '',
                    'llm_model': agent.llmModel or '',
                    'instructions': instructions,
                    'created_at': agent.createdAt.isoformat() if agent.createdAt else '',
                    'updated_at': agent.updatedAt.isoformat() if agent.updatedAt else '',
                    'phone_numbers_assigned': phone_count,
                    'total_calls': call_count
                }

                row_count += 1
                total_size += len(str(row))
                yield row

            # Log export
            try:
                log_export(
                    user_id=user_id,
                    export_type='agents',
                    filters={},
                    row_count=row_count,
                    file_size=total_size
                )
            except Exception as e:
                print(f"Export logging failed: {e}")

        fieldnames = [
            'agent_id', 'agent_name', 'description', 'agent_type',
            'tts_provider', 'tts_voice_id', 'llm_model', 'instructions',
            'created_at', 'updated_at', 'phone_numbers_assigned', 'total_calls'
        ]

        filename = f"agents_{user_id[:8]}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

        return Response(
            stream_with_context(generate_csv(row_generator(), fieldnames)),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Cache-Control': 'no-cache'
            }
        )
    except Exception as e:
        print(f"Export agents error: {e}")
        return jsonify({'error': 'Export failed', 'message': str(e)}), 500
    finally:
        db.close()


@export_api.route('/phone-numbers', methods=['GET'])
@cross_origin()
def export_phone_numbers():
    """
    Export phone numbers to CSV.

    Query Parameters:
    - status: Filter by status (optional)
    - format: csv (default)

    Returns: Streaming CSV response
    """
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401

    is_active = request.args.get('is_active')

    db = SessionLocal()
    try:
        query = db.query(PhoneMapping).filter(PhoneMapping.userId == user_id)

        if is_active is not None:
            # Convert string to boolean
            active_bool = is_active.lower() in ('true', '1', 'yes')
            query = query.filter(PhoneMapping.isActive == active_bool)

        query = query.order_by(PhoneMapping.phoneNumber)

        def row_generator():
            row_count = 0
            total_size = 0

            for phone in query.yield_per(100):
                agent_name = ''
                if phone.agentConfigId:
                    agent = db.query(AgentConfig).filter(AgentConfig.id == phone.agentConfigId).first()
                    if agent:
                        agent_name = agent.name

                row = {
                    'phone_number': phone.phoneNumber,
                    'is_active': 'yes' if phone.isActive else 'no',
                    'agent_name': agent_name,
                    'agent_id': phone.agentConfigId or '',
                    'sip_trunk_id': phone.sipTrunkId or '',
                    'sip_config_id': phone.sipConfigId or '',
                    'created_at': phone.createdAt.isoformat() if phone.createdAt else ''
                }

                row_count += 1
                total_size += len(str(row))
                yield row

            # Log export
            try:
                log_export(
                    user_id=user_id,
                    export_type='phone_numbers',
                    filters={'is_active': is_active},
                    row_count=row_count,
                    file_size=total_size
                )
            except Exception as e:
                print(f"Export logging failed: {e}")

        fieldnames = [
            'phone_number', 'is_active', 'agent_name', 'agent_id',
            'sip_trunk_id', 'sip_config_id', 'created_at'
        ]

        filename = f"phone_numbers_{user_id[:8]}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

        return Response(
            stream_with_context(generate_csv(row_generator(), fieldnames)),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Cache-Control': 'no-cache'
            }
        )
    except Exception as e:
        print(f"Export phone numbers error: {e}")
        return jsonify({'error': 'Export failed', 'message': str(e)}), 500
    finally:
        db.close()


@export_api.route('/analytics', methods=['GET'])
@cross_origin()
def export_analytics():
    """
    Export aggregated analytics to CSV.

    Query Parameters:
    - period: 24h|7d|30d|90d (default: 30d)
    - format: csv (default)

    Returns: Streaming CSV response with daily aggregation
    """
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401

    period = request.args.get('period', '30d')

    # Parse period
    period_map = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
    }
    days = period_map.get(period, 30)
    start_date = datetime.utcnow() - timedelta(days=days)

    db = SessionLocal()
    try:
        # Query daily aggregated data
        # Note: CallLog.cost is stored as string, need to cast to numeric
        query = db.query(
            func.date(CallLog.startedAt).label('date'),
            func.count(CallLog.id).label('total_calls'),
            func.sum(
                func.cast(CallLog.status == 'completed', Integer)
            ).label('completed_calls'),
            func.sum(
                func.cast(CallLog.status == 'failed', Integer)
            ).label('failed_calls'),
            func.sum(CallLog.duration).label('total_duration'),
            func.avg(CallLog.duration).label('avg_duration')
        ).filter(
            and_(
                CallLog.userId == user_id,
                CallLog.startedAt >= start_date
            )
        ).group_by(
            func.date(CallLog.startedAt)
        ).order_by(
            func.date(CallLog.startedAt)
        )

        def row_generator():
            row_count = 0
            total_size = 0

            for record in query.all():
                # Convert duration from seconds to minutes
                total_minutes = (record.total_duration or 0) / 60
                avg_seconds = record.avg_duration or 0

                row = {
                    'date': record.date.isoformat() if record.date else '',
                    'total_calls': record.total_calls or 0,
                    'completed_calls': record.completed_calls or 0,
                    'failed_calls': record.failed_calls or 0,
                    'total_duration_minutes': round(total_minutes, 2),
                    'avg_call_duration_seconds': round(avg_seconds, 2)
                }

                row_count += 1
                total_size += len(str(row))
                yield row

            # Log export
            try:
                log_export(
                    user_id=user_id,
                    export_type='analytics',
                    filters={'period': period},
                    row_count=row_count,
                    file_size=total_size
                )
            except Exception as e:
                print(f"Export logging failed: {e}")

        fieldnames = [
            'date', 'total_calls', 'completed_calls', 'failed_calls',
            'total_duration_minutes', 'avg_call_duration_seconds'
        ]

        filename = f"analytics_{user_id[:8]}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

        return Response(
            stream_with_context(generate_csv(row_generator(), fieldnames)),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Cache-Control': 'no-cache'
            }
        )
    except Exception as e:
        print(f"Export analytics error: {e}")
        return jsonify({'error': 'Export failed', 'message': str(e)}), 500
    finally:
        db.close()
