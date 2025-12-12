# Project Structure

## Root Directory
```
/opt/livekit1/frontend/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities and libraries
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── utils/                  # Helper functions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── e2e/                    # Playwright E2E tests
├── scripts/                # Build and utility scripts
├── config/                 # Configuration files
├── .next/                  # Next.js build output (generated)
├── node_modules/           # Dependencies (generated)
└── SuperClaude_Framework/  # SuperClaude plugin/framework
```

## App Directory (Next.js App Router)
```
app/
├── dashboard/              # Main dashboard pages
│   ├── agents/            # Agent management
│   │   └── new/           # Agent creation wizard
│   ├── phone-numbers/     # Phone number management
│   ├── calls/             # Call history
│   ├── analytics/         # Analytics dashboard
│   └── settings/          # User settings
├── auth/                   # Authentication pages
├── api/                    # API routes
├── admin/                  # Admin pages
├── billing/                # Billing and subscription
├── live-calls/             # Live call monitoring
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
└── globals.css             # Global styles
```

## Components Directory
```
components/
├── ui/                     # Base UI components (shadcn-style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── skeleton.tsx
│   ├── error-boundary.tsx
│   └── ...
├── agents/                 # Agent-specific components
│   ├── AgentWizardStep1.tsx
│   ├── AgentWizardStep2.tsx
│   ├── AgentWizardStep3.tsx
│   └── AgentListItem.tsx
├── phone-numbers/          # Phone number components
│   ├── ProvisionModal.tsx
│   └── NumberListItem.tsx
├── dashboard/              # Dashboard widgets
│   ├── StatCard.tsx
│   └── RecentCalls.tsx
├── layout/                 # Layout components
│   └── Sidebar.tsx
└── form/                   # Form components
```

## Lib Directory
```
lib/
├── schemas/                # Zod validation schemas
│   ├── agent-schema.ts
│   ├── phone-schema.ts
│   └── settings-schema.ts
├── hooks/                  # Custom React hooks
│   ├── useAgents.ts
│   ├── usePhoneNumbers.ts
│   ├── useCallLogs.ts
│   └── useStats.ts
├── api-client.ts           # API client with auth
├── prisma.ts               # Prisma client singleton
├── auth.ts                 # NextAuth configuration
├── livekit.ts              # LiveKit utilities
├── stripe.ts               # Stripe integration
├── utils.ts                # General utilities
└── types.ts                # Shared type definitions
```

## E2E Tests
```
e2e/
├── agent-creation.spec.ts      # Agent wizard flow
├── phone-provisioning.spec.ts  # Phone number flow
└── dashboard-load.spec.ts      # Dashboard loading
```

## Configuration Files
```
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── eslint.config.mjs          # ESLint configuration
├── playwright.config.ts       # Playwright test config
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.mjs         # PostCSS config
├── prisma.config.ts           # Prisma configuration
└── .env                       # Environment variables
```

## Documentation Files
```
├── README.md                       # Project overview
├── QUICK_REFERENCE.md             # Developer quick reference
├── NEXT_STEPS.md                  # QA/testing roadmap
├── MODERNIZATION_SUMMARY.md       # Architecture updates
├── MIGRATION_COMPLETE.md          # Migration notes
└── PRODUCTION_DIAGNOSIS.md        # Production issues
```

## Key Files
- **app/layout.tsx**: Root layout with providers, auth
- **app/providers.tsx**: Client-side provider wrapper
- **middleware.ts**: NextAuth middleware for route protection
- **auth.ts**: NextAuth v5 configuration
- **lib/api-client.ts**: Centralized API client with error handling
- **prisma/schema.prisma**: Database schema definition

## Component Organization Pattern
```
Feature Components:
/components/[feature]/
├── [Feature]List.tsx          # List view
├── [Feature]Card.tsx          # Card/item component
├── [Feature]Modal.tsx         # Modal/dialog
└── [Feature]Form.tsx          # Form component

Example:
/components/agents/
├── AgentList.tsx
├── AgentCard.tsx
├── AgentModal.tsx
└── AgentForm.tsx
```

## Page Organization Pattern
```
/app/dashboard/[feature]/
├── page.tsx                   # Main page component
├── [id]/                      # Dynamic route
│   └── page.tsx
└── new/                       # Create new
    └── page.tsx

Example:
/app/dashboard/agents/
├── page.tsx                   # List all agents
├── [id]/
│   └── page.tsx              # View single agent
└── new/
    └── page.tsx              # Create new agent (wizard)
```

## Import Path Resolution
```typescript
// @ alias maps to project root
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/lib/hooks/useAgents';
```

## Build Output
```
.next/                          # Generated by Next.js
├── cache/                      # Build cache
├── server/                     # Server-side code
├── static/                     # Static assets
└── types/                      # Generated types
```
