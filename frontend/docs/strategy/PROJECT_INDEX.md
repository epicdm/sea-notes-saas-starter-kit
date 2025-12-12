# Frontend Project Index

**Generated**: 2025-11-05
**Repository**: `/opt/livekit1/frontend`
**Framework**: Next.js 15.5.6 (App Router)
**Language**: TypeScript 5.9.3

This comprehensive index maps the entire repository structure for navigation and reasoning.

---

## 📋 Table of Contents

- [Repository Structure Overview](#repository-structure-overview)
- [App Directory (Routes)](#app-directory-routes)
- [Components Library](#components-library)
- [Library Utilities](#library-utilities)
- [Type Definitions](#type-definitions)
- [Configuration Files](#configuration-files)
- [Testing](#testing)
- [Documentation](#documentation)
- [Quick Navigation](#quick-navigation)

---

## 📁 Repository Structure Overview

```
/opt/livekit1/frontend/
├── app/                      # Next.js App Router (pages & API routes)
├── components/               # React components library
├── lib/                      # Utilities, hooks, schemas
├── types/                    # TypeScript type definitions
├── hooks/                    # Custom React hooks
├── utils/                    # Helper utilities
├── e2e/                      # Playwright E2E tests
├── prisma/                   # Database schema
├── public/                   # Static assets
├── .next/                    # Build output (generated)
├── node_modules/             # Dependencies (generated)
└── [config files]            # Configuration files
```

**Total Statistics**:
- **App Routes**: 150+ pages and API endpoints
- **Components**: 150+ reusable components
- **Hooks**: 10+ custom hooks
- **Type Definitions**: 11 core types
- **Schemas**: 6 validation schemas
- **API Routes**: 60+ backend endpoints
- **E2E Tests**: 4 test suites

---

## 🌐 App Directory (Routes)

### Public Pages (Unauthenticated)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page |
| `/auth/signin` | `app/auth/signin/page.tsx` | Sign in page |
| `/auth/signup` | `app/auth/signup/page.tsx` | Sign up page |
| `/auth/error` | `app/auth/error/page.tsx` | Auth error page |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/tos` | `app/tos/page.tsx` | Terms of service |

### Dashboard Pages (Authenticated)

#### Main Dashboard
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard overview |
| `/dashboard/realtime` | `app/dashboard/realtime/page.tsx` | Real-time monitoring |

#### Agents Management
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/agents` | `app/dashboard/agents/page.tsx` | Agent list |
| `/dashboard/agents/new` | `app/dashboard/agents/new/page.tsx` | Create new agent (wizard) |
| `/dashboard/agents/[id]` | `app/dashboard/agents/[id]/page.tsx` | View agent details |
| `/dashboard/agents/[id]/edit` | `app/dashboard/agents/[id]/edit/page.tsx` | Edit agent |

#### Phone Numbers
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/phone-numbers` | `app/dashboard/phone-numbers/page.tsx` | Phone number management |
| `/phone-numbers` | `app/phone-numbers/page.tsx` | Alternative phone numbers page |

#### Calls & Analytics
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/calls` | `app/dashboard/calls/page.tsx` | Call history list |
| `/dashboard/calls/[id]` | `app/dashboard/calls/[id]/page.tsx` | Call detail view |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics dashboard |
| `/dashboard/live-listen` | `app/dashboard/live-listen/page.tsx` | Live call monitoring |
| `/live-calls` | `app/live-calls/page.tsx` | Live calls page |

#### Campaigns & Funnels
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/campaigns` | `app/dashboard/campaigns/page.tsx` | Campaign list |
| `/dashboard/campaigns/new` | `app/dashboard/campaigns/new/page.tsx` | Create campaign |
| `/dashboard/campaigns/[id]` | `app/dashboard/campaigns/[id]/page.tsx` | Campaign details |
| `/dashboard/funnels` | `app/dashboard/funnels/page.tsx` | Funnel list |
| `/dashboard/funnels/new` | `app/dashboard/funnels/new/page.tsx` | Create funnel |
| `/dashboard/funnels/[id]` | `app/dashboard/funnels/[id]/page.tsx` | Funnel details |
| `/dashboard/funnels/[id]/edit` | `app/dashboard/funnels/[id]/edit/page.tsx` | Edit funnel |
| `/dashboard/funnels/[id]/analytics` | `app/dashboard/funnels/[id]/analytics/page.tsx` | Funnel analytics |

#### Leads Management
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/leads` | `app/dashboard/leads/page.tsx` | Leads list |
| `/dashboard/leads/upload` | `app/dashboard/leads/upload/page.tsx` | Upload leads |

#### Settings & Configuration
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | General settings |
| `/dashboard/settings` | `app/dashboard/settings/layout.tsx` | Settings layout |
| `/dashboard/settings/personas` | `app/dashboard/settings/personas/page.tsx` | Persona templates |
| `/dashboard/settings/brand-profile` | `app/dashboard/settings/brand-profile/page.tsx` | Brand profile |
| `/dashboard/api-keys` | `app/dashboard/api-keys/page.tsx` | API key management |
| `/dashboard/testing` | `app/dashboard/testing/page.tsx` | Testing tools |
| `/dashboard/marketplace` | `app/dashboard/marketplace/page.tsx` | Agent marketplace |
| `/dashboard/white-label` | `app/dashboard/white-label/page.tsx` | White label settings |
| `/dashboard/billing` | `app/dashboard/billing/page.tsx` | Billing & subscription |

#### Integrations
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/integrations/webhooks` | `app/dashboard/integrations/webhooks/page.tsx` | Webhook configuration |

#### Social Media
| Route | File | Purpose |
|-------|------|---------|
| `/social-media` | `app/social-media/page.tsx` | Social media dashboard |
| `/social-media/calendar` | `app/social-media/calendar/page.tsx` | Content calendar |
| `/social-media/post/[postId]` | `app/social-media/post/[postId]/page.tsx` | Post details |

### Admin Pages
| Route | File | Purpose |
|-------|------|---------|
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Admin dashboard |
| `/admin/users` | `app/admin/users/page.tsx` | User management |
| `/admin/system` | `app/admin/system/page.tsx` | System configuration |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Admin analytics |
| `/admin/billing` | `app/admin/billing/page.tsx` | Billing management |
| `/admin/content` | `app/admin/content/page.tsx` | Content management |
| `/admin/support` | `app/admin/support/page.tsx` | Support tickets |
| `/admin/audit` | `app/admin/audit/page.tsx` | Audit logs |

### API Routes (Backend)

#### Authentication
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `/api/auth/signup` | `app/api/auth/signup/route.ts` | User registration |

#### User API (User-scoped)
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/profile` | `app/api/user/profile/route.ts` | User profile |
| `/api/user/complete-onboarding` | `app/api/user/complete-onboarding/route.ts` | Complete onboarding |

##### User - Agents
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/agents` | `app/api/user/agents/route.ts` | List/create agents |
| `/api/user/agents/[id]` | `app/api/user/agents/[id]/route.ts` | Get/update/delete agent |
| `/api/user/agents/[id]/deploy` | `app/api/user/agents/[id]/deploy/route.ts` | Deploy agent |
| `/api/user/agents/[id]/undeploy` | `app/api/user/agents/[id]/undeploy/route.ts` | Undeploy agent |
| `/api/user/agents/[id]/livekit-info` | `app/api/user/agents/[id]/livekit-info/route.ts` | LiveKit connection info |

##### User - Phone Numbers
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/phone-numbers` | `app/api/user/phone-numbers/route.ts` | List phone numbers |
| `/api/user/phone-numbers/provision` | `app/api/user/phone-numbers/provision/route.ts` | Provision new number |
| `/api/user/phone-numbers/[phoneNumber]` | `app/api/user/phone-numbers/[phoneNumber]/route.ts` | Get/delete number |
| `/api/user/phone-numbers/[phoneNumber]/assign` | `app/api/user/phone-numbers/[phoneNumber]/assign/route.ts` | Assign to agent |
| `/api/user/phone-numbers/[phoneNumber]/unassign` | `app/api/user/phone-numbers/[phoneNumber]/unassign/route.ts` | Unassign from agent |

##### User - Calls
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/call-logs` | `app/api/user/call-logs/route.ts` | Get call logs |
| `/api/user/calls/test-outbound` | `app/api/user/calls/test-outbound/route.ts` | Test outbound call |

##### User - Stats
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/stats` | `app/api/user/stats/route.ts` | General stats |
| `/api/user/stats/calls` | `app/api/user/stats/calls/route.ts` | Call statistics |
| `/api/user/stats/cost` | `app/api/user/stats/cost/route.ts` | Cost analytics |

##### User - Personas
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/personas` | `app/api/user/personas/route.ts` | List/create personas |
| `/api/user/personas/[id]` | `app/api/user/personas/[id]/route.ts` | Get/update/delete persona |

##### User - Campaigns
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/campaigns` | `app/api/user/campaigns/route.ts` | List/create campaigns |
| `/api/user/campaigns/[id]` | `app/api/user/campaigns/[id]/route.ts` | Get/update/delete campaign |
| `/api/user/campaigns/[id]/schedule` | `app/api/user/campaigns/[id]/schedule/route.ts` | Schedule campaign |

##### User - Leads
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/leads` | `app/api/user/leads/route.ts` | List/create leads |
| `/api/user/leads/[id]` | `app/api/user/leads/[id]/route.ts` | Get/update/delete lead |

##### User - Brand Profile
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/user/brand-profile` | `app/api/user/brand-profile/route.ts` | Get/update brand profile |
| `/api/user/brand-profile/extract` | `app/api/user/brand-profile/extract/route.ts` | Extract brand from URL |

#### V1 API (Versioned)
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/v1/agents` | `app/api/v1/agents/route.ts` | Agent CRUD |
| `/api/v1/agents/[id]` | `app/api/v1/agents/[id]/route.ts` | Agent operations |
| `/api/v1/phone-numbers` | `app/api/v1/phone-numbers/route.ts` | Phone number CRUD |
| `/api/v1/calls` | `app/api/v1/calls/route.ts` | Call CRUD |
| `/api/v1/calls/[id]` | `app/api/v1/calls/[id]/route.ts` | Call operations |

#### Dashboard API
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/dashboard/metrics` | `app/api/dashboard/metrics/route.ts` | Dashboard metrics |
| `/api/dashboard/active-calls` | `app/api/dashboard/active-calls/route.ts` | Active calls list |
| `/api/dashboard/agent-performance` | `app/api/dashboard/agent-performance/route.ts` | Agent performance |

#### Webhooks
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/webhooks` | `app/api/webhooks/route.ts` | List/create webhooks |
| `/api/webhooks/events` | `app/api/webhooks/events/route.ts` | Webhook event types |
| `/api/webhooks/stats` | `app/api/webhooks/stats/route.ts` | Webhook statistics |
| `/api/webhooks/[id]` | `app/api/webhooks/[id]/route.ts` | Get/update/delete webhook |
| `/api/webhooks/[id]/test` | `app/api/webhooks/[id]/test/route.ts` | Test webhook |
| `/api/webhooks/[id]/deliveries` | `app/api/webhooks/[id]/deliveries/route.ts` | Delivery logs |

#### Live Listen (LiveKit)
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/live-listen/rooms` | `app/api/live-listen/rooms/route.ts` | List active rooms |
| `/api/live-listen/rooms/[roomName]/join` | `app/api/live-listen/rooms/[roomName]/join/route.ts` | Join room token |

#### Testing
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/testing/tts-preview` | `app/api/testing/tts-preview/route.ts` | TTS voice preview |
| `/api/testing/chat` | `app/api/testing/chat/route.ts` | Chat testing |
| `/api/testing/voice-call` | `app/api/testing/voice-call/route.ts` | Voice call testing |

#### Transcripts
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/transcripts/call/[callLogId]` | `app/api/transcripts/call/[callLogId]/route.ts` | Get call transcript |

#### Admin API
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/admin-api/users` | `app/api/admin-api/users/route.ts` | User management |
| `/api/admin-api/users/[userId]` | `app/api/admin-api/users/[userId]/route.ts` | User operations |
| `/api/test-admin` | `app/api/test-admin/route.ts` | Admin test endpoint |

#### Cron Jobs
| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/cron/trial-notifications` | `app/api/cron/trial-notifications/route.ts` | Trial expiry notifications |

---

## 🧩 Components Library

### UI Components (`components/ui/`)
**Purpose**: Base UI component library (shadcn/ui style)

| Component | File | Purpose |
|-----------|------|---------|
| `<Button>` | `button.tsx` | Button variants |
| `<Input>` | `input.tsx` | Text input |
| `<Textarea>` | `textarea.tsx` | Multi-line text |
| `<Select>` | `select.tsx` | Dropdown select |
| `<Checkbox>` | `checkbox.tsx` | Checkbox input |
| `<RadioGroup>` | `radio-group.tsx` | Radio buttons |
| `<Switch>` | `switch.tsx` | Toggle switch |
| `<Slider>` | `slider.tsx` | Range slider |
| `<Calendar>` | `calendar.tsx` | Date picker |
| `<Card>` | `card.tsx` | Card container |
| `<Dialog>` | `dialog.tsx` | Modal dialog |
| `<AlertDialog>` | `alert-dialog.tsx` | Alert/confirm dialog |
| `<Sheet>` | `sheet.tsx` | Side sheet/drawer |
| `<Drawer>` | `drawer.tsx` | Bottom drawer |
| `<Popover>` | `popover.tsx` | Popover overlay |
| `<Tooltip>` | `tooltip.tsx` | Tooltip hover |
| `<HoverCard>` | `hover-card.tsx` | Hover card info |
| `<ContextMenu>` | `context-menu.tsx` | Right-click menu |
| `<DropdownMenu>` | `dropdown-menu.tsx` | Dropdown menu |
| `<Menubar>` | `menubar.tsx` | Menu bar |
| `<NavigationMenu>` | `navigation-menu.tsx` | Navigation menu |
| `<Tabs>` | `tabs.tsx` | Tab navigation |
| `<Accordion>` | `accordion.tsx` | Expandable sections |
| `<Collapsible>` | `collapsible.tsx` | Collapsible content |
| `<Table>` | `table.tsx` | Data table |
| `<Badge>` | `badge.tsx` | Label badge |
| `<Alert>` | `alert.tsx` | Alert message |
| `<Separator>` | `separator.tsx` | Divider line |
| `<Avatar>` | `avatar.tsx` | User avatar |
| `<Skeleton>` | `skeleton.tsx` | Loading placeholder |
| `<Progress>` | `progress.tsx` | Progress bar |
| `<ScrollArea>` | `scroll-area.tsx` | Scrollable area |
| `<Carousel>` | `carousel.tsx` | Image carousel |
| `<AspectRatio>` | `aspect-ratio.tsx` | Aspect ratio container |
| `<Resizable>` | `resizable.tsx` | Resizable panels |
| `<Breadcrumb>` | `breadcrumb.tsx` | Breadcrumb nav |
| `<Pagination>` | `pagination.tsx` | Page navigation |
| `<InputOtp>` | `input-otp.tsx` | OTP input |
| `<Toggle>` | `toggle.tsx` | Toggle button |
| `<ToggleGroup>` | `toggle-group.tsx` | Toggle group |
| `<Label>` | `label.tsx` | Form label |
| `<Form>` | `form.tsx` | Form wrapper |

**Custom UI Components**:
| Component | File | Purpose |
|-----------|------|---------|
| `<ErrorBoundary>` | `error-boundary.tsx` | Error catching boundary |
| `<EmptyState>` | `empty-state.tsx` | Zero data state |
| `<LoadingButton>` | `loading-button.tsx` | Async button with spinner |
| `<ConfirmationDialog>` | `confirmation-dialog.tsx` | Delete confirmation |
| `<Sidebar>` | `sidebar.tsx` | Application sidebar |
| `<Chart>` | `chart.tsx` | Recharts wrapper |
| `<Sonner>` | `sonner.tsx` | Toast notifications |
| `<BotAvatar>` | `bot-avatar.tsx` | Bot avatar component |
| `<VoiceWaveform>` | `voice-waveform.tsx` | Audio waveform |
| `<OnboardingWizard>` | `onboarding-wizard.tsx` | Onboarding flow |
| `<Command>` | `command.tsx` | Command palette |

### Primitives (`components/primitives/`)
**Purpose**: Shared UI primitives and utilities

| Component | File | Purpose |
|-----------|------|---------|
| `<MetricCard>` | `MetricCard.tsx` | Metric display card |
| `<MetricStat>` | `MetricStat.tsx` | Stat number display |
| `<StatusBadge>` | `StatusBadge.tsx` | Status indicator |
| `<EmptyState>` | `EmptyState.tsx` | Empty state with CTA |
| `<LoadingState>` | `LoadingState.tsx` | Loading skeleton |
| `<Waveform>` | `Waveform.tsx` | Audio waveform viz |
| `<Copyable>` | `Copyable.tsx` | Copy-to-clipboard |

### Layout Components (`components/layout/`)
**Purpose**: Layout and structure components

| Component | File | Purpose |
|-----------|------|---------|
| `<PageHeader>` | `PageHeader.tsx` | Page header with breadcrumbs |
| `<Toolbar>` | `Toolbar.tsx` | Action toolbar |
| `<InspectorDrawer>` | `InspectorDrawer.tsx` | Side inspector panel |

### Dashboard Components (`components/dashboard/`)
**Purpose**: Dashboard-specific widgets

| Component | File | Purpose |
|-----------|------|---------|
| `<StatCard>` | `stat-card.tsx` | Dashboard stat card |
| `<RecentCalls>` | `recent-calls.tsx` | Recent calls widget |

### Agent Components (`components/agents/`)
**Purpose**: Agent management UI

| Component | File | Purpose |
|-----------|------|---------|
| `<AgentCard>` | `AgentCard.tsx` | Agent card display |
| `<AgentListItem>` | `agent-list-item.tsx` | Agent list item |
| `<AgentGrid>` | `AgentGrid.tsx` | Agent grid layout |
| `<AgentInspector>` | `AgentInspector.tsx` | Agent detail inspector |
| `<AgentInsightCard>` | `AgentInsightCard.tsx` | Agent insights |
| `<MetricBox>` | `MetricBox.tsx` | Agent metrics |

**Agent Wizard Components**:
| Component | File | Purpose |
|-----------|------|---------|
| `<AgentWizardStep1>` | `agent-wizard-step1.tsx` | Step 1: Basic info |
| `<AgentWizardStep1Simple>` | `agent-wizard-step1-simple.tsx` | Step 1: Simplified |
| `<AgentWizardStep2>` | `agent-wizard-step2.tsx` | Step 2: Configuration |
| `<AgentWizardStep2Simple>` | `agent-wizard-step2-simple.tsx` | Step 2: Simplified |
| `<AgentWizardStep3>` | `agent-wizard-step3.tsx` | Step 3: Advanced |
| `<AgentWizardStep4>` | `agent-wizard-step4.tsx` | Step 4: Review |
| `<WizardStep1Type>` | `wizard-step1-type.tsx` | Agent type selection |
| `<WizardStep2Persona>` | `wizard-step2-persona.tsx` | Persona configuration |
| `<WizardStep3Config>` | `wizard-step3-config.tsx` | Technical config |
| `<WizardStep3Social>` | `wizard-step3-social.tsx` | Social media config |

### Phone Number Components (`components/phone-numbers/`)
**Purpose**: Phone number management

| Component | File | Purpose |
|-----------|------|---------|
| `<NumberListItem>` | `number-list-item.tsx` | Phone number item |
| `<ProvisionModal>` | `provision-modal.tsx` | Provision phone modal |
| `<SimpleProvisionModal>` | `simple-provision-modal.tsx` | Simplified provision |
| `<AssignModal>` | `assign-modal.tsx` | Assign to agent modal |
| `<TestCallModal>` | `test-call-modal.tsx` | Test call modal |
| `<SipConfigTab>` | `sip-config-tab.tsx` | SIP configuration |

### Call Components (`components/calls/`)
**Purpose**: Call history and transcript UI

| Component | File | Purpose |
|-----------|------|---------|
| `<CallTranscriptPanel>` | `CallTranscriptPanel.tsx` | Transcript viewer panel |
| `<CallTranscriptCard>` | `CallTranscriptCard.tsx` | Transcript card |
| `<CallTranscriptViewer>` | `CallTranscriptViewer.tsx` | Full transcript view |
| `<CallCostBreakdown>` | `CallCostBreakdown.tsx` | Cost breakdown |
| `<CallOutcomeCard>` | `CallOutcomeCard.tsx` | Call outcome display |

### Campaign Components (`components/campaigns/`)
**Purpose**: Campaign management

| Component | File | Purpose |
|-----------|------|---------|
| `<CampaignROIWidget>` | `CampaignROIWidget.tsx` | ROI metrics widget |

### Persona Components (`components/personas/`)
**Purpose**: Persona templates

| Component | File | Purpose |
|-----------|------|---------|
| `<PersonaCard>` | `persona-card.tsx` | Persona card |
| `<PersonaFormModal>` | `persona-form-modal.tsx` | Create/edit persona |
| `<TemplateGalleryModal>` | `template-gallery-modal.tsx` | Template gallery |

### Webhook Components (`components/webhooks/`)
**Purpose**: Webhook configuration

| Component | File | Purpose |
|-----------|------|---------|
| `<WebhookList>` | `webhook-list.tsx` | Webhook list |
| `<WebhookModal>` | `webhook-modal.tsx` | Create/edit webhook |
| `<DeliveryLogsModal>` | `delivery-logs-modal.tsx` | Delivery logs view |

### Testing Components (`components/testing/`)
**Purpose**: Testing tools

| Component | File | Purpose |
|-----------|------|---------|
| `<OutboundCallTester>` | `outbound-call-tester.tsx` | Outbound call testing |
| `<CallSimulator>` | `call-simulator.tsx` | Call simulation |

### Live Listen Components (`components/live-listen/`)
**Purpose**: Live call monitoring

| Component | File | Purpose |
|-----------|------|---------|
| `<AudioPlayer>` | `AudioPlayer.tsx` | Audio playback |

### Billing Components (`components/billing/`)
**Purpose**: Billing and subscription

| Component | File | Purpose |
|-----------|------|---------|
| `<UpgradeButton>` | `UpgradeButton.tsx` | Upgrade subscription |
| `<ManageSubscriptionButton>` | `ManageSubscriptionButton.tsx` | Manage subscription |
| `<UsageCard>` | `UsageCard.tsx` | Usage metrics |

### White Label Components (`components/white-label/`)
**Purpose**: White label configuration

| Component | File | Purpose |
|-----------|------|---------|
| `<BrandingSettings>` | `BrandingSettings.tsx` | Branding config |
| `<CustomDomainSettings>` | `CustomDomainSettings.tsx` | Domain config |
| `<APIKeyManager>` | `APIKeyManager.tsx` | API key management |
| `<EmbedCodeGenerator>` | `EmbedCodeGenerator.tsx` | Embed code gen |
| `<UsageAnalytics>` | `UsageAnalytics.tsx` | Usage analytics |

### Brand Components (`components/brand/`)
**Purpose**: Brand profile

| Component | File | Purpose |
|-----------|------|---------|
| `<BrandExtractionModal>` | `BrandExtractionModal.tsx` | Extract brand from URL |

### Form Components (`components/form/`)
**Purpose**: Form utilities

| Component | File | Purpose |
|-----------|------|---------|
| `<FormField>` | `FormField.tsx` | Reusable form field |
| `<AutoTextarea>` | `AutoTextarea.tsx` | Auto-resizing textarea |

### Page Components (`components/pages/`)
**Purpose**: Full page implementations (alternative to app/ pages)

| Component | File | Purpose |
|-----------|------|---------|
| `<DashboardPage>` | `DashboardPage.tsx` | Dashboard |
| `<AgentsPage>` | `AgentsPage.tsx` | Agents list |
| `<PhoneNumbersPage>` | `PhoneNumbersPage.tsx` | Phone numbers |
| `<CallsPage>` | `CallsPage.tsx` | Call history |
| `<CallDetailPage>` | `CallDetailPage.tsx` | Call detail |
| `<CampaignsPage>` | `CampaignsPage.tsx` | Campaigns list |
| `<CampaignDetailPage>` | `CampaignDetailPage.tsx` | Campaign detail |
| `<FunnelsPage>` | `FunnelsPage.tsx` | Funnels list |
| `<FunnelDetailPage>` | `FunnelDetailPage.tsx` | Funnel detail |
| `<LeadsPage>` | `LeadsPage.tsx` | Leads management |
| `<AnalyticsPage>` | `AnalyticsPage.tsx` | Analytics |
| `<SettingsPage>` | `SettingsPage.tsx` | Settings |
| `<PersonasPage>` | `PersonasPage.tsx` | Personas |
| `<WebhooksPage>` | `WebhooksPage.tsx` | Webhooks |
| `<ApiKeysPage>` | `ApiKeysPage.tsx` | API keys |
| `<TestingPage>` | `TestingPage.tsx` | Testing tools |
| `<MarketplacePage>` | `MarketplacePage.tsx` | Marketplace |
| `<WhiteLabelPage>` | `WhiteLabelPage.tsx` | White label |
| `<BillingPage>` | `BillingPage.tsx` | Billing |
| `<LiveCallsPage>` | `LiveCallsPage.tsx` | Live calls |
| `<SocialMediaPage>` | `SocialMediaPage.tsx` | Social media |
| `<SocialMediaCalendarPage>` | `SocialMediaCalendarPage.tsx` | Content calendar |
| `<SocialPostDetailPage>` | `SocialPostDetailPage.tsx` | Post detail |

**Admin Pages** (`components/pages/admin/`):
| Component | File | Purpose |
|-----------|------|---------|
| `<AdminDashboardPage>` | `AdminDashboardPage.tsx` | Admin dashboard |
| `<AdminUsersPage>` | `AdminUsersPage.tsx` | User management |
| `<AdminSystemPage>` | `AdminSystemPage.tsx` | System config |
| `<AdminAnalyticsPage>` | `AdminAnalyticsPage.tsx` | Analytics |
| `<AdminBillingPage>` | `AdminBillingPage.tsx` | Billing |
| `<AdminContentPage>` | `AdminContentPage.tsx` | Content |
| `<AdminSupportPage>` | `AdminSupportPage.tsx` | Support |
| `<AdminAuditLogsPage>` | `AdminAuditLogsPage.tsx` | Audit logs |

### Root-Level Components

| Component | File | Purpose |
|-----------|------|---------|
| `<AppLayout>` | `AppLayout.tsx` | Main app layout |
| `<LayoutWrapper>` | `LayoutWrapper.tsx` | Layout wrapper |
| `<AdminLayout>` | `AdminLayout.tsx` | Admin layout |
| `<Sidebar>` | `Sidebar.tsx` | App sidebar |
| `<ThemeProvider>` | `ThemeProvider.tsx` | Theme context |
| `<AuthPage>` | `AuthPage.tsx` | Auth page template |
| `<ProtectedRoute>` | `ProtectedRoute.tsx` | Auth guard |
| `<ErrorBoundary>` | `ErrorBoundary.tsx` | Error boundary |
| `<LandingPage>` | `LandingPage.tsx` | Landing page |
| `<TrialBanner>` | `TrialBanner.tsx` | Trial expiry banner |
| `<BalanceWidget>` | `BalanceWidget.tsx` | Account balance |
| `<CreateAgentDialog>` | `CreateAgentDialog.tsx` | Quick create agent |
| `<EditAgentDialog>` | `EditAgentDialog.tsx` | Quick edit agent |
| `<AgentDetailDialog>` | `AgentDetailDialog.tsx` | Agent detail modal |
| `<CreateFunnelWizard>` | `CreateFunnelWizard.tsx` | Funnel wizard |
| `<EditFunnelWizard>` | `EditFunnelWizard.tsx` | Edit funnel |
| `<CreateSocialPostWizard>` | `CreateSocialPostWizard.tsx` | Social post wizard |
| `<LeadDetailModal>` | `LeadDetailModal.tsx` | Lead detail |
| `<ConfirmDialog>` | `ConfirmDialog.tsx` | Confirmation dialog |
| `<ABTestingModal>` | `ABTestingModal.tsx` | A/B testing |
| `<BulkSchedulerModal>` | `BulkSchedulerModal.tsx` | Bulk scheduler |
| `<SocialTemplatesModal>` | `SocialTemplatesModal.tsx` | Social templates |
| `<ExportModal>` | `ExportModal.tsx` | Data export |

### Figma Components (`components/figma/`)
**Purpose**: Figma integration

| Component | File | Purpose |
|-----------|------|---------|
| `<ImageWithFallback>` | `ImageWithFallback.tsx` | Image with fallback |

---

## 📚 Library Utilities

### Core Utilities (`lib/`)

| File | Purpose | Key Exports |
|------|---------|-------------|
| `prisma.ts` | Prisma client singleton | `prisma` |
| `auth.ts` | NextAuth configuration | `authOptions`, `getServerSession` |
| `api.ts` | Backend API client | `api` |
| `api-client.ts` | Frontend API client | `apiClient` |
| `utils.ts` | General utilities | `cn`, `formatDate`, etc. |
| `livekit.ts` | LiveKit integration | `createToken` |
| `stripe.ts` | Stripe integration | `stripe` |
| `billing.ts` | Billing utilities | Subscription helpers |
| `email.ts` | Email utilities | `sendEmail` |
| `admin.ts` | Admin utilities | Admin helpers |
| `api-keys.ts` | API key management | Key generation |
| `agent-templates.ts` | Agent templates | Template library |
| `types.ts` | Shared types | Type definitions |
| `auth-context.tsx` | Auth React context | `AuthProvider` |
| `flask-auth.tsx` | Flask auth bridge | Flask session |

### Custom Hooks (`lib/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useAgents` | `use-agents.ts` | Fetch and manage agents |
| `usePhoneNumbers` | `use-phone-numbers.ts` | Fetch phone numbers |
| `useCallLogs` | `use-call-logs.ts` | Fetch call history |
| `useStats` | `use-stats.ts` | Dashboard statistics |
| `useAnalytics` | `use-analytics.ts` | Analytics data |
| `useProfile` | `use-profile.ts` | User profile |
| `usePersonas` | `use-personas.ts` | Persona templates |
| `useWebhooks` | `use-webhooks.ts` | Webhook management |
| `useBrandProfile` | `use-brand-profile.ts` | Brand profile |

### Additional Hooks (`hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useCallTranscript` | `useCallTranscript.ts` | Call transcript fetching |

### Validation Schemas (`lib/schemas/`)

| Schema | File | Purpose |
|--------|------|---------|
| `agentCreateSchema` | `agent-schema.ts` | Agent creation validation |
| `agentCreateSchemaSimple` | `agent-schema-simple.ts` | Simplified agent form |
| `agentCreateSchemaVisual` | `agent-schema-visual.ts` | Visual agent builder |
| `phoneProvisionSchema` | `phone-schema.ts` | Phone provisioning |
| `profileUpdateSchema` | `settings-schema.ts` | Settings update |
| `personaSchema` | `persona-schema.ts` | Persona validation |
| `brandProfileSchema` | `brand-profile-schema.ts` | Brand profile |

---

## 🎯 Type Definitions

### Core Types (`types/`)

| Type | File | Purpose |
|------|------|---------|
| `Agent` | `agent.ts` | Agent entity and config |
| `PhoneNumber` | `phone-number.ts` | Phone number entity |
| `CallLog` | `call-log.ts` | Call record |
| `CallTranscript` | `call-transcript.ts` | Transcript data |
| `CallOutcome` | `call-outcome.ts` | Call outcome/result |
| `User` | `user.ts` | User entity |
| `Persona` | `persona.ts` | Persona template |
| `BrandProfile` | `brand-profile.ts` | Brand profile |
| `Webhook` | `webhook.ts` | Webhook configuration |
| `Stats` | `stats.ts` | Dashboard statistics |
| `ApiResponse` | `api-response.ts` | API response types |

---

## ⚙️ Configuration Files

### Build & Framework Config

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript compiler config |
| `eslint.config.mjs` | ESLint rules |
| `tailwind.config.js` | Tailwind CSS config |
| `postcss.config.mjs` | PostCSS plugins |
| `playwright.config.ts` | Playwright E2E test config |
| `prisma.config.ts` | Prisma configuration |

### Application Config

| File | Purpose |
|------|---------|
| `middleware.ts` | Next.js middleware (auth) |
| `auth.ts` | NextAuth configuration |
| `.env` | Environment variables |
| `.env.local` | Local environment overrides |

### Package Management

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `package-lock.json` | Locked dependency tree |

### Other Config

| File | Purpose |
|------|---------|
| `.mcp.json` | MCP server configuration |
| `.gitignore` | Git ignore patterns |

---

## 🧪 Testing

### E2E Tests (`e2e/`)

| Test Suite | File | Purpose |
|-----------|------|---------|
| Navigation | `navigation.spec.ts` | Navigation flows |
| Agents | `agents.spec.ts` | Agent management |
| Voice Chat | `voice-chat.spec.ts` | Voice interactions |

**Test Configuration**: `playwright.config.ts`
- **Browser**: Chromium (primary)
- **Base URL**: http://localhost:3001
- **Parallel**: Yes
- **Retries**: 2 on CI

---

## 📖 Documentation

### User-Facing Docs

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICK_REFERENCE.md` | Developer quick reference |
| `NEXT_STEPS.md` | QA/testing roadmap |

### Technical Docs

| File | Purpose |
|------|---------|
| `MIGRATION_REPAIR_PLAN.md` | Migration and repair guide |
| `MIGRATION_COMPLETE.md` | Migration completion notes |
| `MODERNIZATION_SUMMARY.md` | Architecture updates |
| `PRODUCTION_DIAGNOSIS.md` | Production issues |
| `HEROUI_SELECT_FIX_DOCUMENTATION.md` | HeroUI Select fix |

### Component Docs

| File | Location | Purpose |
|------|----------|---------|
| `README.md` | `components/layout/` | Layout components |
| `README.md` | `components/primitives/` | Primitives guide |
| `README.md` | `e2e/` | E2E testing guide |
| Various `.md` | `components/calls/` | Transcript UI docs |

---

## 🗺️ Quick Navigation

### By Feature Area

**User Management**:
- Routes: `/dashboard/settings`, `/api/user/profile`
- Components: `<ProtectedRoute>`, `<AuthPage>`
- Types: `types/user.ts`

**Agent Management**:
- Routes: `/dashboard/agents/*`, `/api/user/agents/*`
- Components: `components/agents/*`
- Hooks: `lib/hooks/use-agents.ts`
- Types: `types/agent.ts`
- Schemas: `lib/schemas/agent-schema.ts`

**Phone Numbers**:
- Routes: `/dashboard/phone-numbers`, `/api/user/phone-numbers/*`
- Components: `components/phone-numbers/*`
- Hooks: `lib/hooks/use-phone-numbers.ts`
- Types: `types/phone-number.ts`
- Schemas: `lib/schemas/phone-schema.ts`

**Call History**:
- Routes: `/dashboard/calls/*`, `/api/user/call-logs`
- Components: `components/calls/*`
- Hooks: `lib/hooks/use-call-logs.ts`, `hooks/useCallTranscript.ts`
- Types: `types/call-log.ts`, `types/call-transcript.ts`

**Analytics**:
- Routes: `/dashboard/analytics`, `/api/user/stats/*`
- Components: `components/dashboard/*`
- Hooks: `lib/hooks/use-analytics.ts`, `lib/hooks/use-stats.ts`
- Types: `types/stats.ts`

**Campaigns**:
- Routes: `/dashboard/campaigns/*`, `/api/user/campaigns/*`
- Components: `components/campaigns/*`

**Webhooks**:
- Routes: `/dashboard/integrations/webhooks`, `/api/webhooks/*`
- Components: `components/webhooks/*`
- Hooks: `lib/hooks/use-webhooks.ts`
- Types: `types/webhook.ts`

**Billing**:
- Routes: `/dashboard/billing`, `/api/user/billing/*`
- Components: `components/billing/*`
- Lib: `lib/stripe.ts`, `lib/billing.ts`

**Admin**:
- Routes: `/admin/*`, `/api/admin-api/*`
- Components: `components/pages/admin/*`, `<AdminLayout>`
- Lib: `lib/admin.ts`

### By Technology

**Next.js**:
- App Router: `app/`
- Middleware: `middleware.ts`
- Config: `next.config.ts`

**React**:
- Components: `components/`
- Hooks: `lib/hooks/`, `hooks/`
- Context: `lib/auth-context.tsx`

**TypeScript**:
- Types: `types/`
- Config: `tsconfig.json`

**Prisma**:
- Schema: `prisma/schema.prisma`
- Client: `lib/prisma.ts`
- Config: `prisma.config.ts`

**Tailwind CSS**:
- Config: `tailwind.config.js`
- Global Styles: `app/globals.css`
- Components: `components/ui/`

**Authentication**:
- NextAuth: `auth.ts`, `app/api/auth/[...nextauth]/`
- Middleware: `middleware.ts`
- Hooks: `lib/auth-context.tsx`

**Testing**:
- E2E: `e2e/`
- Config: `playwright.config.ts`

**LiveKit**:
- Integration: `lib/livekit.ts`
- API: `app/api/live-listen/`
- Components: `components/live-listen/`

**Stripe**:
- Integration: `lib/stripe.ts`
- Billing: `lib/billing.ts`
- Components: `components/billing/`

---

## 📊 Statistics Summary

### Codebase Metrics

- **Total Routes**: 150+ (pages + API endpoints)
- **React Components**: 150+
- **Custom Hooks**: 10+
- **Type Definitions**: 11 core types
- **Validation Schemas**: 6 schemas
- **API Endpoints**: 60+ backend routes
- **Test Suites**: 4 E2E test files

### File Counts by Directory

| Directory | Files | Purpose |
|-----------|-------|---------|
| `app/` | 150+ | Pages and API routes |
| `components/` | 150+ | React components |
| `lib/` | 20+ | Utilities and hooks |
| `types/` | 11 | Type definitions |
| `e2e/` | 4 | E2E tests |

### Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5.9.3
- **UI Library**: HeroUI 2.8.5 + Radix UI
- **Styling**: Tailwind CSS 4.1.16
- **Database**: PostgreSQL (via Prisma 6.18.0)
- **Auth**: NextAuth 5.0.0-beta.29
- **Testing**: Playwright 1.56.1
- **Runtime**: React 18.3.1

---

## 🔍 Search Tips

### Find by Feature
Use the feature area sections above to quickly locate all files related to a specific feature.

### Find by File Type
- **Pages**: Search in `app/`
- **Components**: Search in `components/`
- **API Routes**: Search in `app/api/`
- **Hooks**: Search in `lib/hooks/` or `hooks/`
- **Types**: Search in `types/`
- **Schemas**: Search in `lib/schemas/`
- **Utils**: Search in `lib/`

### Find by Pattern
- **Agent-related**: Search for "agent" in filenames
- **Phone-related**: Search for "phone" in filenames
- **Call-related**: Search for "call" in filenames
- **Auth-related**: Search for "auth" in filenames
- **Admin-related**: Search for "admin" in filenames

---

## 📝 Notes

### Naming Conventions
- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **API Routes**: `route.ts`
- **Components**: PascalCase (e.g., `AgentCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAgents.ts`)
- **Types**: PascalCase (e.g., `Agent`, `PhoneNumber`)
- **Utilities**: kebab-case (e.g., `api-client.ts`)

### Component Patterns
- **UI Components**: Shadcn/ui style with Radix UI primitives
- **Feature Components**: Domain-specific, organized by feature
- **Page Components**: Full page implementations
- **Layout Components**: Structural and navigation

### API Patterns
- **User-scoped**: `/api/user/*` (requires authentication)
- **Versioned**: `/api/v1/*` (versioned API)
- **Dashboard**: `/api/dashboard/*` (dashboard metrics)
- **Admin**: `/api/admin-api/*` (admin operations)
- **Webhooks**: `/api/webhooks/*` (webhook management)

---

**END OF PROJECT INDEX**

Last Updated: 2025-11-05
Generated for: `/opt/livekit1/frontend`
Version: 1.0.0
