# Landing Pages Implementation Plan

**Generated:** November 8, 2025
**Priority:** URGENT - Needed THIS WEEK for $5K/mo ad campaign launch
**Deliverable:** Two conversion-optimized landing pages for AI.EPIC.DM

---

## 🎯 Overview

### Why These Pages Are Critical

**Business Impact:**
- Unblocks $5K/mo ad spend (currently waiting)
- Projected 470 leads/month → 113 demos/month
- Two distinct funnels: SMB direct ($300-500/mo) + White-label partners ($5K-50K/mo)

**Timeline:** 1-2 days with AI assistance

---

## 📋 Two Landing Pages Required

### Page 1: `/ai-receptionist` (SMB Direct Sales)

**Target Audience:** Small-medium businesses (dental, legal, real estate, home services)
**Goal:** Book demo → Close $300-500/mo subscription
**Traffic Source:** Google/Facebook ads targeting SMBs

**Key Messaging:**
- "Never miss another lead while you're busy with clients"
- "AI receptionist that books appointments 24/7"
- "Setup in 5 minutes, no tech skills required"

---

### Page 2: `/partners` (White-Label Program)

**Target Audience:** Digital agencies, MSPs, consultants
**Goal:** Book partnership call → Close $5K-50K/mo white-label deal
**Traffic Source:** LinkedIn ads targeting agencies

**Key Messaging:**
- "White-label AI voice platform for your agency"
- "Sell AI automation without building infrastructure"
- "$5K-50K/mo recurring revenue opportunity"

---

## 🏗️ File Structure

```
/opt/livekit1/frontend/
├── app/
│   ├── ai-receptionist/
│   │   └── page.tsx                 # SMB landing page
│   ├── partners/
│   │   └── page.tsx                 # White-label landing page
│   └── api/
│       └── contact/
│           └── route.ts             # Contact form API route
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx                 # Reusable hero section
│   │   ├── ProblemSolution.tsx      # Problem/solution framework
│   │   ├── PricingTable.tsx         # Pricing cards
│   │   ├── SocialProof.tsx          # Testimonials/logos
│   │   ├── DemoBookingCTA.tsx       # Calendly embed
│   │   ├── PartnerCalculator.tsx    # ROI calculator for partners
│   │   ├── Features.tsx             # Feature grid
│   │   └── FAQ.tsx                  # FAQ accordion
│   │
│   └── ui/
│       └── (existing shadcn components)
│
└── lib/
    └── calendly.ts                  # Calendly integration helper
```

---

## 📐 Design System Alignment

### Use Existing Design Tokens

**Colors** (from globals.css):
- Primary: Blue (`bg-blue-600`, `text-blue-600`)
- Success: Green (`bg-green-600`)
- Neutral: Slate (`bg-slate-900`, `text-slate-600`)

**Typography:**
- Headings: `font-bold tracking-tight`
- Body: `font-normal text-slate-600 dark:text-slate-400`

**Glassmorphism:**
```tsx
className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800"
```

**Animations:**
```tsx
className="animate-slide-up-fade-in"
style={{ animationDelay: `${index * 100}ms` }}
```

**Grid Pattern Background:**
```tsx
className="bg-grid-pattern"
```

---

## 📄 Page 1: `/ai-receptionist/page.tsx`

### Section Breakdown

#### 1. Hero Section
```tsx
<Hero
  title="Never Miss a Lead Again"
  subtitle="AI receptionist that answers calls, qualifies leads, and books appointments 24/7"
  primaryCTA="Book a Demo"
  secondaryCTA="Watch Demo Video"
  videoEmbed="https://www.youtube.com/embed/..."
  backgroundPattern="grid"
/>
```

**Content:**
- H1: "Never Miss a Lead Again"
- Subhead: "AI receptionist that answers calls, qualifies leads, and books appointments 24/7 — even when you're busy with clients"
- Primary CTA: "Book a Demo" (opens Calendly)
- Secondary CTA: "Watch 2-Min Demo" (video modal)
- Visual: Dashboard screenshot or demo video embed

---

#### 2. Problem/Solution Section
```tsx
<ProblemSolution
  problems={[
    { icon: PhoneOff, text: "Missing calls = lost revenue" },
    { icon: Clock, text: "No time for follow-up calls" },
    { icon: TrendingDown, text: "Leads going cold overnight" }
  ]}
  solutions={[
    { icon: Phone, text: "Answer every call instantly" },
    { icon: Calendar, text: "Book appointments automatically" },
    { icon: TrendingUp, text: "Follow up within seconds" }
  ]}
/>
```

**Copy:**
- **Problem:** "Your phone rings. You're with a client. The caller hangs up. Another lost lead."
- **Solution:** "AI.EPIC.DM answers instantly, qualifies the lead, books them on your calendar, and sends you a summary — all while you're focused on the client in front of you."

---

#### 3. Features Grid
```tsx
<Features
  title="Everything You Need to Convert More Leads"
  features={[
    {
      icon: Mic,
      title: "Natural Voice Conversations",
      description: "Sounds human, not robotic. Handles questions, objections, pricing."
    },
    {
      icon: Calendar,
      title: "Instant Appointment Booking",
      description: "Syncs with your calendar. Books qualified leads immediately."
    },
    {
      icon: Filter,
      title: "Smart Lead Qualification",
      description: "Asks the right questions. Only books quality appointments."
    },
    {
      icon: MessageSquare,
      title: "SMS Follow-Up",
      description: "Sends confirmations, reminders, and follow-ups automatically."
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "See every call, listen to recordings, track conversion rates."
    },
    {
      icon: Zap,
      title: "Setup in 5 Minutes",
      description: "No coding. No complex setup. Works with your existing phone system."
    }
  ]}
/>
```

---

#### 4. Social Proof Section
```tsx
<SocialProof
  testimonials={[
    {
      quote: "We went from missing 40% of calls to answering 100%. Booked appointments increased 3x.",
      author: "Sarah Chen",
      role: "Owner, Bright Smile Dental",
      avatar: "/testimonials/sarah.jpg"
    },
    {
      quote: "Our AI receptionist books 15-20 appointments per week. ROI paid for itself in week one.",
      author: "Marcus Johnson",
      role: "Partner, Johnson & Associates Law",
      avatar: "/testimonials/marcus.jpg"
    }
  ]}
  trustedBy={[
    { logo: "/logos/dental.svg", name: "Dental practices" },
    { logo: "/logos/legal.svg", name: "Law firms" },
    { logo: "/logos/realestate.svg", name: "Real estate agencies" }
  ]}
/>
```

---

#### 5. Pricing Table
```tsx
<PricingTable
  tiers={[
    {
      name: "Starter",
      price: "$297",
      period: "/month",
      description: "Perfect for solo practitioners",
      features: [
        "100 calls/month included",
        "Unlimited appointment booking",
        "Call recordings & transcripts",
        "SMS follow-up",
        "Basic analytics"
      ],
      cta: "Start Free Trial",
      highlighted: false
    },
    {
      name: "Professional",
      price: "$497",
      period: "/month",
      description: "For growing practices",
      features: [
        "300 calls/month included",
        "Everything in Starter, plus:",
        "Multi-location support",
        "Custom voice persona",
        "Advanced analytics",
        "Priority support"
      ],
      cta: "Book a Demo",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For multi-location businesses",
      features: [
        "Unlimited calls",
        "Everything in Professional, plus:",
        "Dedicated account manager",
        "Custom integrations",
        "White-glove onboarding",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ]}
/>
```

---

#### 6. FAQ Section
```tsx
<FAQ
  questions={[
    {
      q: "Does it sound robotic?",
      a: "Not at all. Our AI uses advanced voice technology that sounds natural and human. Most callers don't realize they're speaking with AI."
    },
    {
      q: "How long does setup take?",
      a: "About 5 minutes. Connect your phone number, set your availability, and you're live. No technical skills required."
    },
    {
      q: "What if the AI can't answer a question?",
      a: "It gracefully transfers to you or takes a message. You're always in control."
    },
    {
      q: "Can I customize what the AI says?",
      a: "Absolutely. You control the script, pricing info, qualifying questions — everything."
    },
    {
      q: "What's included in the trial?",
      a: "Full access to all features for 14 days. No credit card required. Cancel anytime."
    }
  ]}
/>
```

---

#### 7. Final CTA
```tsx
<DemoBookingCTA
  title="Ready to Stop Missing Leads?"
  subtitle="Book a 15-minute demo and see how AI.EPIC.DM can help you answer every call and book more appointments."
  ctaText="Book Your Demo Now"
  calendlyUrl="https://calendly.com/ai-epic-dm/smb-demo"
  trustSignals={[
    "✓ Setup in 5 minutes",
    "✓ 14-day free trial",
    "✓ No credit card required"
  ]}
/>
```

---

## 📄 Page 2: `/partners/page.tsx`

### Section Breakdown

#### 1. Hero Section
```tsx
<Hero
  title="White-Label AI Voice Platform for Agencies"
  subtitle="Offer enterprise AI automation to your clients without building the infrastructure"
  primaryCTA="Apply for Partnership"
  secondaryCTA="Download Partner Kit"
  backgroundPattern="grid"
/>
```

**Content:**
- H1: "White-Label AI Voice Platform for Agencies"
- Subhead: "Sell AI voice agents, autonomous campaigns, and full-funnel automation to your clients — fully branded as your own"
- Primary CTA: "Apply for Partnership"
- Secondary CTA: "Download Partner Kit" (PDF with economics, case studies)

---

#### 2. Partner Value Proposition
```tsx
<ProblemSolution
  problems={[
    { icon: DollarSign, text: "Clients demanding AI, but you don't have the tech" },
    { icon: Code, text: "Building voice AI infrastructure costs $500K+" },
    { icon: Users, text: "Can't scale fulfillment without hiring" }
  ]}
  solutions={[
    { icon: Rocket, text: "Launch AI services in days, not years" },
    { icon: Building2, text: "Full white-label platform included" },
    { icon: TrendingUp, text: "Recurring revenue without delivery costs" }
  ]}
/>
```

---

#### 3. Partner Economics Calculator
```tsx
<PartnerCalculator
  defaultClients={10}
  defaultPricePerClient={997}
  partnerMargin={0.70}
  calculatorTitle="Your Revenue Opportunity"
  calculatorSubtitle="See what you could earn as an AI.EPIC.DM partner"
/>
```

**Interactive Calculator:**
- Input: Number of clients
- Input: Price per client/month (slider $297-$2,997)
- Auto-calculate:
  - Monthly Recurring Revenue
  - Annual Revenue
  - Your Profit Margin (70%)
  - Your Monthly Profit

**Example Output:**
```
10 clients × $997/mo = $9,970 MRR
70% margin = $6,979/mo profit ($83,748/year)
```

---

#### 4. What's Included
```tsx
<Features
  title="Everything You Need to Launch AI Services"
  layout="detailed"
  features={[
    {
      icon: Palette,
      title: "Full White-Label Platform",
      description: "Your logo, your domain, your branding. Clients never see AI.EPIC.DM."
    },
    {
      icon: Headset,
      title: "AI Voice Agents",
      description: "Inbound/outbound calling, appointment booking, lead qualification."
    },
    {
      icon: Target,
      title: "Campaign Automation",
      description: "Email sequences, SMS, landing pages, A/B testing — all autonomous."
    },
    {
      icon: LayoutDashboard,
      title: "Multi-Tenant Dashboard",
      description: "Manage all your clients from one admin portal."
    },
    {
      icon: GraduationCap,
      title: "Sales & Marketing Training",
      description: "How to sell AI services, pricing models, pitch decks, demos."
    },
    {
      icon: Users2,
      title: "Dedicated Partner Support",
      description: "Direct Slack channel, weekly partner calls, technical support."
    }
  ]}
/>
```

---

#### 5. Partner Tiers
```tsx
<PricingTable
  title="Partnership Tiers"
  tiers={[
    {
      name: "Reseller",
      price: "$5,000",
      period: "/month",
      description: "Start selling immediately",
      features: [
        "Up to 25 client accounts",
        "70% revenue share",
        "White-label dashboard",
        "Email support",
        "Sales training materials"
      ],
      cta: "Apply Now",
      highlighted: false
    },
    {
      name: "Premium Partner",
      price: "$15,000",
      period: "/month",
      description: "Scale to 100+ clients",
      features: [
        "Up to 100 client accounts",
        "75% revenue share",
        "Everything in Reseller, plus:",
        "Custom integrations",
        "Dedicated account manager",
        "Co-marketing opportunities"
      ],
      cta: "Apply Now",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Unlimited scale",
      features: [
        "Unlimited client accounts",
        "80% revenue share",
        "Everything in Premium, plus:",
        "Private infrastructure option",
        "Custom feature development",
        "White-glove onboarding"
      ],
      cta: "Contact Us",
      highlighted: false
    }
  ]}
/>
```

---

#### 6. Case Studies
```tsx
<CaseStudies
  studies={[
    {
      partner: "Apex Digital Marketing",
      industry: "Marketing Agency",
      result: "Added $47K MRR in 6 months",
      quote: "We went from 'we don't do AI' to having a full AI automation division. Our clients love it.",
      metrics: {
        clients: 35,
        mrr: "$47,000",
        timeToFirstClient: "2 weeks"
      }
    },
    {
      partner: "TechForward Solutions",
      industry: "MSP",
      result: "$120K annual upsells to existing clients",
      quote: "We upsold 40% of our existing client base. Pure margin, no delivery headcount.",
      metrics: {
        clients: 52,
        mrr: "$63,000",
        upsellRate: "40%"
      }
    }
  ]}
/>
```

---

#### 7. Application Form
```tsx
<PartnerApplicationForm
  fields={[
    { name: "companyName", label: "Company Name", type: "text", required: true },
    { name: "contactName", label: "Your Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "website", label: "Website", type: "url", required: false },
    { name: "clientCount", label: "Current # of Clients", type: "number", required: true },
    { name: "targetTier", label: "Partnership Tier Interest", type: "select", options: ["Reseller", "Premium", "Enterprise"], required: true },
    { name: "message", label: "Tell us about your agency", type: "textarea", required: true }
  ]}
  submitEndpoint="/api/contact"
  successMessage="Application submitted! We'll contact you within 24 hours."
/>
```

---

## 🔌 Integration Requirements

### 1. Calendly Integration

**File:** `/lib/calendly.ts`

```typescript
export const CALENDLY_URLS = {
  smb: 'https://calendly.com/ai-epic-dm/smb-demo',
  partner: 'https://calendly.com/ai-epic-dm/partner-call',
  enterprise: 'https://calendly.com/ai-epic-dm/enterprise-consultation'
}

export function openCalendly(url: string, prefill?: {
  name?: string
  email?: string
  customAnswers?: Record<string, string>
}) {
  if (typeof window !== 'undefined' && window.Calendly) {
    window.Calendly.initPopupWidget({ url, prefill })
  }
}
```

**Script Tag in Layout:**
```tsx
// In app/ai-receptionist/page.tsx and app/partners/page.tsx
<Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
```

---

### 2. Contact Form API

**File:** `/app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate
  if (!body.email || !body.name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Send to CRM (HubSpot, Salesforce, etc.)
  // For now, just log or email

  try {
    // Option 1: Send email via Resend/SendGrid
    // await sendEmail({ to: 'sales@ai.epic.dm', subject: 'New Lead', body })

    // Option 2: Send to webhook
    // await fetch('https://hooks.zapier.com/...', { method: 'POST', body: JSON.stringify(body) })

    console.log('New contact:', body)

    return NextResponse.json({ success: true, message: 'Contact form submitted' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
```

---

### 3. Analytics Tracking

**Add to both landing pages:**

```tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function LandingPage() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title
      })
    }
  }, [pathname])

  const trackCTAClick = (ctaName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'CTA',
        event_label: ctaName
      })
    }
  }

  return (
    // ... page content
  )
}
```

---

## 🎨 Component Implementation Examples

### Hero Component

**File:** `/components/landing/Hero.tsx`

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'

interface HeroProps {
  title: string
  subtitle: string
  primaryCTA: string
  secondaryCTA?: string
  onPrimaryCTA: () => void
  onSecondaryCTA?: () => void
  backgroundPattern?: 'grid' | 'gradient'
}

export function Hero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  onPrimaryCTA,
  onSecondaryCTA,
  backgroundPattern = 'grid'
}: HeroProps) {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
      backgroundPattern === 'grid' ? 'bg-grid-pattern' : 'bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'
    }`}>
      {/* Glassmorphism container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 animate-slide-up-fade-in">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              onClick={onPrimaryCTA}
            >
              {primaryCTA}
            </Button>

            {secondaryCTA && onSecondaryCTA && (
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={onSecondaryCTA}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {secondaryCTA}
              </Button>
            )}
          </div>

          {/* Trust signals */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <span>✓ 14-day free trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Setup in 5 minutes</span>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950 pointer-events-none" />
    </section>
  )
}
```

---

### Pricing Table Component

**File:** `/components/landing/PricingTable.tsx`

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}

interface PricingTableProps {
  title?: string
  tiers: PricingTier[]
  onSelectTier?: (tierName: string) => void
}

export function PricingTable({ title, tiers, onSelectTier }: PricingTableProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative p-8 ${
                tier.highlighted
                  ? 'ring-2 ring-blue-600 shadow-xl scale-105 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl'
                  : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl'
              } animate-slide-up-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {tier.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.highlighted ? 'default' : 'outline'}
                size="lg"
                onClick={() => onSelectTier?.(tier.name)}
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 📊 SEO & Metadata

### SMB Landing Page Metadata

**File:** `/app/ai-receptionist/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist | Never Miss Another Lead | AI.EPIC.DM',
  description: 'AI receptionist that answers calls 24/7, qualifies leads, and books appointments automatically. Setup in 5 minutes. Start your free trial today.',
  keywords: 'AI receptionist, appointment booking, lead qualification, automated receptionist, virtual receptionist, AI phone answering',
  openGraph: {
    title: 'AI Receptionist - Answer Every Call & Book More Appointments',
    description: '24/7 AI receptionist for dental, legal, real estate, and service businesses. Never miss a lead again.',
    type: 'website',
    url: 'https://ai.epic.dm/ai-receptionist',
    images: [
      {
        url: '/og-ai-receptionist.png',
        width: 1200,
        height: 630,
        alt: 'AI.EPIC.DM AI Receptionist Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Receptionist | Never Miss Another Lead',
    description: 'AI that answers calls, qualifies leads, books appointments 24/7. Free trial.',
    images: ['/og-ai-receptionist.png']
  }
}
```

---

### Partner Landing Page Metadata

**File:** `/app/partners/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Program | White-Label AI Platform for Agencies | AI.EPIC.DM',
  description: 'White-label AI voice platform for agencies. Sell AI automation to clients without building infrastructure. $5K-50K/mo partnership opportunities.',
  keywords: 'white label AI, agency partnership, AI reseller, voice AI platform, marketing automation partnership, AI platform for agencies',
  openGraph: {
    title: 'White-Label AI Platform for Digital Agencies',
    description: 'Launch AI services for your clients in days. 70-80% revenue share. Full white-label platform included.',
    type: 'website',
    url: 'https://ai.epic.dm/partners',
    images: [
      {
        url: '/og-partners.png',
        width: 1200,
        height: 630,
        alt: 'AI.EPIC.DM Partner Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner with AI.EPIC.DM | White-Label AI Platform',
    description: '$5K-50K/mo partnership opportunities for agencies.',
    images: ['/og-partners.png']
  }
}
```

---

## 🚀 Implementation Checklist

### Pre-Build

- [ ] Review design system in `globals.css`
- [ ] Confirm Calendly URLs are set up
- [ ] Prepare demo video (or use placeholder)
- [ ] Gather testimonials/logos (or use placeholders)
- [ ] Setup contact form webhook/email destination

### Build Phase 1: Components (2-3 hours)

- [ ] Create `/components/landing/Hero.tsx`
- [ ] Create `/components/landing/ProblemSolution.tsx`
- [ ] Create `/components/landing/Features.tsx`
- [ ] Create `/components/landing/PricingTable.tsx`
- [ ] Create `/components/landing/SocialProof.tsx`
- [ ] Create `/components/landing/FAQ.tsx`
- [ ] Create `/components/landing/DemoBookingCTA.tsx`
- [ ] Create `/components/landing/PartnerCalculator.tsx`
- [ ] Create `/components/landing/PartnerApplicationForm.tsx`

### Build Phase 2: Pages (2-3 hours)

- [ ] Create `/app/ai-receptionist/page.tsx`
- [ ] Create `/app/partners/page.tsx`
- [ ] Create `/lib/calendly.ts`
- [ ] Create `/app/api/contact/route.ts`

### Build Phase 3: Assets & Content (1-2 hours)

- [ ] Add OG images (`/public/og-ai-receptionist.png`, `/public/og-partners.png`)
- [ ] Add testimonial images (or placeholders)
- [ ] Add partner logos (or placeholders)
- [ ] Add demo video embed code
- [ ] Finalize copy for all sections

### Testing (30 min)

- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test Calendly popup on both pages
- [ ] Test contact form submission
- [ ] Test all CTAs
- [ ] Check dark mode
- [ ] Lighthouse SEO audit (target 90+)
- [ ] Check page load speed (target <3s)

### Launch (15 min)

- [ ] Deploy to production
- [ ] Setup Google Analytics tracking
- [ ] Setup conversion tracking
- [ ] Test on live domain
- [ ] Share URLs with marketing team for ad campaign

---

## 📈 Success Metrics

### Week 1 Goals

- [ ] Landing pages converting at 15%+ (click to demo booking)
- [ ] 20+ demos booked from ads
- [ ] Page load time <3 seconds
- [ ] Lighthouse SEO score 90+
- [ ] Zero broken links or forms

### Month 1 Goals

- [ ] 100+ demos booked from landing pages
- [ ] 25-30 customers closed
- [ ] <10% bounce rate on landing pages
- [ ] Average session duration >2 minutes

---

## 🎯 Next Steps

1. **Review this plan** - Confirm approach, content, design
2. **Gather assets** - Demo video, testimonials, logos, OG images
3. **Build components** - Start with reusable landing components
4. **Build pages** - Assemble SMB and Partner pages
5. **Test** - Responsive, forms, CTAs, analytics
6. **Launch** - Deploy to production
7. **Measure** - Track conversions, iterate on copy/design

---

**Estimated Total Time:** 6-8 hours (1 day with focused work)

**Deliverable:** Two conversion-optimized landing pages ready to receive $5K/mo ad traffic and drive 113 demos/month.

---

**Last Updated:** November 8, 2025
**Status:** Ready for implementation
**Owner:** Frontend Team
