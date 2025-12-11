"""
Campaign Executor Service
Background service that monitors and executes active campaigns
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
import time
import threading
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pytz
from sqlalchemy import text
from database import SessionLocal

# Import LiveKit telephony manager
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from livekit_telephony import telephony_manager

logger = logging.getLogger(__name__)


class CampaignExecutor:
    """Background service that manages autonomous calling campaigns"""

    def __init__(self, poll_interval=30):
        self.poll_interval = poll_interval
        self.running = False
        self.thread = None
        logger.info("[CAMPAIGN] Executor initialized")

    def start(self):
        if self.running:
            logger.warning("Campaign Executor already running")
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        logger.info("[CAMPAIGN] Executor started")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("[CAMPAIGN] Executor stopped")

    def _run_loop(self):
        logger.info("[CAMPAIGN] Executor loop started")
        while self.running:
            try:
                self._process_active_campaigns()
            except Exception as e:
                logger.error(f"[CAMPAIGN ERROR] {e}", exc_info=True)
            time.sleep(self.poll_interval)

    def _process_active_campaigns(self):
        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT id, name, "scheduleConfig", "agentId",
                       "totalLeads", called, remaining, progress
                FROM campaigns WHERE status = 'active'
                ORDER BY "createdAt" ASC
            """))
            campaigns = result.fetchall()
            if not campaigns:
                return
            logger.info(f"[CAMPAIGN] Processing {len(campaigns)} active campaigns")
            for campaign in campaigns:
                campaign_id, campaign_name, schedule_config = campaign[0], campaign[1], campaign[2]
                try:
                    if not self._is_within_call_window(schedule_config):
                        continue
                    if not self._check_daily_call_limit(db, campaign_id, schedule_config):
                        continue
                    self._process_campaign_batch(db, campaign_id, campaign_name, schedule_config)
                except Exception as e:
                    logger.error(f"[CAMPAIGN ERROR] Processing '{campaign_name}': {e}")
        finally:
            db.close()

    def _is_within_call_window(self, schedule_config: dict) -> bool:
        if not schedule_config or not isinstance(schedule_config, dict):
            return True
        tz_name = schedule_config.get('timezone', 'UTC')
        try:
            tz = pytz.timezone(tz_name)
        except:
            tz = pytz.UTC
        now = datetime.now(tz)
        current_day, current_hour = now.isoweekday(), now.hour
        call_windows = schedule_config.get('callWindows', [])
        if not call_windows:
            return True
        for window in call_windows:
            if window.get('dayOfWeek') == current_day:
                if window.get('startHour', 0) <= current_hour < window.get('endHour', 23):
                    return True
        return False

    def _check_daily_call_limit(self, db, campaign_id: str, schedule_config: dict) -> bool:
        max_calls_per_day = schedule_config.get('maxCallsPerDay', 1000)
        result = db.execute(text("""
            SELECT COUNT(*) FROM campaign_calls
            WHERE "campaignId" = :campaign_id AND DATE("createdAt") = CURRENT_DATE
        """), {'campaign_id': campaign_id})
        return result.fetchone()[0] < max_calls_per_day

    def _get_caller_phone_number(self, db, user_id: str, agent_id: str) -> Optional[str]:
        """Get an active phone number for outbound calling"""
        # Try to get an active phone number mapped to this agent
        result = db.execute(text("""
            SELECT "phoneNumber" FROM phone_mappings
            WHERE "userId" = :user_id AND "agentConfigId" = :agent_id AND "isActive" = true
            LIMIT 1
        """), {'user_id': user_id, 'agent_id': agent_id})
        row = result.fetchone()
        if row:
            return row[0]

        # Fallback: get any active phone number for this user
        result = db.execute(text("""
            SELECT "phoneNumber" FROM phone_mappings
            WHERE "userId" = :user_id AND "isActive" = true
            LIMIT 1
        """), {'user_id': user_id})
        row = result.fetchone()
        if row:
            return row[0]

        # Final fallback: use first available active phone
        result = db.execute(text("""
            SELECT "phoneNumber" FROM phone_mappings
            WHERE "isActive" = true
            LIMIT 1
        """))
        row = result.fetchone()
        return row[0] if row else None

    def _process_campaign_batch(self, db, campaign_id: str, campaign_name: str, schedule_config: dict):
        import uuid

        # Get campaign details including userId and agentId
        campaign_result = db.execute(text("""
            SELECT "userId", "agentId" FROM campaigns WHERE id = :campaign_id
        """), {'campaign_id': campaign_id})
        campaign_row = campaign_result.fetchone()
        if not campaign_row:
            logger.error(f"[CAMPAIGN ERROR] Campaign {campaign_id} not found")
            return

        user_id, agent_id = campaign_row[0], campaign_row[1]

        # Get outbound trunk ID from environment
        outbound_trunk_id = os.getenv('SIP_OUTBOUND_TRUNK_ID')
        if not outbound_trunk_id:
            logger.error("[CAMPAIGN ERROR] SIP_OUTBOUND_TRUNK_ID not configured")
            return

        # Get caller phone number
        from_number = self._get_caller_phone_number(db, user_id, agent_id)
        if not from_number:
            logger.error(f"[CAMPAIGN ERROR] No active phone number found for user {user_id}")
            return

        max_calls_per_lead = schedule_config.get('maxCallsPerLead', 3)
        result = db.execute(text("""
            SELECT fl.id, fl.name, fl.phone FROM funnel_leads fl
            WHERE fl."campaignId" = :campaign_id AND fl."callAttempts" < :max_attempts
            AND (fl."lastCalledAt" IS NULL OR (
                fl."lastCallOutcome" IN ('no_answer', 'busy', 'failed')
                AND fl."lastCalledAt" < NOW() - INTERVAL '1 hour'))
            ORDER BY fl."callAttempts" ASC, fl."lastCalledAt" ASC NULLS FIRST LIMIT 5
        """), {'campaign_id': campaign_id, 'max_attempts': max_calls_per_lead})
        leads = result.fetchall()
        if not leads:
            self._check_campaign_completion(db, campaign_id)
            return

        logger.info(f"[CAMPAIGN] Processing {len(leads)} leads for '{campaign_name}'")
        logger.info(f"[CAMPAIGN] Using caller ID: {from_number}, Trunk: {outbound_trunk_id}")

        for lead in leads:
            lead_id, lead_name, phone = lead[0], lead[1], lead[2]
            try:
                call_id = str(uuid.uuid4())

                # Create campaign_call record
                db.execute(text("""
                    INSERT INTO campaign_calls (
                        id, "campaignId", "leadId", "phoneNumber", status,
                        "attemptNumber", "maxAttempts", "createdAt", "updatedAt"
                    ) VALUES (:id, :campaign_id, :lead_id, :phone, 'pending', 1, 3, NOW(), NOW())
                """), {'id': call_id, 'campaign_id': campaign_id, 'lead_id': lead_id, 'phone': phone})
                db.commit()

                # Initiate outbound call via LiveKit
                logger.info(f"[CAMPAIGN] Initiating call to {lead_name} ({phone})")
                call_result = asyncio.run(telephony_manager.create_outbound_call(
                    from_number=from_number,
                    to_number=phone,
                    trunk_id=outbound_trunk_id,
                    agent_name="tst0002",  # Default agent name
                    agent_config_id=agent_id
                ))

                if call_result.get('success'):
                    room_name = call_result.get('room_name')
                    logger.info(f"[CAMPAIGN] ✅ Call initiated for {lead_name}: Room {room_name}")

                    # Update campaign_call with LiveKit room name and status
                    db.execute(text("""
                        UPDATE campaign_calls
                        SET "liveKitRoomName" = :room_name,
                            status = 'calling',
                            "startedAt" = NOW(),
                            "updatedAt" = NOW()
                        WHERE id = :call_id
                    """), {'room_name': room_name, 'call_id': call_id})

                    # Update lead tracking
                    db.execute(text("""
                        UPDATE funnel_leads SET "callAttempts" = "callAttempts" + 1,
                        "lastCalledAt" = NOW() WHERE id = :lead_id
                    """), {'lead_id': lead_id})

                    # Update campaign metrics
                    db.execute(text("""
                        UPDATE campaigns SET called = called + 1, remaining = remaining - 1,
                        "updatedAt" = NOW() WHERE id = :campaign_id
                    """), {'campaign_id': campaign_id})

                    db.commit()
                else:
                    error_msg = call_result.get('error', 'Unknown error')
                    logger.error(f"[CAMPAIGN] ❌ Call failed for {lead_name}: {error_msg}")

                    # Mark call as failed
                    db.execute(text("""
                        UPDATE campaign_calls
                        SET status = 'failed', "updatedAt" = NOW()
                        WHERE id = :call_id
                    """), {'call_id': call_id})
                    db.commit()

            except Exception as e:
                db.rollback()
                logger.error(f"[CAMPAIGN ERROR] Processing call for {lead_name}: {e}", exc_info=True)

        self._update_campaign_progress(db, campaign_id)

    def _update_campaign_progress(self, db, campaign_id: str):
        result = db.execute(text("""
            SELECT "totalLeads", called FROM campaigns WHERE id = :campaign_id
        """), {'campaign_id': campaign_id})
        row = result.fetchone()
        if not row:
            return
        progress = int((row[1] / row[0]) * 100) if row[0] > 0 else 0
        db.execute(text("""
            UPDATE campaigns SET progress = :progress, "updatedAt" = NOW()
            WHERE id = :campaign_id
        """), {'campaign_id': campaign_id, 'progress': progress})
        db.commit()

    def _check_campaign_completion(self, db, campaign_id: str):
        result = db.execute(text("""
            SELECT COUNT(*) FROM funnel_leads fl
            WHERE fl."campaignId" = :campaign_id AND fl."callAttempts" < 3
        """), {'campaign_id': campaign_id})
        if result.fetchone()[0] == 0:
            db.execute(text("""
                UPDATE campaigns SET status = 'completed', progress = 100,
                "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = :campaign_id
            """), {'campaign_id': campaign_id})
            db.commit()
            logger.info(f"[CAMPAIGN] {campaign_id} completed")


_executor = None

def get_executor():
    global _executor
    if _executor is None:
        _executor = CampaignExecutor()
    return _executor

def start_executor():
    get_executor().start()

def stop_executor():
    get_executor().stop()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    executor = CampaignExecutor(poll_interval=10)
    executor.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        executor.stop()
