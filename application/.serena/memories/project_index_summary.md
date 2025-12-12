# Frontend Project Index - Quick Summary

**Location**: `/opt/livekit1/frontend/PROJECT_INDEX.md`
**Generated**: 2025-11-05

## Quick Stats
- **Total Routes**: 150+ (pages + API endpoints)
- **React Components**: 150+
- **Custom Hooks**: 10+
- **Type Definitions**: 11 core types
- **Validation Schemas**: 6 schemas
- **API Endpoints**: 60+
- **E2E Tests**: 4 test suites

## Key Directories

### App Directory Structure
- **Pages**: `/dashboard/*` (main user pages)
- **API Routes**: `/api/user/*`, `/api/v1/*`, `/api/webhooks/*`
- **Auth Pages**: `/auth/signin`, `/auth/signup`
- **Admin Pages**: `/admin/*`

### Components Organization
- **UI Primitives**: `components/ui/` (50+ shadcn-style components)
- **Feature Components**: `components/agents/`, `components/calls/`, etc.
- **Page Components**: `components/pages/*` (alternative implementations)
- **Layout**: `components/layout/`

### Library Structure
- **Hooks**: `lib/hooks/` (useAgents, usePhoneNumbers, useCallLogs, etc.)
- **Schemas**: `lib/schemas/` (Zod validation schemas)
- **Utils**: `lib/` (api-client, prisma, auth, livekit, stripe, etc.)

### Types
- **Core Types**: `types/` (agent, phone-number, call-log, user, etc.)

## Feature Areas

### Agent Management
- Routes: `/dashboard/agents/*`
- Components: `components/agents/*` (wizard, cards, inspector)
- API: `/api/user/agents/*`
- Hook: `lib/hooks/use-agents.ts`
- Type: `types/agent.ts`

### Phone Numbers
- Routes: `/dashboard/phone-numbers`
- Components: `components/phone-numbers/*`
- API: `/api/user/phone-numbers/*`
- Hook: `lib/hooks/use-phone-numbers.ts`

### Call History
- Routes: `/dashboard/calls/*`
- Components: `components/calls/*` (transcript viewer, cost breakdown)
- API: `/api/user/call-logs`
- Hook: `lib/hooks/use-call-logs.ts`, `hooks/useCallTranscript.ts`

### Analytics
- Routes: `/dashboard/analytics`
- Components: `components/dashboard/*`
- API: `/api/user/stats/*`
- Hooks: `lib/hooks/use-analytics.ts`, `lib/hooks/use-stats.ts`

### Webhooks
- Routes: `/dashboard/integrations/webhooks`
- Components: `components/webhooks/*`
- API: `/api/webhooks/*`

## Important Files

### Configuration
- `next.config.ts` - Next.js config
- `tailwind.config.js` - Tailwind CSS config
- `tsconfig.json` - TypeScript config
- `middleware.ts` - Auth middleware
- `auth.ts` - NextAuth configuration

### Core Utilities
- `lib/api-client.ts` - Frontend API client
- `lib/prisma.ts` - Database client
- `lib/livekit.ts` - LiveKit integration
- `lib/stripe.ts` - Stripe integration

### Documentation
- `PROJECT_INDEX.md` - Complete repository index (this file's source)
- `MIGRATION_REPAIR_PLAN.md` - Migration and repair guide
- `QUICK_REFERENCE.md` - Developer quick reference
- `NEXT_STEPS.md` - QA roadmap

## Navigation Tips

1. **Find pages**: Look in `app/` directory
2. **Find components**: Look in `components/` directory
3. **Find API routes**: Look in `app/api/` directory
4. **Find hooks**: Look in `lib/hooks/` or `hooks/`
5. **Find types**: Look in `types/` directory
6. **Find validation**: Look in `lib/schemas/` directory

## Tech Stack Summary
- Next.js 15.5.6 (App Router)
- TypeScript 5.9.3
- React 18.3.1
- Tailwind CSS 4.1.16
- Prisma 6.18.0
- NextAuth 5.0.0-beta.29
- HeroUI 2.8.5
- Playwright 1.56.1

For complete details, see `/opt/livekit1/frontend/PROJECT_INDEX.md`
