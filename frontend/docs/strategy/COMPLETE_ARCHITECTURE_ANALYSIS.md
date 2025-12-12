# Epic.ai Frontend - Complete Codebase Architecture Analysis

**Date**: November 8, 2025
**Project**: Epic.ai Voice Agents Platform
**Frontend Type**: Full-Stack Next.js with API Routes
**Current Branch**: feature/phase1-three-entity-integration

---

## 1. PROJECT STRUCTURE OVERVIEW

This is a **full-stack Next.js application**, NOT frontend-only. It includes:
- **Frontend**: React 18 with Next.js 15 (App Router)
- **API Layer**: Next.js API Routes that proxy to Flask backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 with multi-provider support

### Directory Tree (Key Areas)

```
/opt/livekit1/frontend/
├── app/
│   ├── api/                    # Next.js API Routes (proxy to Flask backend)
│   │   ├── auth/              # NextAuth authentication routes
│   │   ├── user/              # User-scoped API endpoints
│   │   ├── admin-api/         # Admin endpoints
│   │   ├── dashboard/         # Dashboard data endpoints
│   │   ├── webhooks/          # Webhook receivers
│   │   └── testing/           # Testing utilities
│   ├── dashboard/             # Protected dashboard pages
│   │   ├── agents/            # Agent management (page + [id])
│   │   ├── funnels/           # Sales funnels (page + [id] + new)
│   │   ├── calls/             # Call logs & transcripts
│   │   ├── campaigns/         # Campaign management
│   │   ├── personas/          # AI personas
│   │   ├── phone-numbers/     # Phone number management
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── leads/             # Lead management
│   │   ├── billing/           # Billing & subscription
│   │   └── settings/          # User settings
│   ├── auth/                  # Authentication pages (signin, signup, error)
│   ├── layout.tsx             # Root layout (providers, auth, toaster)
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── ui/                    # Base UI (shadcn-style)
│   ├── agents/                # Agent-specific components
│   ├── funnels/               # Funnel components
│   ├── pages/                 # Page-level components
│   ├── CreateFunnelWizard.tsx # Multi-step funnel creation
│   ├── EditFunnelWizard.tsx   # Funnel editing
│   ├── CreateAgentDialog.tsx  # Agent creation dialog
│   └── [other-dialogs].tsx
├── lib/
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-agents.ts      # Fetch & manage agents
│   │   ├── use-stats.ts       # Fetch dashboard stats
│   │   ├── use-call-logs.ts   # Fetch call history
│   │   ├── use-personas.ts    # Fetch personas
│   │   └── [other-hooks].ts
│   ├── schemas/               # Zod validation schemas
│   ├── api-client.ts          # Centralized API client with auth
│   ├── api.ts                 # Deprecated Flask API client
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client singleton
│   ├── types.ts               # Shared TypeScript types
│   └── [other-utils].ts
├── prisma/
│   └── schema.prisma          # PostgreSQL schema with Prisma
├── middleware.ts              # NextAuth route protection
├── auth.ts                    # NextAuth config (v5)
└── [config files]             # eslint, tailwind, tsconfig, etc.
```

---

## 2. TECHNOLOGY STACK (Detailed)

### Core Dependencies
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15.5.6 |
| **Runtime** | React | 18.3.1 |
| **Language** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.1.16 |
| **Component Library** | HeroUI | 2.8.5 |
| **Components** | Radix UI | Latest |

### Key Libraries
| Feature | Package | Version |
|---------|---------|---------|
| **Auth** | NextAuth | 5.0.0-beta.29 |
| **Auth Adapter** | @auth/prisma-adapter | 2.11.0 |
| **Database** | Prisma ORM | 6.18.0 |
| **Database Driver** | @prisma/client | 6.18.0 |
| **Forms** | React Hook Form | 7.65.0 |
| **Validation** | Zod | 4.1.12 |
| **UI Animations** | Framer Motion | 12.23.24 |
| **Icons** | Lucide React | 0.546.0 |
| **Charts** | Recharts | 3.3.0 |
| **Notifications** | Sonner | 2.0.7 |
| **LiveKit** | @livekit/components-react | 2.9.15 |
| **Testing** | Playwright | 1.56.1 |

### Database
- **Engine**: PostgreSQL
- **ORM**: Prisma (v6.18.0)
- **Adapter**: @auth/prisma-adapter (NextAuth integration)

---

## 3. BACKEND ARCHITECTURE

### 3.1 API Layer Pattern

**Frontend has NO direct database access.** All data flows through API routes:

```
React Component
    ↓
Next.js API Route (/api/user/*)
    ↓
NextAuth Authentication (session validation)
    ↓
User email extracted from session
    ↓
Flask Backend (localhost:5001)
    ↓
PostgreSQL Database
```

### 3.2 Next.js API Routes Structure

**Location**: `/opt/livekit1/frontend/app/api/user/*`

All routes follow this pattern:

```typescript
// /app/api/user/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

export async function GET(req: NextRequest) {
  // 1. Get authenticated session
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }
  
  // 2. Proxy to Flask backend with user email header
  const response = await fetch(`${BACKEND_URL}/api/user/[resource]`, {
    headers: {
      'X-User-Email': session.user.email,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  
  // 3. Return response (wrapped in success envelope)
  const data = await response.json()
  return NextResponse.json({
    success: true,
    data: data
  })
}
```

### 3.3 Available API Endpoints

#### User API Routes (`/api/user/`)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/agents` | GET/POST | List/create agents |
| `/agents/[id]` | GET/PUT/DELETE | Manage single agent |
| `/agents/[id]/deploy` | POST | Deploy agent |
| `/agents/[id]/undeploy` | POST | Undeploy agent |
| `/calls` | GET | Get call logs |
| `/calls/test-outbound` | POST | Test outbound call |
| `/phone-numbers` | GET/POST | List/add phone numbers |
| `/phone-numbers/[phoneNumber]` | GET/PUT/DELETE | Manage phone number |
| `/phone-numbers/[phoneNumber]/assign` | POST | Assign to agent |
| `/phone-numbers/[phoneNumber]/unassign` | POST | Unassign from agent |
| `/phone-numbers/provision` | POST | Provision new number |
| `/personas` | GET/POST | List/create personas |
| `/personas/[id]` | GET/PUT/DELETE | Manage persona |
| `/stats` | GET | Dashboard stats |
| `/stats/calls` | GET | Call statistics |
| `/stats/cost` | GET | Cost statistics |
| `/analytics` | GET | Analytics data |
| `/call-logs` | GET | Paginated call logs |
| `/leads` | GET/POST | Lead management |
| `/campaigns` | GET/POST/PUT | Campaign management |
| `/campaigns/[id]/schedule` | POST | Schedule campaign |
| `/brand-profile` | GET/PUT | Brand profile |
| `/brand-profile/extract` | POST | Extract brand info from URL |
| `/profile` | GET/PUT | User profile |
| `/complete-onboarding` | POST | Complete onboarding |

#### Funnels (Not Yet Implemented in Backend)
**Missing**: No `/api/user/funnels` endpoints exist yet in backend or Next.js API routes

---

## 4. DATABASE SCHEMA (Prisma)

**File**: `/opt/livekit1/frontend/prisma/schema.prisma`

### Core Models

#### Users & Auth
```prisma
model users {
  id String @id
  email String @unique
  name String?
  password String?
  createdAt DateTime @default(now())
  // relationships: agents, calls, etc.
}

model accounts {
  id String @id
  userId String
  provider String // "google", "github", etc.
  // OAuth token storage
}

model sessions {
  id String @id
  sessionToken String @unique
  userId String
  expires DateTime
}
```

#### Core Entities
```prisma
model agent_configs {
  id String @id
  userId String
  name String
  instructions String
  llmModel String?
  voice String?
  status String @default("created")
  createdAt DateTime @default(now())
  // relationships: call_logs, phone_mappings
}

model phone_mappings {
  id String @id
  userId String
  agentConfigId String
  phoneNumber String @unique
  isActive Boolean @default(true)
  // links agents to phone numbers
}

model call_logs {
  id String @id
  userId String
  agentConfigId String?
  phoneNumber String?
  durationSeconds Int?
  startedAt DateTime @default(now())
  endedAt DateTime?
  // call history
}

model organizations {
  id String @id
  name String
  ownerId String
  // multi-tenancy support
}

model subscriptions {
  id String @id
  organizationId String @unique
  status String
  plan String?
  currentPeriodEnd DateTime?
}
```

**Note**: No `funnels` table exists yet - this is what needs to be designed and implemented.

---

## 5. API INTEGRATION PATTERNS

### 5.1 Centralized API Client

**File**: `/opt/livekit1/frontend/lib/api-client.ts`

**Purpose**: Single point for all API calls with:
- Automatic NextAuth token injection
- Consistent error handling
- Type safety with TypeScript
- Request timeout (30s default)
- Automatic user email header

### Usage Pattern

```typescript
import { api, ApiError, isApiError } from '@/lib/api-client'

// GET request
const agents = await api.get<Agent[]>('/api/user/agents')

// POST with body
const newAgent = await api.post<Agent>(
  '/api/user/agents',
  { name: 'My Agent', ... }
)

// PUT request
const updated = await api.put<Agent>(
  '/api/user/agents/123',
  { name: 'Updated Name' }
)

// DELETE request
await api.delete('/api/user/agents/123')

// Error handling
try {
  const data = await api.get('/api/user/agents')
} catch (error) {
  if (isApiError(error)) {
    console.error(error.message, error.code, error.details)
  }
}
```

### API Response Format

All API responses follow a standard envelope:

```typescript
interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: Record<string, string[]>
  }
}
```

---

## 6. CUSTOM HOOKS (Data Fetching)

**Location**: `/opt/livekit1/frontend/lib/hooks/`

### Available Hooks

All hooks follow the same pattern:

```typescript
interface UseHookReturn {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useHook(): UseHookReturn {
  // Uses api.get() internally
  // Auto-fetches on mount
  // Provides manual refetch()
}
```

### Hook List
| Hook | Returns | Endpoint |
|------|---------|----------|
| `useAgents()` | `Agent[]` | `/api/user/agents` |
| `useStats()` | `UserStats` | `/api/user/stats` |
| `useCallLogs()` | `CallLog[]` | `/api/user/call-logs` |
| `usePersonas()` | `Persona[]` | `/api/user/personas` |
| `usePhoneNumbers()` | `PhoneNumber[]` | `/api/user/phone-numbers` |
| `useBrandProfile()` | `BrandProfile` | `/api/user/brand-profile` |
| `useAnalytics()` | `AnalyticsData` | `/api/user/analytics` |
| `useProfile()` | `UserProfile` | `/api/user/profile` |

### Example Hook Usage

```typescript
// In a 'use client' component
export default function AgentsPage() {
  const { agents, isLoading, error, refetch } = useAgents()
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorState onRetry={refetch} />
  
  return <AgentList agents={agents} onRefresh={refetch} />
}
```

---

## 7. EXISTING PAGE PATTERNS

### 7.1 Dashboard Page Pattern

**Example**: `/app/dashboard/agents/page.tsx`

```typescript
'use client' // Client component

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export default function AgentsPage() {
  // 1. Session check
  const session = useSession()
  
  // 2. Local state
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 3. Load data on mount
  useEffect(() => {
    loadAgents()
  }, [])
  
  // 4. API call
  const loadAgents = async () => {
    try {
      setIsLoading(true)
      const data = await api.get<Agent[]>('/api/user/agents')
      setAgents(data)
    } catch (error) {
      toast.error('Failed to load agents')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 5. Filter & render
  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div>
      <Input 
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredAgents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
```

### 7.2 Component Patterns Used

#### Input Components
```typescript
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

#### Icons
```typescript
import { 
  Plus, Search, Filter, Edit, Trash2, 
  MoreVertical, AlertCircle, CheckCircle2,
  TrendingUp, Phone, DollarSign
} from 'lucide-react'
```

#### Notifications
```typescript
import { toast } from 'sonner'

toast.success('Agent created!')
toast.error('Failed to save')
toast.loading('Saving...')
```

---

## 8. AUTHENTICATION FLOW

### 8.1 NextAuth Configuration

**File**: `/opt/livekit1/frontend/auth.ts`

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { auth as nextAuth } from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { auth, handlers, signIn, signOut } = nextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
})
```

### 8.2 Session Usage

```typescript
// In server-side API routes
import { auth } from '@/auth'

const session = await auth()
const userEmail = session?.user?.email
```

```typescript
// In client components
import { useSession } from 'next-auth/react'

export default function Page() {
  const session = useSession()
  
  if (session.status === 'unauthenticated') {
    return <SignInPage />
  }
  
  return <div>Welcome, {session.data?.user?.email}</div>
}
```

### 8.3 Route Protection

**File**: `/opt/livekit1/frontend/middleware.ts`

Protects `/dashboard/*` routes - redirects unauthenticated users to `/auth/signin`

---

## 9. COMPONENT STRUCTURE - DASHBOARD PAGES

### 9.1 Agents Page Example

**File**: `/opt/livekit1/frontend/app/dashboard/agents/page.tsx`

**Pattern**:
1. 'use client' declaration
2. useSession() hook for auth check
3. useState for local state (search, filters, dialogs)
4. useEffect for data loading
5. Render filters/search
6. Render main content grid
7. Action buttons (Create, Edit, Delete)
8. Dialogs for CRUD operations

**Key Features**:
- Search by name
- Filter by status/type
- Sort by multiple criteria
- Multi-select with bulk actions
- Create/Edit dialogs
- Delete confirmation
- Loading states
- Empty states

### 9.2 Funnels Page Structure

**File**: `/opt/livekit1/frontend/app/dashboard/funnels/page.tsx`

**Current Status**: Polished version exists
- Shows funnels in grid layout
- Entry points with icons
- Statistics cards
- Analytics panel
- Performance optimizations (memoization)
- Create/Edit/Delete wizards

**Missing**:
- Backend API endpoints for CRUD
- Database table for funnels
- Type definitions in database

---

## 10. FORMS & VALIDATION

### 10.1 React Hook Form + Zod Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define schema with Zod
const agentSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  instructions: z.string().min(10),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo']),
})

type AgentFormData = z.infer<typeof agentSchema>

// 2. Use in component
export function CreateAgentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  })
  
  const onSubmit = async (data: AgentFormData) => {
    try {
      const result = await api.post('/api/user/agents', data)
      toast.success('Agent created!')
    } catch (error) {
      toast.error('Failed to create agent')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <Button type="submit">Create</Button>
    </form>
  )
}
```

---

## 11. STYLING APPROACH

### 11.1 Tailwind CSS Configuration

**File**: `/opt/livekit1/frontend/tailwind.config.mjs`

- Tailwind CSS v4
- CSS variable-based colors (`hsl(var(--primary))`)
- Dark mode support (`dark:` prefix)
- Custom spacing & typography

### 11.2 Component Styling Examples

```typescript
// Base button
<Button className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
  Click me
</Button>

// Dark mode
<div className="bg-white dark:bg-slate-950">
  Light and dark backgrounds
</div>

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>

// Gradient background
<div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
  Gradient
</div>
```

---

## 12. TESTING APPROACH

### E2E Testing with Playwright

**Location**: `/opt/livekit1/frontend/e2e/`

```typescript
import { test, expect } from '@playwright/test'

test('Agent management flow', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('http://localhost:3001/dashboard/agents')
  
  // Wait for page load
  await expect(page.locator('text=Agents')).toBeVisible()
  
  // Click create button
  await page.click('button:has-text("Create Agent")')
  
  // Fill form
  await page.fill('input[name="name"]', 'My Agent')
  await page.fill('textarea[name="instructions"]', 'You are helpful')
  
  // Submit
  await page.click('button:has-text("Create")')
  
  // Verify success
  await expect(page.locator('text=Agent created')).toBeVisible()
})
```

---

## 13. ENVIRONMENT CONFIGURATION

**File**: `/opt/livekit1/frontend/.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=/api/user
BACKEND_URL=http://localhost:5001

# App Configuration
NEXT_PUBLIC_APP_NAME=Epic.ai Voice Agents
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...

# Email Service
RESEND_API_KEY=re_placeholder
```

---

## 14. EXISTING SIMILAR PAGES (Reference)

### Agents Page (`/dashboard/agents`)
- **Type**: 'use client' component
- **Data Fetch**: `api.get('/api/user/agents')`
- **Features**: Search, filter, sort, create/edit/delete
- **Components**: AgentCard, CreateAgentDialog, EditAgentDialog
- **State**: agents[], filteredAgents[], searchQuery, selectedAgent

### Calls Page (`/dashboard/calls`)
- **Type**: 'use client' component
- **Data Fetch**: `api.get('/api/user/calls')`
- **Features**: Call list, transcript view, search
- **Components**: CallCard, TranscriptSection
- **State**: callLogs[], selectedCall, isLoading

### Phone Numbers Page (`/dashboard/phone-numbers`)
- **Type**: 'use client' component
- **Data Fetch**: `api.get('/api/user/phone-numbers')`
- **Features**: List, assign to agent, provision new
- **Components**: PhoneNumberCard
- **State**: phoneNumbers[], assignedAgent

### Personas Page (`/dashboard/personas`)
- **Type**: 'use client' component
- **Data Fetch**: `api.get('/api/user/personas')`
- **Features**: List, create, edit templates
- **Components**: PersonaCard, PersonaForm
- **State**: personas[], selectedPersona

### Campaigns Page (`/dashboard/campaigns`)
- **Type**: 'use client' component
- **Data Fetch**: `api.get('/api/user/campaigns')`
- **Features**: Schedule, target lists, performance tracking
- **Components**: CampaignCard, ScheduleModal
- **State**: campaigns[], selectedCampaign

---

## 15. KEY ARCHITECTURAL DECISIONS

### 1. **Frontend-Agnostic API Design**
- Uses Next.js API routes as proxy/adapter
- All logic remains in Flask backend
- Frontend is thin client (UI + session management)

### 2. **User Authentication**
- NextAuth for session management
- Prisma for session storage in PostgreSQL
- User email extracted and sent to Flask backend

### 3. **Data Fetching Pattern**
- Custom hooks for data management
- Centralized `apiClient` for all HTTP calls
- Type-safe responses with TypeScript

### 4. **State Management**
- React hooks (useState, useEffect, useCallback)
- No Redux/Zustand (kept simple)
- Local state only, no global context

### 5. **Component Library**
- Radix UI primitives (unstyled, composable)
- HeroUI for some pre-styled components
- Tailwind CSS for custom styling

### 6. **Form Handling**
- React Hook Form (lightweight)
- Zod for runtime validation
- Automatic error display

---

## 16. MISSING PIECES FOR FUNNELS

To complete the Funnels feature, you need:

### Backend (Flask)
- [ ] Funnel data model
- [ ] CRUD endpoints: `/api/user/funnels`
- [ ] Funnel analytics endpoint
- [ ] Integration with agents & campaigns

### Frontend API Routes
- [ ] `/app/api/user/funnels/route.ts` (GET/POST)
- [ ] `/app/api/user/funnels/[id]/route.ts` (GET/PUT/DELETE)
- [ ] `/app/api/user/funnels/[id]/analytics/route.ts`

### Database (Prisma)
- [ ] `funnels` model
- [ ] `funnel_steps` model (if steps needed)
- [ ] Migration file

### Frontend Types
- [ ] Funnel type definition
- [ ] FunnelStats type
- [ ] FunnelAnalytics type

### Frontend Components
- [ ] useFunnels() hook
- [ ] Funnel page (done)
- [ ] Analytics panel (done)
- [ ] Create/Edit wizards (done)

---

## 17. QUICK REFERENCE: COMMON PATTERNS

### API Call Pattern
```typescript
const data = await api.get<Type>('/api/user/resource')
const newItem = await api.post<Type>('/api/user/resource', { ... })
const updated = await api.put<Type>('/api/user/resource/id', { ... })
await api.delete('/api/user/resource/id')
```

### Component Pattern
```typescript
'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export default function Page() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const result = await api.get('/api/user/resource')
      setData(result)
    } catch (error) {
      toast.error('Failed to load')
    }
  }
  
  return <div>{/* render data */}</div>
}
```

### Hook Pattern
```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { api, isApiError } from '@/lib/api-client'

export function useResource() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetch = useCallback(async () => {
    try {
      const result = await api.get('/api/user/resource')
      setData(result)
    } catch (err) {
      setError(isApiError(err) ? new Error(err.message) : err)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetch()
  }, [fetch])
  
  return { data, isLoading, error, refetch: fetch }
}
```

---

## 18. SUMMARY

**This is a sophisticated, production-grade Next.js application with:**

1. **Full-stack architecture** - Frontend UI + API routes + backend proxy
2. **Type-safe development** - TypeScript throughout
3. **Scalable patterns** - Custom hooks, reusable components, centralized API
4. **Multi-entity support** - Agents, campaigns, calls, leads, personas, phone numbers
5. **Modern stack** - React 18, Next.js 15, Prisma ORM, NextAuth v5
6. **Polished UI** - Tailwind CSS, Radix UI, HeroUI, Framer Motion
7. **Production-ready** - Error handling, loading states, toast notifications, E2E tests

**Funnels feature is ~70% complete:**
- UI pages and components: ✅ Done
- API routes: ❌ Missing
- Database models: ❌ Missing
- Custom hooks: ❌ Missing

