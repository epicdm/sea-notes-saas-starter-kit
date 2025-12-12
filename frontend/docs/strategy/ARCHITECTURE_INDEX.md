# Architecture Analysis - Document Index

**Generated**: November 8, 2025
**Project**: Epic.ai Voice Agents Platform  
**Frontend**: Next.js 15 with React 18

---

## Three Documents Created

### 1. COMPLETE_ARCHITECTURE_ANALYSIS.md (25 KB)
**For**: Deep understanding of the entire system  
**Sections**: 18 detailed sections covering everything

- Project Structure Overview
- Technology Stack (with all versions)
- Backend Architecture (Flask proxy pattern)
- Database Schema (Prisma models)
- API Integration Patterns
- Custom Hooks Pattern
- Existing Page Patterns
- Authentication Flow
- Component Structure
- Forms & Validation
- Styling Approach
- Testing Approach
- Environment Configuration
- Existing Similar Pages
- Key Architectural Decisions
- Missing Pieces for Funnels
- Quick Reference Patterns
- Complete Summary

**Read this if**: You want to understand the entire codebase deeply

**Time to read**: 30-45 minutes

---

### 2. ARCHITECTURE_SUMMARY.md (9.5 KB)
**For**: Quick reference and getting started  
**Sections**: 18 concise sections

- What You Have (Architecture Overview)
- Key Files to Know
- How to Build Funnels Feature (6 steps)
- Architecture Patterns (5 patterns with code)
- Database Ecosystem
- Important Configuration
- Testing & Running Commands
- Component Library Reference
- File Structure Reference
- Next Steps (Checklist)

**Read this if**: You want to get coding quickly with templates

**Time to read**: 10-15 minutes

---

### 3. FILES_TO_REFERENCE.md (12 KB)
**For**: Copy-paste templates and exact file locations  
**Sections**: 9 categories with code examples

- API Routes (with example code)
- Custom Hooks (with example code)
- Page Components (with patterns)
- Components (Reusable patterns)
- API Client (Core infrastructure)
- Authentication (NextAuth)
- Database Schema (Prisma)
- Types & Interfaces
- Form Components & Validation
- Quick Copy-Paste Checklist
- File Location Quick Reference
- Summary: What to Do

**Read this if**: You're ready to start coding

**Time to read**: 5-10 minutes (reference as you code)

---

## Where to Start

### If You Have 5 Minutes
Read the **Quick Summary** above (top of this document)

### If You Have 15 Minutes
1. Read: ARCHITECTURE_SUMMARY.md
2. Skim: FILES_TO_REFERENCE.md file locations section

### If You Have 30 Minutes
1. Read: ARCHITECTURE_SUMMARY.md (full)
2. Read: FILES_TO_REFERENCE.md (full)
3. Identify the 3-4 files you need to copy

### If You Have 1+ Hour
1. Read: ARCHITECTURE_SUMMARY.md
2. Read: COMPLETE_ARCHITECTURE_ANALYSIS.md
3. Read: FILES_TO_REFERENCE.md
4. Open and study the reference files
5. Start implementing

---

## Quick Answers to Common Questions

### Q: Is this frontend-only?
**A**: No! This is full-stack. Frontend (React) + API Routes (Next.js) + Backend (Flask) + Database (PostgreSQL)

### Q: Where do API calls happen?
**A**: `/lib/api-client.ts` - This is the ONLY place for HTTP calls. Use `api.get()`, `api.post()`, etc.

### Q: How does authentication work?
**A**: NextAuth v5 handles login. User email is extracted and sent to Flask backend in `X-User-Email` header.

### Q: Where do I fetch data?
**A**: Custom hooks in `/lib/hooks/` - Each resource type has a hook (useAgents, useStats, useFunnels, etc.)

### Q: How do I make a new page?
**A**: Copy pattern from `/app/dashboard/agents/page.tsx` - it's the reference implementation.

### Q: Where do I add database stuff?
**A**: `/prisma/schema.prisma` - Define models there, then run migrations.

### Q: How do dialogs/modals work?
**A**: Dialog components already exist (CreateFunnelWizard, EditFunnelWizard, etc.) - just use them.

### Q: How do I show errors?
**A**: `import { toast } from 'sonner'` then `toast.error('message')`

### Q: What about forms?
**A**: React Hook Form + Zod. Examples in CreateFunnelWizard.tsx and EditFunnelWizard.tsx

### Q: Is styling responsive?
**A**: Yes, Tailwind CSS v4 with mobile-first approach. Dark mode supported everywhere.

---

## The Five Most Important Files

1. **`/lib/api-client.ts`**
   - Core of the entire frontend
   - All HTTP communication goes here
   - Handles auth, errors, timeouts
   - MUST understand this file

2. **`/app/api/user/agents/route.ts`**
   - Template for all API routes
   - Shows proxy pattern to Flask
   - Copy this for funnels route

3. **`/lib/hooks/use-agents.ts`**
   - Template for all custom hooks
   - Shows data fetching pattern
   - Copy this for funnels hook

4. **`/app/dashboard/agents/page.tsx`**
   - Reference page implementation
   - Shows complete page pattern
   - Study this for funnels page updates

5. **`/prisma/schema.prisma`**
   - Database schema definition
   - Shows all models and relationships
   - Add funnels model here

---

## Implementing Funnels Checklist

Frontend (You can do now):
- [ ] Read ARCHITECTURE_SUMMARY.md
- [ ] Read FILES_TO_REFERENCE.md
- [ ] Create `/app/api/user/funnels/route.ts` (copy from agents)
- [ ] Create `/lib/hooks/use-funnels.ts` (copy from use-agents)
- [ ] Add Funnel types to `/lib/types.ts`
- [ ] Update `/app/dashboard/funnels/page.tsx` to use hook
- [ ] Test everything locally

Backend (Flask team):
- [ ] Design Funnel model
- [ ] Create database table
- [ ] Implement CRUD endpoints
- [ ] Implement analytics endpoint
- [ ] Test with frontend

Database (Prisma):
- [ ] Add funnels model to schema.prisma
- [ ] Add relationship to users
- [ ] Run: `npx prisma migrate dev --name add_funnels`
- [ ] Verify schema generates correctly

---

## File Structure (Simplified)

```
/app/
  /api/user/
    /agents/route.ts ................. TEMPLATE
    /funnels/route.ts ................ CREATE THIS
  /dashboard/
    /funnels/
      page.tsx ...................... UPDATE THIS
      [id]/page.tsx
      [id]/edit/page.tsx
      [id]/analytics/page.tsx
      new/page.tsx

/components/
  CreateFunnelWizard.tsx ............. DONE
  EditFunnelWizard.tsx ............... DONE
  /funnels/
    FunnelAnalyticsPanel.tsx ......... DONE

/lib/
  api-client.ts ...................... CRITICAL
  /hooks/
    use-agents.ts .................... TEMPLATE
    use-funnels.ts ................... CREATE THIS
  types.ts ........................... UPDATE THIS

/prisma/
  schema.prisma ....................... UPDATE THIS
```

---

## Technology Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.5.6 | Full-stack React |
| Runtime | React | 18.3.1 | UI rendering |
| Language | TypeScript | 5.9.3 | Type safety |
| Styling | Tailwind CSS | 4.1.16 | Utility CSS |
| Components | Radix UI | Latest | Accessible primitives |
| Components | HeroUI | 2.8.5 | Pre-styled |
| Auth | NextAuth | 5.0.0-beta | Authentication |
| Database | PostgreSQL | - | Relational DB |
| ORM | Prisma | 6.18.0 | Database access |
| Forms | React Hook Form | 7.65.0 | Form state |
| Validation | Zod | 4.1.12 | Schema validation |
| Icons | Lucide React | 0.546.0 | Icon library |
| Charts | Recharts | 3.3.0 | Data visualization |
| Notifications | Sonner | 2.0.7 | Toast messages |
| Testing | Playwright | 1.56.1 | E2E testing |

---

## How Everything Connects

```
USER BROWSER
     ↓ (User clicks "Create Funnel")
React Component (/app/dashboard/funnels/page.tsx)
     ↓ (calls useFunnels hook)
Custom Hook (/lib/hooks/use-funnels.ts)
     ↓ (calls api.post())
API Client (/lib/api-client.ts)
     ↓ (extracts auth from session)
NextAuth Session
     ↓ (makes HTTP POST with X-User-Email header)
Next.js API Route (/app/api/user/funnels/route.ts)
     ↓ (validates session, extracts email)
Proxy to Backend (/api/user/funnels - Flask)
     ↓ (creates record in database)
PostgreSQL
     ↓ (returns funnels array)
API Response {success: true, data: [...]}
     ↓ (hook updates state)
Component Re-renders
     ↓ (toast shows "Funnel created!")
USER SEES SUCCESS
```

---

## Commands You'll Need

```bash
# Development
npm run dev              # Start dev server on port 3000

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio      # View database GUI

# Testing
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Interactive test UI
npm run test:e2e:debug  # Debug mode

# Building
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
```

---

## Debugging Tips

### API Calls Not Working?
1. Check `/lib/api-client.ts` - ensure you're using it
2. Check browser console for errors
3. Check network tab for request/response
4. Verify Flask backend is running on port 5001
5. Check NextAuth session is valid

### Component Not Updating?
1. Ensure hook is called in useEffect
2. Check hook is returning correct state
3. Verify setFunnels() is called with new data
4. Check dependencies array in useEffect

### Types Not Working?
1. Ensure types are exported from `/lib/types.ts`
2. Check imports are correct
3. Run `npx prisma generate` to update types
4. Verify TypeScript file is .ts or .tsx

### Styling Issues?
1. Check Tailwind config in `tailwind.config.mjs`
2. Ensure classes are valid Tailwind utilities
3. Check for typos in class names
4. Run `npm run build` to verify no build errors

### Database Issues?
1. Check PostgreSQL is running
2. Check `.env.local` has DATABASE_URL
3. Run `npx prisma studio` to inspect data
4. Run `npx prisma migrate reset` to reset (careful!)

---

## Support Files

All three analysis documents plus this index are saved in your repo root:

1. `COMPLETE_ARCHITECTURE_ANALYSIS.md` - Deep technical reference
2. `ARCHITECTURE_SUMMARY.md` - Quick start guide
3. `FILES_TO_REFERENCE.md` - Copy-paste templates
4. `ARCHITECTURE_INDEX.md` - This file (navigation)

---

## Next: Start Reading!

**Recommended reading order:**

1. Start here: This document (5 min)
2. Then: ARCHITECTURE_SUMMARY.md (15 min)
3. Then: FILES_TO_REFERENCE.md (10 min)
4. While coding: COMPLETE_ARCHITECTURE_ANALYSIS.md (reference)

Good luck! You've got this. The hardest part is understanding the architecture - now you do!

