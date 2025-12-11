# Autonomous Calling Engine Architecture

## Overview
Automated outbound calling campaigns with lead qualification, retry logic, and LiveKit voice agent integration.

## System Components

### 1. Campaign Executor Service (`backend/services/campaign_executor.py`)
Background service that manages campaign execution lifecycle.

**Key Responsibilities**:
- Monitor active campaigns every 30 seconds
- Schedule calls within configured call windows
- Manage campaign state transitions (draft ’ active ’ paused ’ completed)
- Update progress metrics (progress %, called, successful, remaining)
- Enforce daily/per-lead call limits

**Key Methods**:
```python
class CampaignExecutor:
    async def start_campaign(campaign_id: str)
    async def pause_campaign(campaign_id: str)
    async def resume_campaign(campaign_id: str)
    async def stop_campaign(campaign_id: str)
    async def process_active_campaigns()  # Background loop
```

---

### 2. Auto-Dialer Service (`backend/services/auto_dialer.py`)
Lead queue management and call initiation.

**Key Responsibilities**:
- Maintain priority queue of leads to call
- Validate call window constraints (timezone, hours, days)
- Initiate calls via LiveKit voice agents
- Implement retry logic with exponential backoff
- Handle call state transitions

**Lead Queue Priority**:
1. Never called leads (callAttempts = 0)
2. Failed calls ready for retry (nextRetryAt <= now)
3. No-answer calls (sorted by lastCalledAt oldest first)

**Call Window Validation**:
```json
{
  "timezone": "America/New_York",
  "callWindows": [
    {"dayOfWeek": 1, "startHour": 9, "endHour": 17},
    {"dayOfWeek": 2, "startHour": 9, "endHour": 17}
  ],
  "maxCallsPerDay": 100,
  "maxCallsPerLead": 3,
  "retryDelayHours": 24
}
```

---

### 3. Call Outcome Tracker (`backend/services/call_outcome_tracker.py`)
Process call results and update database.

**Key Responsibilities**:
- Listen for LiveKit call completion webhooks
- Extract call metrics (duration, transcript, cost)
- Determine call outcome
- Schedule retry calls if needed
- Update campaign_calls and funnel_leads tables

**Call Outcomes**:
- `qualified` - Meets qualification criteria
- `unqualified` - Doesn't meet criteria
- `callback_requested` - Wants specific callback time
- `not_interested` - Declined offer
- `wrong_number` - Invalid phone number
- `voicemail` - Reached voicemail
- `no_answer` - No one answered
- `failed` - Technical failure

**Retry Logic**:
```python
# Exponential backoff: 1hr, 4hr, 24hr
def calculate_next_retry(call):
    if call.attemptNumber >= call.maxAttempts:
        return None

    if call.status in ['no_answer', 'failed']:
        delay_hours = [1, 4, 24][call.attemptNumber - 1]
        return now + timedelta(hours=delay_hours)

    return None
```

---

### 4. Qualification Scorer (`backend/services/qualification_scorer.py`)
Analyze transcripts and score lead qualification.

**Key Responsibilities**:
- Parse call transcripts using AI
- Apply qualification criteria from campaign config
- Calculate qualification score (0-100)
- Extract structured data (budget, timeline, pain points)
- Determine next action (schedule_demo, send_proposal, etc)

**Qualification Config Example**:
```json
{
  "qualificationCriteria": [
    {"field": "budget", "operator": ">=", "value": 10000, "weight": 30},
    {"field": "timeline", "operator": "in", "value": ["immediate", "within_month"], "weight": 25},
    {"field": "decision_maker", "operator": "==", "value": true, "weight": 20},
    {"field": "pain_points", "operator": "contains_any", "value": ["slow", "expensive"], "weight": 25}
  ],
  "minQualificationScore": 70
}
```

**Scoring Output**:
```json
{
  "score": 85,
  "criteria": {
    "budget": 50000,
    "timeline": "immediate",
    "decision_maker": true,
    "pain_points": ["slow", "manual"]
  },
  "notes": "Strong interest, budget confirmed, ready for demo",
  "nextAction": "schedule_demo"
}
```

---

### 5. LiveKit Campaign Bridge (`backend/services/livekit_campaign_bridge.py`)
Bridge between campaign system and LiveKit voice agents.

**Key Responsibilities**:
- Create LiveKit rooms for campaign calls
- Assign appropriate voice agent to call
- Inject campaign context into agent instructions
- Monitor call events and forward to outcome tracker
- Handle call disconnections and errors

**Campaign Context Injection**:
```json
{
  "campaign_id": "uuid",
  "lead_name": "John Doe",
  "lead_company": "Acme Corp",
  "lead_context": {
    "source": "website_form",
    "interest": "enterprise_plan"
  },
  "qualification_criteria": {...},
  "script_guidance": "Focus on budget and timeline"
}
```

---

## Database Flow

### Campaign Lifecycle States
```
draft ’ active ’ (paused Ä active) ’ completed
                               “
                          cancelled
```

### Call Lifecycle States
```
pending ’ calling ’ in_progress ’ completed
                              “
                    failed/no_answer ’ (retry) ’ calling
```

---

## API Endpoints (`backend/campaigns_api.py`)

### Campaign Management
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `POST /api/campaigns/:id/resume` - Resume campaign
- `POST /api/campaigns/:id/stop` - Stop campaign
- `GET /api/campaigns/:id` - Get campaign details
- `GET /api/campaigns` - List user campaigns

### Campaign Progress
- `GET /api/campaigns/:id/progress` - Real-time progress metrics
- `GET /api/campaigns/:id/calls` - List all campaign calls
- `GET /api/campaigns/:id/analytics` - Campaign analytics

### Lead Management
- `POST /api/campaigns/:id/leads/upload` - Upload CSV of leads
- `POST /api/campaigns/:id/leads/add` - Add single lead manually
- `GET /api/campaigns/:id/leads` - List campaign leads
- `PUT /api/campaigns/:id/leads/:leadId` - Update lead details

---

## Background Jobs

### 1. Campaign Executor (Every 30s)
```python
# Process active campaigns within call windows
while True:
    active_campaigns = get_active_campaigns()
    for campaign in active_campaigns:
        if is_within_call_window(campaign):
            process_campaign_batch(campaign)
    await asyncio.sleep(30)
```

### 2. Retry Scheduler (Every 5 min)
```python
# Queue calls ready for retry
while True:
    retry_calls = get_calls_ready_for_retry()
    for call in retry_calls:
        enqueue_call_retry(call)
    await asyncio.sleep(300)
```

### 3. Progress Updater (Every 60s)
```python
# Update campaign metrics
while True:
    active_campaigns = get_active_campaigns()
    for campaign in active_campaigns:
        update_campaign_metrics(campaign)
    await asyncio.sleep(60)
```

---

## Error Handling

### Call Failure Retry Logic
- **No Answer**: Retry after 1hr (up to 3 attempts)
- **Busy**: Retry after 4hr (up to 2 attempts)
- **Failed**: Retry immediately once, then 24hr
- **Invalid Number**: Mark as failed, no retry

### Campaign Error Handling
- **No Leads**: Pause campaign, notify user
- **Agent Unavailable**: Pause campaign, notify admin
- **Rate Limit Hit**: Throttle calls, queue remaining leads
- **Budget Exceeded**: Pause campaign, notify user

---

## Implementation Phases

### Phase 1: Core Infrastructure 
- [x] Database schema (campaigns, campaign_calls, funnel_leads extensions)
- [ ] Campaign API endpoints
- [ ] Lead upload/management

### Phase 2: Campaign Executor
- [ ] Background service implementation
- [ ] Call window validation logic
- [ ] Campaign state management
- [ ] Progress metric updates

### Phase 3: Auto-Dialer
- [ ] Lead queue implementation
- [ ] Call initiation via LiveKit
- [ ] Retry scheduling logic
- [ ] Call window checking

### Phase 4: Call Tracking
- [ ] Outcome tracking webhooks
- [ ] Qualification scoring with AI
- [ ] Lead status updates
- [ ] Retry queue management

### Phase 5: LiveKit Integration
- [ ] Room creation for campaigns
- [ ] Agent assignment
- [ ] Context injection
- [ ] Event monitoring

### Phase 6: Dashboard Updates
- [ ] Real-time progress monitoring
- [ ] Campaign controls (start/pause/stop)
- [ ] Analytics visualization
- [ ] Call history view

### Phase 7: Testing & Launch
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Documentation

---

## Security & Compliance

### TCPA Compliance
- Call time restrictions (8am-9pm local time)
- Do Not Call list checking
- Opt-out handling
- Max 3 attempts per lead
- Recording consent

### Data Protection
- Encrypt call recordings at rest
- Secure PII handling
- Access controls for campaign data
- Audit logging for all actions
- Data retention policies

---

## Deployment Architecture

```
                             
  Frontend (Next.js)         
  - Campaign Dashboard       
  - Real-time Progress       
          ,                  
            REST API
          ¼                  
  Flask Backend              
  - Campaign API             
  - Progress API             
  - Lead Management          
          ,                  
           
          <        
                  
  ¼     ¼      ¼        
Campaign Auto-  Call     
Executor Dialer Outcome  
(BG Job)        Tracker  
  ,      ,      ,        
                   
           <        
            
           ¼         
     PostgreSQL      
     - campaigns     
     - campaign_calls
     - funnel_leads  
           ,         
            
           ¼         
    LiveKit Cloud    
    (Voice Agents)   
                     
```

---

## Next Steps

1.  Database schema created
2. **NOW**: Build Campaign API endpoints
3. Build Campaign Executor service
4. Build Auto-Dialer service
5. Implement Call Outcome Tracker
6. Integrate with LiveKit
7. Update Dashboard UI
8. Test end-to-end flow
