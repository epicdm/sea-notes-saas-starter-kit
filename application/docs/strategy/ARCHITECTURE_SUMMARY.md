# Architecture Summary - Quick Overview

## What You Have: Full-Stack Next.js Application

```
Frontend (React 18/Next.js 15) 
    ↓ (HTTP requests)
Next.js API Routes (Proxy)
    ↓ (Auth + User email)
Flask Backend (localhost:5001)
    ↓ (SQL queries)
PostgreSQL Database
```

---

## Key Files to Know

### Frontend Pages
- `/app/dashboard/agents/page.tsx` - Reference implementation
- `/app/dashboard/funnels/page.tsx` - UI is complete, needs backend
- `/app/dashboard/calls/page.tsx` - Another good reference
- `/app/dashboard/campaigns/page.tsx` - Full feature with scheduling

### API Routes (Next.js Proxy Layer)
- `/app/api/user/agents/route.ts` - GET/POST pattern
- `/app/api/user/calls/route.ts` - Query param handling
- `/app/api/user/personas/route.ts` - Full CRUD
- **Missing**: `/app/api/user/funnels/route.ts` ← You need to create this

### Custom Hooks (Data Fetching)
- `/lib/hooks/use-agents.ts` - Template pattern for all hooks
- `/lib/hooks/use-call-logs.ts` - Handles loading/error/refetch
- `/lib/hooks/use-stats.ts` - Simple stats fetch

### Core Infrastructure
- `/lib/api-client.ts` - **Central API client** (handles auth, errors, timeouts)
- `/auth.ts` - NextAuth v5 configuration
- `/prisma/schema.prisma` - Database models
- `/middleware.ts` - Route protection

---

## How to Build Funnels Feature

### Step 1: Backend (Flask) - Create Funnel Model & API
```python
# Flask backend needs:
- Funnel model with fields: id, userId, name, type, status, entryPoints, etc.
- POST /api/user/funnels - Create funnel
- GET /api/user/funnels - List funnels
- GET /api/user/funnels/{id} - Get single
- PUT /api/user/funnels/{id} - Update funnel
- DELETE /api/user/funnels/{id} - Delete funnel
- GET /api/user/funnels/{id}/analytics - Analytics data
```

### Step 2: Database (Prisma) - Add Funnel Model
```prisma
model funnels {
  id String @id
  userId String
  name String
  description String?
  type String // "sales", "lead", "survey"
  status String @default("draft") // "draft", "active", "paused"
  entryPoints String[] // ["phone", "web_form", "chat", "email", "sms"]
  phoneNumber String?
  createdAt DateTime @default(now())
  updatedAt DateTime
  users users @relation(fields: [userId], references: [id])
  
  @@index([userId])
}
```

### Step 3: Next.js API Routes (Proxy to Flask)
Create `/app/api/user/funnels/route.ts`:
```typescript
// Copy pattern from /app/api/user/agents/route.ts
// Proxy GET/POST requests to Flask backend
```

### Step 4: Frontend Types
Add to `/lib/types.ts` or create `/types/funnel.ts`:
```typescript
export interface Funnel {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  type: string
  entryPoints: string[]
  phoneNumber: string
  stats: FunnelStats
  createdAt: string
}

export interface FunnelStats {
  totalCalls: number
  completed: number
  conversionRate: number
}
```

### Step 5: Custom Hook
Create `/lib/hooks/use-funnels.ts`:
```typescript
// Copy pattern from use-agents.ts
// Endpoint: /api/user/funnels
```

### Step 6: Pages & Components
- Page component already exists: `/app/dashboard/funnels/page.tsx`
- Analytics component exists: `/components/funnels/FunnelAnalyticsPanel.tsx`
- Wizards exist: `CreateFunnelWizard.tsx`, `EditFunnelWizard.tsx`
- **Just connect them to the API!**

---

## Architecture Patterns to Follow

### 1. API Client Usage
```typescript
// Always use this pattern:
const data = await api.get<Type>('/api/user/resource')
const newItem = await api.post<Type>('/api/user/resource', payload)
const updated = await api.put<Type>('/api/user/resource/id', payload)
await api.delete('/api/user/resource/id')
```

### 2. Custom Hook Pattern
```typescript
export function useResource() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
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
    fetchData()
  }, [fetchData])
  
  return { data, isLoading, error, refetch: fetchData }
}
```

### 3. Page Component Pattern
```typescript
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export default function ResourcePage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const data = await api.get('/api/user/resources')
      setItems(data)
    } catch (error) {
      toast.error('Failed to load')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filter, map, render...
  return <div>{/* UI */}</div>
}
```

### 4. Error Handling
```typescript
import { api, isApiError } from '@/lib/api-client'

try {
  const data = await api.get('/api/user/funnels')
} catch (error) {
  if (isApiError(error)) {
    console.error('API Error:', error.message, error.code)
  }
}
```

### 5. Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Created!')
toast.error('Failed to save')
toast.loading('Saving...')
```

---

## Database Ecosystem

### Users
- `users` - User accounts (email, password, name)
- `accounts` - OAuth connections (Google, GitHub, etc.)
- `sessions` - NextAuth sessions

### Core Entities
- `agent_configs` - AI agents
- `call_logs` - Call history
- `phone_mappings` - Phone numbers assigned to agents
- `personas` - AI personality templates
- `organizations` - Multi-tenancy support
- `subscriptions` - Billing info

### Missing (Need to Create)
- `funnels` - Sales funnels
- `funnel_steps` (optional) - Step progression tracking
- `funnel_leads` (optional) - Leads in each funnel

---

## Important Configuration

### Environment Variables
```env
BACKEND_URL=http://localhost:5001          # Flask backend
NEXT_PUBLIC_API_URL=/api/user              # Frontend API prefix
GOOGLE_CLIENT_ID=...                        # OAuth
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...                             # NextAuth secret
```

### API Response Format
All responses wrapped in envelope:
```json
{
  "success": true,
  "data": { /* actual data */ }
}
```

Or on error:
```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "ERROR_CODE",
    "details": { "field": ["error message"] }
  }
}
```

---

## Testing & Running

### Start Frontend
```bash
npm run dev
# Runs on http://localhost:3000
```

### E2E Tests
```bash
npm run test:e2e          # Run all tests
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:headed   # Show browser
npm run test:e2e:debug    # Debug mode
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name migration_name

# View database
npx prisma studio
```

---

## Component Library

### Base UI Components (Radix + HeroUI)
- `Button` - Action buttons
- `Input`, `Select`, `Checkbox`, `Radio` - Form inputs
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Cards
- `Badge` - Status labels
- `Dialog`, `AlertDialog` - Modals
- `DropdownMenu` - Menus
- `Tabs` - Tab navigation
- `Progress` - Progress bars

### Icons
```typescript
import { Plus, Search, Filter, Edit, Trash2, ChevronRight, ... } from 'lucide-react'
```

### Charts
```typescript
import { LineChart, BarChart, AreaChart, ResponsiveContainer } from 'recharts'
```

---

## File Structure Reference

```
/opt/livekit1/frontend/
├── app/
│   ├── api/user/
│   │   ├── agents/route.ts .................... Reference
│   │   ├── calls/route.ts ..................... Reference
│   │   ├── personas/route.ts .................. Reference
│   │   └── funnels/route.ts ................... ← CREATE THIS
│   └── dashboard/
│       └── funnels/
│           ├── page.tsx ....................... UI Complete
│           ├── [id]/page.tsx .................. Detail page
│           ├── [id]/edit/page.tsx ............. Edit wizard
│           ├── [id]/analytics/page.tsx ........ Analytics
│           └── new/page.tsx ................... Create wizard
├── components/
│   ├── CreateFunnelWizard.tsx ................. Complete
│   ├── EditFunnelWizard.tsx ................... Complete
│   ├── FunnelAnalyticsDialog.tsx .............. Complete
│   └── funnels/
│       └── FunnelAnalyticsPanel.tsx ........... Complete
├── lib/
│   ├── api-client.ts .......................... Core API client
│   ├── hooks/
│   │   ├── use-agents.ts ...................... Template
│   │   └── use-funnels.ts ..................... ← CREATE THIS
│   └── types.ts ............................... Update with Funnel type
└── prisma/
    └── schema.prisma .......................... ← Add funnels model
```

---

## Next Steps

1. **Backend**: Create Funnel model and API endpoints in Flask
2. **Database**: Add `funnels` table to Prisma schema + migrate
3. **Frontend API Routes**: Create `/app/api/user/funnels/route.ts`
4. **Types**: Add `Funnel`, `FunnelStats`, `FunnelAnalytics` types
5. **Hook**: Create `useFunnels()` custom hook
6. **Connect**: Update page components to use hook instead of mock data

Everything else (UI, components, wizards) is already done!

