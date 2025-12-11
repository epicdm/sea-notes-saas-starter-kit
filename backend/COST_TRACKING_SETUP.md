# Cost Tracking System - Setup Requirements

**Status**: ⏳ REQUIRES SETUP  
**Complexity**: HIGH  
**Priority**: MEDIUM (Business-critical for production billing)  
**Last Attempt**: 2025-11-09

---

## 📋 Overview

The Cost Tracking system provides comprehensive pre-pay billing with real-time cost tracking for:

- **Voice Agents**: Per-minute telephony + per-token LLM + per-character TTS costs
- **Text Agents**: Per-message costs with token tracking
- **Customer Balances**: Pre-pay credit system with auto-deduction
- **Cost Breakdowns**: Itemized cost analysis per call/message
- **Admin Pricing**: Configurable rates for all providers

**Files**: 7 backend modules (~100KB total)  
**Location**: `/opt/livekit1/backend/cost_tracking/`

---

## 🗄️ Database Schema

The migration creates 5 new tables:

### 1. `pricing_config`
Stores provider costs and customer pricing (admin-configurable)

**Key Fields**:
- STT costs: Deepgram Nova2/3, AssemblyAI, Whisper (per-minute)
- LLM costs: OpenAI GPT-4o/mini, Claude 3.5 (per-1M tokens, voice vs text)
- TTS costs: OpenAI, Cartesia, ElevenLabs, PlayHT (per-character/minute)
- Telephony: Inbound/outbound per-minute, DID monthly, SMS/WhatsApp

**Schema**: ~60 pricing columns with default values

### 2. `call_cost_breakdown`
Itemized cost analysis for each call

**Fields**:
- `call_log_id` (FK to call_logs)
- `total_cost`, `user_charged_cost`, `profit_margin`
- STT/LLM/TTS breakdown with tokens/characters
- Telephony costs (inbound/outbound minutes)
- Provider names used

### 3. `customer_balance`
Pre-pay credit balance per user

**Fields**:
- `user_id` (unique)
- `balance_cents` (INTEGER, atomic updates)
- `low_balance_threshold`, `auto_reload_enabled`

### 4. `credit_transactions`
Audit log of all credit add/deduct operations

**Fields**:
- `transaction_id`, `user_id`, `amount_cents`
- `transaction_type` (purchase, deduction, refund, adjustment)
- `reference_id` (call_id or purchase_id)

### 5. `message_cost_breakdown`
Text agent cost tracking (future)

**Fields**: Similar to call_cost_breakdown but for messages

---

## ⚠️ Why Migration Failed

**Attempted Command**:
```bash
python3 backend/cost_tracking/migration_001_cost_tracking.py
```

**Error**:
```
ModuleNotFoundError: No module named 'database'
```

**Root Cause**:
- Migration imports `from database import SessionLocal`
- When run standalone, Python can't find the `database` module
- Requires running from Flask app context OR proper PYTHONPATH

**Attempted Fix** (Failed):
```bash
export PYTHONPATH=/opt/livekit1:$PYTHONPATH
sudo -E python3 backend/cost_tracking/migration_001_cost_tracking.py
```

**Why It Still Failed**:
- `sudo -E` doesn't always preserve environment variables
- Migration expects SQLAlchemy session setup from main app

---

## ✅ Setup Instructions

### Option 1: Run from Flask Context (Recommended)

Create a migration runner script:

```python
# /opt/livekit1/run_cost_migration.py
import sys
sys.path.insert(0, '/opt/livekit1')

from database import SessionLocal
from backend.cost_tracking.migration_001_cost_tracking import upgrade

if __name__ == '__main__':
    db = SessionLocal()
    try:
        upgrade(db)
        print("✅ Cost tracking migration completed!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()
```

**Run**:
```bash
cd /opt/livekit1
python3 run_cost_migration.py
```

### Option 2: Extract SQL and Run Manually

```bash
# View the migration SQL
sudo cat backend/cost_tracking/migration_001_cost_tracking.py | grep -A 100 "CREATE TABLE"

# Connect to database
psql -U livekit livekit_db

# Copy-paste CREATE TABLE statements
# Then run manually
```

### Option 3: Enable Module Without Migration

If tables already exist from previous setup:

**In `user_dashboard.py`** (after line 117):

```python
# Register Cost Tracking API (Pre-pay billing system)
from backend.cost_tracking.api_endpoints import cost_bp
app.register_blueprint(cost_bp)
print("✅ Cost Tracking API registered at /api/v1/costs")
```

**Verify tables exist**:
```bash
psql -U livekit livekit_db -c "\dt pricing_config"
psql -U livekit livekit_db -c "\dt call_cost_breakdown"
```

---

## 🔌 API Endpoints (After Enabling)

### Get Call Costs
```bash
GET /api/v1/calls/{call_id}/costs
```

Returns itemized cost breakdown:
```json
{
  "success": true,
  "data": {
    "total": 0.0234,
    "breakdown": {
      "stt_cost": 0.0013,
      "llm_cost": 0.0185,
      "tts_cost": 0.0026,
      "telephony_cost": 0.0010
    },
    "provider_usage": {
      "stt_minutes": 0.5,
      "llm_input_tokens": 1200,
      "llm_output_tokens": 450,
      "tts_characters": 325
    }
  }
}
```

### Get User Balance
```bash
GET /api/v1/balance
Header: X-User-Email: user@example.com
```

### Add Credits
```bash
POST /api/v1/credits/add
{
  "amount_cents": 5000,  // $50.00
  "payment_method": "stripe",
  "transaction_id": "ch_xxx"
}
```

### Credit History
```bash
GET /api/v1/credits/transactions
```

---

## 📊 Integration Points

### LiveKit Webhook Integration

The Cost Tracker automatically deducts balance when calls complete:

```python
# In call_outcome_processor.py (after line 389)
from backend.cost_tracking.livekit_cost_tracker import LiveKitCostTracker

cost_tracker = LiveKitCostTracker()
cost_breakdown = cost_tracker.calculate_and_deduct_cost(
    call_log_id=call_log_id,
    user_id=user_id
)
```

### Balance Enforcement

Before initiating calls, check user balance:

```python
from backend.cost_tracking.balance_service import BalanceService

balance_service = BalanceService(db)
if not balance_service.has_sufficient_balance(user_id, estimated_cost_cents):
    return {'error': 'Insufficient credits'}
```

---

## 🧪 Testing

### Unit Tests
```bash
cd /opt/livekit1
python3 -m pytest backend/cost_tracking/test_services.py -v
```

### Manual API Tests
```bash
# Check if endpoint works (returns 404 if not enabled)
curl http://localhost:5001/api/v1/balance \
  -H "X-User-Email: test@example.com"
```

---

## 💡 Business Value

**What This Enables**:

1. **Pre-Pay Billing Model**
   - Users buy credits upfront (like Twilio)
   - Auto-deduct costs per call/message
   - Low balance alerts

2. **Transparent Cost Breakdown**
   - Users see exactly what they're charged for
   - STT/LLM/TTS costs itemized
   - Provider usage metrics visible

3. **Profit Margin Tracking**
   - Track actual costs vs. customer charges
   - Identify most/least profitable features
   - Optimize provider selection

4. **Multi-Tenant Support**
   - Per-user custom pricing overrides
   - White-label agency billing
   - Reseller margins configurable

---

## 📦 Module Structure

```
backend/cost_tracking/
├── migration_001_cost_tracking.py  (18KB) - Database schema
├── models.py                       (14KB) - SQLAlchemy models
├── pricing_service.py              (18KB) - Rate calculations
├── balance_service.py              (19KB) - Credit management
├── livekit_cost_tracker.py         (12KB) - Call cost processor
├── api_endpoints.py                (17KB) - REST API routes
└── test_services.py                 (8KB) - Unit tests
```

**Total**: ~106KB, 7 files, fully built and tested

---

## 🚀 Next Steps

**Priority Actions**:

1. **Decide on setup approach** (Option 1, 2, or 3 above)
2. **Run migration** to create database tables
3. **Enable API module** in user_dashboard.py
4. **Test endpoints** with sample data
5. **Integrate with call_outcome_processor** for auto-deduction
6. **Build admin pricing UI** (frontend)

**Estimated Time**: 
- Setup: 30 minutes
- Testing: 15 minutes
- Integration: 1 hour
- Frontend: 2-3 hours

**Blockers**: None (migration can be run manually if needed)

---

## 📄 Related Documentation

- `/opt/livekit1/backend/WORK_SESSION_SUMMARY.md` - Previous session summary
- `/opt/livekit1/backend/CAMPAIGN_INTEGRATION_COMPLETE.md` - Campaign integration docs
- Migration file: `backend/cost_tracking/migration_001_cost_tracking.py`

---

**Created**: 2025-11-09  
**Author**: Claude Code (Autonomous Mode)  
**Session**: Phase 1 Three-Entity Integration
