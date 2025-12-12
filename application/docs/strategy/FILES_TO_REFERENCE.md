# Files to Reference - Complete Code Examples

This guide shows you exactly which files to look at and copy patterns from.

---

## 1. API Routes (Next.js Proxy Pattern)

### REFERENCE: Agents API Route
**File**: `/opt/livekit1/frontend/app/api/user/agents/route.ts`

This is your template for creating `/app/api/user/funnels/route.ts`

**What to copy:**
- GET handler for listing (with authentication)
- POST handler for creating
- Error handling pattern
- Response wrapping pattern

**Key Code Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

export async function GET(req: NextRequest) {
  // 1. Get session
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Proxy to Flask
  const response = await fetch(`${BACKEND_URL}/api/user/agents`, {
    headers: {
      'X-User-Email': session.user.email,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  // 3. Return wrapped response
  const data = await response.json()
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  // Same pattern as GET, but with request body
  const body = await req.json()
  const response = await fetch(`${BACKEND_URL}/api/user/agents`, {
    method: 'POST',
    headers: { 'X-User-Email': userEmail, ... },
    body: JSON.stringify(body),
  })
  // ...
}
```

### ALTERNATIVE: Phone Numbers API
**File**: `/opt/livekit1/frontend/app/api/user/phone-numbers/route.ts`

Shows handling of dynamic routes and query parameters.

### ALTERNATIVE: Dynamic ID Route
**File**: `/opt/livekit1/frontend/app/api/user/agents/[id]/route.ts`

Shows GET/PUT/DELETE for single resource.

---

## 2. Custom Hooks (Data Fetching)

### REFERENCE: useAgents Hook
**File**: `/opt/livekit1/frontend/lib/hooks/use-agents.ts`

This is your exact template for `use-funnels.ts`

**What to copy:**
- State initialization (data, isLoading, error)
- useCallback for fetch function
- useEffect for mounting
- Return interface
- Error handling

**Code Pattern:**
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Agent } from '@/types/agent'
import { api, isApiError } from '@/lib/api-client'

interface UseAgentsReturn {
  agents: Agent[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<Agent[]>('/api/user/agents')
      setAgents(data)
    } catch (err) {
      setError(isApiError(err) ? new Error(err.message) : new Error('Failed'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchAgents()
  }, [fetchAgents])

  useEffect(() => {
    fetchAgents()
  }, [])

  return { agents, isLoading, error, refetch }
}
```

### ALTERNATIVE: useStats Hook
**File**: `/opt/livekit1/frontend/lib/hooks/use-stats.ts`

Simpler pattern for single data object (not array).

### ALTERNATIVE: useCallLogs Hook
**File**: `/opt/livekit1/frontend/lib/hooks/use-call-logs.ts`

Shows handling of optional parameters/pagination.

---

## 3. Page Components (Dashboard)

### REFERENCE: Agents Page (Full Page with Everything)
**File**: `/opt/livekit1/frontend/app/dashboard/agents/page.tsx`

This shows the complete pattern:
- Search/filter
- Loading states
- Create/edit/delete dialogs
- Multi-select operations
- Table/grid rendering
- Data fetching

**What to learn:**
- useState for all state (search, filters, dialogs, selected)
- useEffect for data loading
- Filtering/sorting logic
- Component composition
- Dialog integration
- Action handlers

### REFERENCE: Funnels Page (UI Already Done!)
**File**: `/opt/livekit1/frontend/app/dashboard/funnels/page.tsx`

This has the UI but needs to connect to API! Currently uses mock data.

**What's there:**
- Page layout (✅)
- Filter/search UI (✅)
- Funnel cards (✅)
- Statistics cards (✅)
- Create/Edit/Delete dialogs (✅)
- Modal integrations (✅)

**What needs adding:**
- Call `useFunnels()` hook instead of mock data
- Wire up create/edit/delete handlers to API

### ALTERNATIVE: Calls Page
**File**: `/opt/livekit1/frontend/app/dashboard/calls/page.tsx`

Shows list with pagination and detail views.

### ALTERNATIVE: Campaigns Page
**File**: `/opt/livekit1/frontend/app/dashboard/campaigns/page.tsx`

Shows more complex operations (scheduling, analytics).

---

## 4. Components (Reusable)

### REFERENCE: Funnels Create Wizard
**File**: `/opt/livekit1/frontend/components/CreateFunnelWizard.tsx`

Already implemented! Shows:
- Multi-step wizard pattern
- Form state management
- Validation
- API call on submit

**Usage in page:**
```typescript
const [isCreateOpen, setIsCreateOpen] = useState(false)

return (
  <>
    <CreateFunnelWizard
      isOpen={isCreateOpen}
      onClose={() => setIsCreateOpen(false)}
      onFunnelCreated={(funnel) => {
        setFunnels(prev => [...prev, funnel])
        toast.success('Funnel created!')
      }}
    />
  </>
)
```

### REFERENCE: Funnels Edit Wizard
**File**: `/opt/livekit1/frontend/components/EditFunnelWizard.tsx`

Similar to create but pre-fills form with existing data.

### REFERENCE: Analytics Panel
**File**: `/opt/livekit1/frontend/components/funnels/FunnelAnalyticsPanel.tsx`

Shows charts and analytics display pattern using Recharts.

### REFERENCE: Confirm Dialog
**File**: `/opt/livekit1/frontend/components/ConfirmDialog.tsx`

Simple delete confirmation dialog - reusable for all features.

---

## 5. API Client (Core Infrastructure)

### THE CENTRAL API CLIENT
**File**: `/opt/livekit1/frontend/lib/api-client.ts`

This is THE most important file. Shows:
- How all API calls work
- Authentication injection
- Error handling
- Type safety
- Timeout handling
- Helper methods (GET, POST, PUT, DELETE)

**Key usage:**
```typescript
import { api, ApiError, isApiError } from '@/lib/api-client'

const data = await api.get<Funnel[]>('/api/user/funnels')
const created = await api.post<Funnel>('/api/user/funnels', newFunnel)
const updated = await api.put<Funnel>('/api/user/funnels/id', updates)
await api.delete('/api/user/funnels/id')
```

**Never import anything else for API calls!**

---

## 6. Authentication

### NextAuth Configuration
**File**: `/opt/livekit1/frontend/auth.ts`

Shows:
- How to configure providers (Google, etc.)
- Prisma adapter
- Session pages
- Where to add new providers

### Middleware (Route Protection)
**File**: `/opt/livekit1/frontend/middleware.ts`

Protects `/dashboard/*` routes.

### Session Usage in Pages
Look in `/app/dashboard/agents/page.tsx` line ~2:
```typescript
import { useSession } from 'next-auth/react'

// In component:
const session = useSession()
if (session.status === 'unauthenticated') return <SignIn />
```

---

## 7. Database Schema

### Prisma Schema
**File**: `/opt/livekit1/frontend/prisma/schema.prisma`

Shows:
- All existing models (users, agents, calls, etc.)
- Relationships between models
- Field types and constraints
- Where to add `funnels` model

**Current models to reference:**
- `agent_configs` - Multi-field entity with relationships
- `phone_mappings` - Simple linking table
- `call_logs` - Time-based entity with stats
- `users` - User-scoped data

---

## 8. Types & Interfaces

### Main Types File
**File**: `/opt/livekit1/frontend/lib/types.ts`

Add your Funnel types here or create `/types/funnel.ts`

**What to add:**
```typescript
export interface Funnel {
  id: string
  userId: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused'
  type: string
  entryPoints: string[]
  phoneNumber?: string
  stats: FunnelStats
  createdAt: string
  updatedAt: string
}

export interface FunnelStats {
  totalCalls: number
  completed: number
  hotLeads: number
  booked: number
  conversionRate: number
  avgDuration: string
}
```

---

## 9. Form Components & Validation

### Forms Reference
Look at `CreateFunnelWizard.tsx` and `EditFunnelWizard.tsx` for:
- React Hook Form usage
- Zod validation
- Form error display
- Multi-step handling

### Validation Schema Location
**File**: `/opt/livekit1/frontend/lib/schemas/`

Existing examples:
- `settings-schema.ts` - User profile validation
- Check how they structure Zod schemas

---

## Quick Copy-Paste Checklist

To implement Funnels, copy from these files in this order:

1. **API Route** → Copy from `/app/api/user/agents/route.ts`
   - Create `/app/api/user/funnels/route.ts`
   - Change "agents" to "funnels"
   - Update to match Flask backend endpoint

2. **Hook** → Copy from `/lib/hooks/use-agents.ts`
   - Create `/lib/hooks/use-funnels.ts`
   - Change Agent type to Funnel
   - Change endpoint to "/api/user/funnels"

3. **Types** → Add to `/lib/types.ts`
   - Add Funnel interface
   - Add FunnelStats interface
   - Add FunnelAnalytics interface (if needed)

4. **Page** → Already exists at `/app/dashboard/funnels/page.tsx`
   - Replace mock data with `useFunnels()` hook
   - Wire up create/edit/delete handlers
   - Connect analytics to API if needed

5. **Components** → Already exist
   - `CreateFunnelWizard.tsx` - Already implemented
   - `EditFunnelWizard.tsx` - Already implemented
   - `FunnelAnalyticsPanel.tsx` - Already implemented
   - Just ensure they call the API routes

6. **Database** → Add to `/prisma/schema.prisma`
   - Add funnels model
   - Run: `npx prisma migrate dev --name add_funnels`

---

## File Location Quick Reference

```
MUST READ:
- /lib/api-client.ts ...................... HOW ALL API CALLS WORK
- /app/api/user/agents/route.ts ........... TEMPLATE FOR YOUR ROUTES

GOOD EXAMPLES:
- /app/dashboard/agents/page.tsx .......... FULL PAGE EXAMPLE
- /lib/hooks/use-agents.ts ................ HOOK TEMPLATE
- /components/CreateFunnelWizard.tsx ...... FORM PATTERN

COPY PATTERNS:
- /app/api/user/calls/route.ts ........... MORE EXAMPLES
- /app/api/user/personas/route.ts ........ MORE EXAMPLES
- /lib/hooks/use-stats.ts ................ DIFFERENT HOOK STYLE

CONFIGURATION:
- /auth.ts .............................. AUTH CONFIG
- /prisma/schema.prisma ................. DATABASE SCHEMA
- /middleware.ts ........................ ROUTE PROTECTION
- /.env.local ........................... ENVIRONMENT VARS

ALREADY DONE:
- /app/dashboard/funnels/page.tsx ........ UI COMPLETE - JUST WIRE UP
- /components/CreateFunnelWizard.tsx ..... WIZARD COMPLETE
- /components/EditFunnelWizard.tsx ....... WIZARD COMPLETE
- /components/funnels/FunnelAnalyticsPanel.tsx ... ANALYTICS COMPLETE
```

---

## Summary: What to Do

### Frontend (You can do right now):
1. Create `/app/api/user/funnels/route.ts` (copy from agents)
2. Create `/lib/hooks/use-funnels.ts` (copy from use-agents)
3. Add types to `/lib/types.ts`
4. Update `/app/dashboard/funnels/page.tsx` to use the hook

### Backend (Your Flask team needs to do):
1. Create Funnel model in database
2. Add CRUD endpoints: `/api/user/funnels`
3. Add analytics endpoint: `/api/user/funnels/{id}/analytics`

### Database (Prisma):
1. Add funnels table to schema
2. Run migration

---

## Don't Forget

- **All API calls use**: `import { api } from '@/lib/api-client'`
- **All hooks are 'use client'**: `'use client'` at top
- **All page components are 'use client'**: `'use client'` at top
- **All errors use**: `import { toast } from 'sonner'`
- **All lists filter with**: `useMemo` for performance
- **All forms validate with**: Zod + React Hook Form

Good luck!
