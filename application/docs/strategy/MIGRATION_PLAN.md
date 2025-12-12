# Frontend Migration Plan - Aiagentmanagementappgui → Next.js

**Start Date**: 2025-11-05
**Target**: Get all 18 features working in 1-2 days
**Strategy**: Copy components, adapt structure, replace routing

---

## 📊 Migration Analysis

### Component Inventory

**Total Components**: 31 page components
**Framework**: React + Vite → Next.js 15 App Router
**Auth**: Supabase → NextAuth (✅ Already done!)
**Database**: Supabase → Prisma (✅ Already done!)
**UI Library**: shadcn/ui (✅ Same!)

### Key Discovery: **COMPONENTS USE MOCK DATA!** 🎉

```typescript
// Example from BillingPage.tsx
const loadBillingData = async () => {
  // Mock data - NOT Supabase!
  setInvoices([
    { id: "INV-001", date: "2025-10-01", amount: 234.56, status: "paid" },
    // ...
  ]);
};
```

**This makes migration MUCH easier!**

---

## 🎯 Migration Strategy

### Phase 1: Layout & Navigation (2 hours)

**Goal**: Get new sidebar and layout working

1. **Copy AppLayout.tsx** → `components/layouts/AppLayout.tsx`
   - Remove Supabase imports
   - Use NextAuth `useSession()` instead of `user` prop
   - Keep navigation structure intact
   - Adapt to Next.js Link component

2. **Update main layout** → `app/dashboard/layout.tsx`
   - Replace current Sidebar.tsx with new AppLayout
   - Wire up NextAuth session provider
   - Test navigation switching

**Files to modify**:
- ✅ `components/layouts/AppLayout.tsx` (new)
- ✅ `app/dashboard/layout.tsx` (modify)
- ❌ `components/Sidebar.tsx` (deprecate)

### Phase 2: Copy Page Components (3 hours)

**Goal**: Copy all 31 page components to Next.js structure

**New Pages to Create**:

```
app/dashboard/
├── funnels/
│   ├── page.tsx              (FunnelsPage)
│   └── [id]/page.tsx         (FunnelDetailPage)
├── social-media/
│   ├── page.tsx              (SocialMediaPage)
│   ├── calendar/page.tsx     (SocialMediaCalendarPage)
│   └── [id]/page.tsx         (SocialPostDetailPage)
├── live-calls/
│   └── page.tsx              (LiveCallsPage)
├── personas/
│   └── page.tsx              (PersonasPage)
└── billing/
    └── page.tsx              (BillingPage)
```

**Existing Pages to Replace**:
- `app/dashboard/page.tsx` (DashboardPage - NEW version)
- `app/dashboard/agents/page.tsx` (AgentsPage - NEW version)
- `app/dashboard/calls/page.tsx` (CallsPage - NEW version)
- etc.

**Conversion Pattern**:

```typescript
// OLD (Vite/React)
export function BillingPage({ accessToken }: BillingPageProps) {
  // Component code
}

// NEW (Next.js App Router)
'use client'

import { useSession } from 'next-auth/react'

export default function BillingPage() {
  const { data: session } = useSession()
  // Component code (same)
  // Replace accessToken with session?.accessToken
}
```

### Phase 3: Remove Client-Side Routing (1 hour)

**Goal**: Convert from React state-based routing to Next.js routing

**OLD Pattern** (App.tsx):
```typescript
const [currentPage, setCurrentPage] = useState<PageState>("dashboard");
const handleNavigate = (page: string) => {
  setCurrentPage(page as PageState);
};

// Conditional rendering
{currentPage === "dashboard" && <DashboardPage />}
{currentPage === "billing" && <BillingPage />}
```

**NEW Pattern** (Next.js):
```typescript
// No state needed - Next.js handles routing
// Navigation uses Link component or router.push()

<Link href="/dashboard/billing">Billing</Link>
// Clicking automatically loads /app/dashboard/billing/page.tsx
```

**Changes Needed**:
1. ✅ Remove `currentPage` state from AppLayout
2. ✅ Replace `onNavigate` callbacks with Next.js `<Link>`
3. ✅ Remove conditional page rendering (Next.js does this)
4. ✅ Update all onClick handlers to use `router.push()` or `<Link>`

### Phase 4: Auth Adaptation (1 hour)

**Goal**: Replace Supabase auth with NextAuth

**OLD Pattern**:
```typescript
// App.tsx
const [user, setUser] = useState<any>(null);
const [accessToken, setAccessToken] = useState<string>("");

const checkSession = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    setAccessToken(session.access_token);
    setUser(session.user);
  }
};
```

**NEW Pattern**:
```typescript
// Any component
'use client'
import { useSession } from 'next-auth/react'

export default function MyPage() {
  const { data: session } = useSession()
  // session.user.email, session.user.name available
  // session.accessToken if needed
}
```

**Global Changes**:
1. ✅ Remove all `createClient()` from Supabase
2. ✅ Replace `accessToken` prop with `useSession()`
3. ✅ Replace `user` prop with `session?.user`
4. ✅ Remove Supabase auth imports

### Phase 5: Update API Calls (2 hours)

**Goal**: Wire up mock data to real backend APIs (where available)

**Pattern**:
```typescript
// Keep mock data for features without backend
const loadMockData = () => {
  setData([/* mock data */]);
};

// For features WITH backend (agents, calls, etc.)
const loadRealData = async () => {
  const res = await fetch('/api/v1/agents');
  const data = await res.json();
  setData(data);
};
```

**Priority**:
1. **Keep mock**: Billing, Funnels, Social Media, Live Calls, Personas (no backend yet)
2. **Connect real**: Dashboard, Agents, Calls, Phone Numbers, Analytics (backend exists)

### Phase 6: UI Components Audit (1 hour)

**Goal**: Ensure all shadcn/ui components are installed

**New Components Needed**:
```bash
# Check what's missing from new site
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add collapsible
npx shadcn@latest add separator
```

**Already Have**: card, button, badge, table, dialog, input, label, etc.

### Phase 7: Testing & Fixes (4 hours)

**Goal**: Test all 18 pages and fix integration issues

**Test Checklist**:
- [ ] Login flow works
- [ ] Dashboard loads
- [ ] All 18 pages accessible
- [ ] Navigation works (sidebar links)
- [ ] Theme toggle works
- [ ] Balance widget displays
- [ ] User profile shows correct data
- [ ] Logout works
- [ ] Admin panel accessible (if admin)
- [ ] Mobile responsive

**Common Issues to Fix**:
1. Import path errors (@ vs relative)
2. Client/Server component boundaries
3. Hydration mismatches
4. Missing dependencies
5. TypeScript errors

### Phase 8: Deploy (1 hour)

**Goal**: Deploy to production and verify

1. Stop current dev server
2. Build production bundle: `npm run build`
3. Start production: `npm run start` (or keep dev for now)
4. Restart Apache: `sudo systemctl restart apache2`
5. Test live site
6. Fix any production-only issues

---

## 📋 File Mapping

### New Files to Create (20+ files)

```
components/
└── layouts/
    └── AppLayout.tsx                    ← Copy from new site

app/dashboard/
├── billing/page.tsx                     ← NEW
├── funnels/
│   ├── page.tsx                         ← NEW
│   └── [id]/page.tsx                    ← NEW
├── live-calls/page.tsx                  ← NEW
├── personas/page.tsx                    ← NEW
└── social-media/
    ├── page.tsx                         ← NEW
    ├── calendar/page.tsx                ← NEW
    └── [id]/page.tsx                    ← NEW
```

### Files to Replace (13 files)

```
app/dashboard/
├── page.tsx                             ← REPLACE
├── agents/page.tsx                      ← REPLACE
├── analytics/page.tsx                   ← REPLACE
├── api-keys/page.tsx                    ← REPLACE
├── calls/
│   ├── page.tsx                         ← REPLACE
│   └── [id]/page.tsx                    ← REPLACE
├── campaigns/
│   ├── page.tsx                         ← REPLACE
│   └── [id]/page.tsx                    ← REPLACE
├── leads/page.tsx                       ← REPLACE
├── marketplace/page.tsx                 ← REPLACE
├── phone-numbers/page.tsx               ← REPLACE
├── settings/page.tsx                    ← REPLACE
├── testing/page.tsx                     ← REPLACE
└── white-label/page.tsx                 ← REPLACE
```

### Files to Deprecate

```
components/
├── Sidebar.tsx                          ← DELETE (replaced by AppLayout)
└── BalanceWidget.tsx                    ← DELETE (integrated in AppLayout)
```

---

## 🔧 Code Transformation Examples

### Example 1: Page Component

**BEFORE** (new site):
```typescript
// src/components/pages/BillingPage.tsx
import { toast } from "sonner@2.0.3";

interface BillingPageProps {
  accessToken: string;
}

export function BillingPage({ accessToken }: BillingPageProps) {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  return <div>Billing content</div>;
}
```

**AFTER** (Next.js):
```typescript
// app/dashboard/billing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function BillingPage() {
  const { data: session } = useSession()
  const [data, setData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  return <div>Billing content</div>
}
```

**Changes**:
1. ✅ Add `'use client'` directive
2. ✅ Change named export → default export
3. ✅ Remove accessToken prop, use useSession()
4. ✅ Fix sonner import (remove version)
5. ✅ Keep everything else the same

### Example 2: Navigation Links

**BEFORE**:
```typescript
// AppLayout.tsx (old)
<button onClick={() => onNavigate('billing')}>
  <CreditCard className="h-5 w-5" />
  <span>Billing</span>
</button>
```

**AFTER**:
```typescript
// AppLayout.tsx (new)
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pathname = usePathname()
const isActive = pathname === '/dashboard/billing'

<Link
  href="/dashboard/billing"
  className={isActive ? 'active' : ''}
>
  <CreditCard className="h-5 w-5" />
  <span>Billing</span>
</Link>
```

**Changes**:
1. ✅ Replace button → Link
2. ✅ Replace onNavigate → href
3. ✅ Use usePathname() for active state
4. ✅ Update href to match Next.js routes

### Example 3: Detail Pages with Dynamic Routes

**BEFORE**:
```typescript
// App.tsx
const [currentPage, setCurrentPage] = useState({
  page: "call-detail",
  callId: "123"
});

{currentPage.page === "call-detail" && (
  <CallDetailPage
    callId={currentPage.callId}
    onBack={() => setCurrentPage("calls")}
  />
)}
```

**AFTER**:
```typescript
// app/dashboard/calls/[id]/page.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function CallDetailPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const callId = params.id

  const handleBack = () => {
    router.push('/dashboard/calls')
  }

  return <div>Call {callId} details</div>
}
```

**Changes**:
1. ✅ Use Next.js dynamic route `[id]`
2. ✅ Get ID from params, not prop
3. ✅ Use router.push() for navigation
4. ✅ Remove onBack prop, implement locally

---

## ⏱️ Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Layout & Navigation | 2 hrs |
| 2 | Copy Page Components | 3 hrs |
| 3 | Remove Client Routing | 1 hr |
| 4 | Auth Adaptation | 1 hr |
| 5 | Update API Calls | 2 hrs |
| 6 | UI Components Audit | 1 hr |
| 7 | Testing & Fixes | 4 hrs |
| 8 | Deploy | 1 hr |
| **TOTAL** | **Full Migration** | **15 hrs** |

**Realistic Timeline**:
- **Day 1**: Phases 1-4 (7 hours)
- **Day 2**: Phases 5-8 (8 hours)

---

## ✅ Pre-Migration Checklist

- [x] Next.js 15 installed and working
- [x] NextAuth configured and working
- [x] Prisma connected to PostgreSQL
- [x] shadcn/ui components installed
- [x] Tailwind CSS configured
- [x] New site cloned to /tmp/Aiagentmanagementappgui
- [x] Current site backed up
- [ ] Git branch created for migration
- [ ] Dependencies audit complete

---

## 🚀 Execution Order

### STEP 1: Backup & Branch
```bash
cd /opt/livekit1/frontend
git checkout -b feature/new-design-migration
git add .
git commit -m "Checkpoint before migration"
```

### STEP 2: Install Missing UI Components
```bash
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add collapsible
npx shadcn@latest add separator
```

### STEP 3: Copy AppLayout
```bash
mkdir -p components/layouts
cp /tmp/Aiagentmanagementappgui/src/components/AppLayout.tsx \
   components/layouts/AppLayout.tsx
```

### STEP 4: Adapt AppLayout
- Remove Supabase imports
- Add Next.js imports (Link, usePathname, useRouter)
- Replace navigation callbacks with Links
- Use useSession() for user data

### STEP 5: Copy Pages (Batch Operation)
```bash
# Copy all new pages
for page in Billing Funnels LiveCalls Personas SocialMedia; do
  # Create and copy
done
```

### STEP 6: Test Each Phase
- After each phase, test the site works
- Fix issues before moving to next phase
- Commit working state

---

## 🎯 Success Criteria

- [x] All 18 pages accessible via navigation
- [ ] Login/logout works
- [ ] Theme toggle works
- [ ] All pages render without errors
- [ ] Navigation highlights active page
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Production build succeeds
- [ ] Live site works on https://ai.epic.dm

---

## 🔴 Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing pages | Test after each phase, can rollback |
| TypeScript errors | Fix as we go, use `any` temporarily if needed |
| Missing dependencies | Install before starting |
| Auth issues | NextAuth already working, low risk |
| Production build fails | Test build early and often |
| User sessions broken | Keep current auth system intact |

---

## 📝 Notes

- Components use **mock data** - easy migration!
- No Supabase database calls to replace
- Most work is copy/paste + path adjustments
- Auth is just swapping useSession() for accessToken prop
- Routing is Next.js native - cleaner than state-based

**This should be straightforward!** 🚀

Let's proceed with execution!
