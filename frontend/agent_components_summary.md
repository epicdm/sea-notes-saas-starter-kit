# Epic Voice AI Agent Management Components - Port Reference

## Overview
This document indexes all agent management components, pages, API routes, and schemas from the old Epic Voice AI application that should be ported to the new SaaS starter kit.

---

## 1. MAIN PAGES & ROUTES

### Agent Management Pages
Based on git history (last known commit: 7042fbf), these pages were at:

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| `app/dashboard/agents/page.tsx` | Main List Page | ~439 lines | Agent dashboard with grid/list view, search, create button |
| `app/dashboard/agents/new/page.tsx` | Create Page | ~353 lines | Multi-step agent creation wizard |
| `app/dashboard/agents/[id]/edit/page.tsx` | Edit Page | ~376 lines | Agent configuration and editing interface |

### Related Pages
- `app/agents/page.tsx` - Alternative agents view
- `app/test-agents/page.tsx` - Agent testing interface

**Status**: All deleted in commit 8483336 (Clean minimal frontend)

---

## 2. AGENT COMPONENTS

### Core Agent Display Components
Documented in: `/opt/livekit1/claudedocs/AGENT_COMPONENTS_IMPLEMENTATION.md`

#### AgentCard.tsx
- **Type**: Card component
- **Size**: ~275 lines  
- **Features**: Individual agent display with hover toolbar, metrics, status badge
- **Props**: Agent data, metrics, callbacks for edit/delete/duplicate/monitor
- **Use**: Grid displays, simple agent lists
- **Status**: ✅ Documented with full specs

#### AgentGrid.tsx
- **Type**: Layout component
- **Size**: ~118 lines
- **Features**: Responsive grid (1 → 2 → 3 columns) for multiple agent cards
- **Props**: Array of agents, unified callbacks, metrics map, empty state
- **Use**: Main agents page layout
- **Status**: ✅ Documented with examples

#### AgentInsightCard.tsx  
- **Type**: Enhanced card component
- **Size**: ~666 lines
- **Features**: Rich metrics display, tags, status badge, hover toolbar, timestamps
- **Props**: Agent, metrics, tags, callbacks
- **Use**: Dashboard analytics, agent performance views
- **Status**: ✅ Documented in `AGENT_INSIGHT_CARD_IMPLEMENTATION.md`

#### MetricBox.tsx
- **Type**: Utility component
- **Size**: ~67 lines
- **Features**: Metric display boxes with icons and color themes
- **Colors**: Blue (calls), Green (success), Purple (duration), Gray (neutral)
- **Use**: Within insight cards for metric display
- **Status**: ✅ Documented

### Agent Creation/Editing Components
| Component | Size | Purpose |
|-----------|------|---------|
| `components/agents/agent-wizard-step1.tsx` | ~80 lines | Agent type selection |
| `components/agents/agent-wizard-step1-simple.tsx` | ~86 lines | Simplified type selector |
| `components/agents/agent-wizard-step2.tsx` | ~168 lines | Configuration (model, voice, phone) |
| `components/agents/agent-wizard-step2-simple.tsx` | ~229 lines | Simplified config with presets |
| `components/agents/agent-wizard-step3.tsx` | ~170 lines | Instructions & behavior |
| `components/agents/agent-wizard-step4.tsx` | ~233 lines | Review & deployment |
| `components/agents/wizard-step1-type.tsx` | ~137 lines | Type picker with templates |
| `components/agents/wizard-step2-persona.tsx` | ~245 lines | Persona selection & assignment |
| `components/agents/wizard-step3-config.tsx` | ~420 lines | Full configuration panel |
| `components/agents/wizard-step3-social.tsx` | ~295 lines | Social media configuration |

### Agent UI Utilities
| Component | Purpose |
|-----------|---------|
| `components/agents/AgentInspector.tsx` | Detail panel for agent inspection (~374 lines) |
| `components/agents/agent-list-item.tsx` | Row item for list views (~466 lines) |
| `components/agents/index.ts` | Barrel exports (~20 lines) |
| `components/AgentCard.tsx` (root) | Alternative agent card location |
| `components/AgentDetailDialog.tsx` | Dialog for agent details |
| `components/CreateAgentDialog.tsx` | Quick create dialog |
| `components/EditAgentDialog.tsx` | Quick edit modal |

---

## 3. API ROUTE HANDLERS

### User-facing Agent APIs
**Base**: `/app/api/user/agents/`

| Route | Method | Purpose | Size |
|-------|--------|---------|------|
| `/api/user/agents` | GET | List user's agents | ~142 lines |
| `/api/user/agents` | POST | Create new agent | |
| `/api/user/agents/[id]` | GET | Get agent details | ~183 lines |
| `/api/user/agents/[id]` | PUT | Update agent | |
| `/api/user/agents/[id]` | DELETE | Delete agent | |
| `/api/user/agents/[id]/deploy` | POST | Deploy agent | ~61 lines |
| `/api/user/agents/[id]/undeploy` | POST | Stop agent | ~61 lines |
| `/api/user/agents/[id]/livekit-info` | GET | Get LiveKit credentials | ~67 lines |

### Public v1 APIs (for integrations)
**Base**: `/app/api/v1/agents/`

| Route | Purpose | Size |
|-------|---------|------|
| `/api/v1/agents` | Public list agents | ~85 lines |
| `/api/v1/agents/[id]` | Public get agent | ~95 lines |

### Admin/Dashboard APIs
| Route | Purpose |
|-------|---------|
| `/api/admin-api/users/[userId]` | User agent management |
| `/api/dashboard/agent-performance` | Agent metrics aggregation (~55 lines) |

---

## 4. AGENT SCHEMAS & TYPES

### Frontend Schemas
**Location**: `/opt/livekit1/frontend/lib/schemas/`

| Schema File | Purpose |
|------------|---------|
| `agent-schema.ts` | ~117 lines - Core agent validation |
| `agent-schema-simple.ts` | ~56 lines - Simplified creation schema |
| `agent-schema-visual.ts` | ~130 lines - Visual wizard schema |

### Backend Models
**Location**: `/opt/livekit1/database.py`

**AgentConfig Model**:
```python
class AgentConfig:
    id: str (UUID)
    userId: str (FK)
    name: str
    description: str
    agentType: str (inbound|outbound|hybrid)
    status: str (ACTIVE|CREATED|DEPLOYED|DEPLOYING|FAILED|UNDEPLOYING|INACTIVE)
    
    # LLM Configuration
    llmProvider: str (openai|anthropic|google)
    llmModel: str (gpt-4o-mini, gpt-4-turbo, etc.)
    
    # Voice Configuration
    voiceProvider: str (cartesia|elevenlabs|openai|google)
    voice: str (nova, alloy, echo, etc.)
    
    # Instructions
    instructions: str (base instructions)
    
    # Phone Configuration
    inboundPhoneNumber: str (optional)
    outboundPhoneNumber: str (optional)
    
    # References to three-entity architecture
    personaId: str (FK) - Personality template
    brandProfileId: str (FK) - Brand context
    
    # Metadata
    createdAt: datetime
    updatedAt: datetime
    deployedAt: datetime (optional)
```

### TypeScript Agent Types
```typescript
interface Agent {
    id: string
    userId: string
    name: string
    description?: string
    agentType: 'inbound' | 'outbound' | 'hybrid'
    status: AgentStatus
    llmProvider: string
    llmModel: string
    voiceProvider: string
    voice: string
    instructions: string
    personaId?: string
    brandProfileId?: string
    createdAt: Date
    updatedAt: Date
    deployedAt?: Date
}

enum AgentStatus {
    ACTIVE = 'ACTIVE',
    CREATED = 'CREATED',
    DEPLOYED = 'DEPLOYED',
    DEPLOYING = 'DEPLOYING',
    FAILED = 'FAILED',
    UNDEPLOYING = 'UNDEPLOYING',
    INACTIVE = 'INACTIVE'
}
```

---

## 5. CONFIGURATION & TEMPLATES

### Agent Templates
**File**: `/opt/livekit1/frontend/lib/agent-templates.ts`
**Size**: ~448 lines
**Purpose**: Pre-configured agent templates for quick creation

**Templates Included**:
- Sales Agent (outbound with leads)
- Support Agent (inbound)
- Lead Qualification Agent
- Appointment Booking Agent
- Feedback Survey Agent
- Real Estate Agent
- Healthcare Screening Agent
- And more...

### Agent Field Configuration
**File**: `/opt/livekit1/frontend/config/agent-fields.ts`
**Size**: ~199 lines
**Purpose**: Define available LLM models, voices, and deployment options

**Content**:
- Available LLM providers and models
- Available TTS voices
- Phone number configurations
- Status mappings
- Default configurations

---

## 6. HOOKS & UTILITIES

### Custom React Hooks
**Location**: `/opt/livekit1/frontend/lib/hooks/`

| Hook | Purpose |
|------|---------|
| `use-agents.ts` | Fetch, create, update, delete agents (~75 lines) |
| `useAgents()` | Hook for agent data with caching |

### Utility Functions
**Location**: `/opt/livekit1/frontend/lib/`

- `agent-templates.ts` - Template definitions and helpers
- Agent status helpers
- Phone number formatting
- Voice name mapping

---

## 7. TESTING

### E2E Tests
**File**: `/opt/livekit1/frontend/e2e/agents.spec.ts`
**Size**: ~118 lines
**Tests Coverage**:
- Agent creation workflow
- Agent editing
- Agent deletion
- Agent deployment
- Agent status transitions
- Persona assignment

### Unit Tests  
**File**: `/opt/livekit1/tests/e2e/agent-creation.spec.ts`
**Size**: ~256 lines
**Focus**: Multi-step wizard validation

---

## 8. BACKWARD-COMPATIBLE COMPONENTS (OLD)

These were the original components before three-entity refactor:

| Component | Purpose |
|-----------|---------|
| `components_old_backup/CreateAgentWizard.tsx` | ~1086 lines - Old creation flow |
| `components_old_backup/EditAgentModal.tsx` | ~995 lines - Old edit flow |
| `lib_old_backup/agent-templates.ts` | ~448 lines - Old templates |
| `types/agent.ts` | ~215 lines - Old type definitions |

---

## 9. KEY ARCHITECTURAL DECISIONS

### Three-Entity Architecture (Brand → Persona → Agent)

```
User Creates:
  1. Brand Profile - Company identity + AI-extracted brand context
  2. Personas - Reusable personality templates 
  3. Agents - Deployable configurations that reference #1 and #2

Benefits:
  ✅ Reusability: One persona used by multiple agents
  ✅ Consistency: Brand context applied to all agents
  ✅ Template-based: 60% faster agent creation
  ✅ Multi-channel: Same personality across voice, SMS, email, WhatsApp
```

### Agent Status Flow
```
CREATED → DEPLOYING → DEPLOYED (ACTIVE) → UNDEPLOYING → INACTIVE
             ↓
          FAILED ← (deployment error)
```

### API Patterns
- **User API** (`/api/user/agents/`): Authenticated, user-scoped
- **Public API** (`/api/v1/agents/`): For external integrations
- **Admin API** (`/api/admin-api/`): Admin operations
- **Dashboard API** (`/api/dashboard/`): Analytics and metrics

---

## 10. INTEGRATION POINTS

### With Other Features
- **Personas**: Agents reference personas for personality templates
- **Brand Profiles**: Agents reference brand profiles for context
- **Campaigns**: Agents are deployed for outbound campaigns
- **Calls**: Agents handle inbound/outbound calls
- **Analytics**: Agent metrics aggregated in dashboard
- **Webhooks**: Events fired on agent lifecycle changes

### LLM Integration Points
- Deepgram STT (Nova-2 model)
- OpenAI LLM (GPT-4o-mini preferred)
- OpenAI TTS (Echo, Nova, Alloy voices)
- Cartesia TTS (Alternative for speed)
- Anthropic (Optional)
- Google Gemini (Optional)

---

## 11. PORTING PRIORITY

### CRITICAL (Port First - Core Functionality)
1. ✅ **Agent Types & Database Schema** - Foundation
2. ✅ **Agent API Routes** - Backend functionality  
3. ✅ **Agent Schemas** - Validation
4. ✅ **AgentCard + AgentGrid** - Basic UI
5. ✅ **Agent List Page** - View agents

### IMPORTANT (Port Second - Full Feature)
6. Agent Detail Page & Inspector
7. Agent Creation Wizard (multi-step)
8. Agent Editing Interface
9. Agent Templates & Defaults
10. Custom Hooks (use-agents)

### NICE-TO-HAVE (Port Later - Enhancement)
11. AgentInsightCard - Enhanced metrics display
12. Advanced wizard steps (personas, social)
13. Agent testing interface
14. Performance analytics
15. Bulk operations

---

## 12. CODE QUALITY METRICS

### Component Quality
- **ESLint**: All components pass validation (max-warnings=0)
- **TypeScript**: Full type safety on all props
- **Accessibility**: WCAG AA compliance
- **Responsive Design**: Mobile, tablet, desktop support
- **Dark Mode**: Full theme support

### Performance
- **AgentCard**: ~300 bytes gzipped
- **AgentGrid**: ~150 bytes gzipped
- **AgentInsightCard**: ~400 bytes gzipped
- **Minimal Re-renders**: Efficient hover state handling
- **GPU-Accelerated**: CSS-based animations

---

## 13. DOCUMENTATION AVAILABLE

All components documented with:
- ✅ Full code examples
- ✅ Props interfaces
- ✅ Usage patterns
- ✅ Integration examples
- ✅ Visual design specs
- ✅ Accessibility notes
- ✅ Performance metrics

**Documentation Location**: `/opt/livekit1/claudedocs/`

Key docs:
- `AGENT_COMPONENTS_IMPLEMENTATION.md` - AgentCard, AgentGrid
- `AGENT_INSIGHT_CARD_IMPLEMENTATION.md` - AgentInsightCard, MetricBox
- `BACKEND_MODELS_COMPLETE.md` - Database schema
- `COMPREHENSIVE_CODEBASE_ANALYSIS.md` - Overall architecture

---

## Summary

**Total Components to Port**: 40+
- Pages: 3 main + 2 alternate
- Card Components: 4 variants
- Wizard Steps: 9 steps  
- API Routes: 10+ endpoints
- Hooks/Utilities: 5+
- Tests: 2+ suites

**Estimated Porting Effort**: 
- Core (pages + basic cards): 40-60 hours
- Full feature (with wizard): 80-100 hours
- Complete (with analytics): 120+ hours

**Recommendation**: Start with AgentCard/AgentGrid + List Page + Create Wizard for MVP, then add analytics/insights in Phase 2.
