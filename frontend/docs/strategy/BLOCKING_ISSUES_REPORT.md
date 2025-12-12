# Frontend Migration - Blocking Issues Report

**Generated**: 2025-11-05
**Repository**: /opt/livekit1/frontend
**Analysis Status**: Complete
**Build Status**: ❌ FAILING
**Type Safety**: ⚠️ MASKED (ignoreBuildErrors: true)
**Code Quality**: ⚠️ MASKED (ignoreDuringBuilds: true)

---

## 📊 Executive Summary

The frontend migration from Vite to Next.js 15 is **structurally complete** but has **critical configuration issues** preventing production builds. Additionally, there are **44+ TypeScript errors** that are currently masked by build configuration flags.

### Overall Status

| Category | Status | Severity | Impact |
|----------|--------|----------|--------|
| **Build System** | ❌ FAILING | 🔴 CRITICAL | Cannot build at all |
| **Type Safety** | ⚠️ ERRORS MASKED | 🟡 HIGH | Runtime errors likely |
| **Code Quality** | ⚠️ ERRORS MASKED | 🟢 MEDIUM | Maintainability issues |
| **Configuration** | ⚠️ INCOMPLETE | 🟡 HIGH | Performance degraded |
| **Dependencies** | ⚠️ MISALIGNED | 🟢 MEDIUM | Future compatibility risk |

### Quick Stats

- **Blocking Issues**: 2 critical, 2 high-priority
- **TypeScript Errors**: 44+ errors across 20+ files
- **ESLint Errors**: 20+ violations
- **Estimated Fix Time**: 2-3 hours for full resolution
- **Minimum Viable Fix**: 10 minutes (PostCSS only)

---

## 🚨 CRITICAL BLOCKERS (Must Fix for Build)

### Issue #1: Tailwind CSS v4 PostCSS Plugin Misconfiguration

**Severity**: 🔴 CRITICAL - Blocks all builds
**Location**: `postcss.config.mjs`
**Impact**: Build fails immediately, cannot generate production bundle
**Estimated Fix Time**: 5 minutes

#### Problem Description

Build fails with error:
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

#### Root Cause

Tailwind CSS v4.1.16 introduced a breaking change:
- **Old (v3)**: Used `tailwindcss` package as PostCSS plugin directly
- **New (v4)**: Requires `@tailwindcss/postcss` separate package

**Current Configuration** (postcss.config.mjs):
```javascript
const config = {
  plugins: {
    tailwindcss: {},      // ❌ WRONG - v3 syntax, doesn't work with v4
    autoprefixer: {},
  },
};
```

**Package Status**:
- ✅ `tailwindcss@4.1.16` installed
- ✅ `@tailwindcss/postcss@4.1.16` installed
- ❌ `@tailwindcss/postcss` NOT configured in postcss.config.mjs

#### Fix Instructions

**Step 1: Update PostCSS Configuration**
```bash
cat > postcss.config.mjs << 'EOF'
const config = {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ CORRECT - v4 syntax
    autoprefixer: {},
  },
};

export default config;
EOF
```

**Step 2: Verify Configuration**
```bash
cat postcss.config.mjs
```

**Step 3: Clean and Rebuild**
```bash
sudo rm -rf .next
npm run build
```

#### Expected Outcome

Build should proceed past PostCSS stage. Next errors will be related to TypeScript (see Issue #3).

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Simple configuration change
- **Rollback**: Easy - revert postcss.config.mjs
- **Side Effects**: None - this is the correct v4 configuration

#### References

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- package.json:87 - `@tailwindcss/postcss` package

---

### Issue #2: File Permission Issues (.next Directory)

**Severity**: 🟡 HIGH - Prevents clean builds
**Location**: `.next/` directory
**Impact**: Cannot delete build cache without sudo, blocks development workflow
**Estimated Fix Time**: 2 minutes

#### Problem Description

Build cache directory owned by root, preventing normal cleanup:
```
.next/diagnostics/        owned by root
.next/server/            owned by root
.next/static/            owned by root
```

Attempting to remove causes:
```
rm: cannot remove '.next/diagnostics/build-diagnostics.json': Permission denied
```

#### Root Cause

Previous build was run with `sudo npm run build`, which creates files owned by root.

#### Fix Instructions

**Immediate Fix**:
```bash
sudo chown -R agent3:agent3 .next
```

**Alternative (if chown fails)**:
```bash
sudo rm -rf .next
npm run build  # WITHOUT sudo
```

#### Prevention

**NEVER run these commands with sudo**:
```bash
# ❌ WRONG
sudo npm run build
sudo npm run dev
sudo npm install

# ✅ CORRECT
npm run build
npm run dev
npm install
```

Only use sudo for system-level operations or intentional permission fixes.

#### Expected Outcome

After fix:
- `ls -la .next` should show `agent3:agent3` ownership
- `rm -rf .next` should work without sudo
- Build commands should work as normal user

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Permission fix only
- **Rollback**: N/A - no code changes
- **Side Effects**: None

---

## ⚠️ HIGH-PRIORITY ISSUES (Should Fix for Production)

### Issue #3: Next.js 15 Async Params API Breaking Changes

**Severity**: 🟡 HIGH - Causes TypeScript errors (currently masked)
**Location**: 20+ API route files with dynamic segments
**Impact**: Runtime type safety compromised, potential bugs in production
**Estimated Fix Time**: 60-90 minutes

#### Problem Description

TypeScript compilation fails with 44+ errors like:
```
error TS2344: Type '{ __tag__: "GET"; __param_position__: "second";
__param_type__: { params: { id: string; }; }; }' does not satisfy
the constraint 'ParamCheck<RouteContext>'.
  Type '{ id: string; }' is missing the following properties from
  type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
```

These errors are **currently masked** by `next.config.ts`:
```typescript
typescript: {
  ignoreBuildErrors: true,  // ⚠️ Hiding 44+ errors
}
```

#### Root Cause

Next.js 15 introduced a breaking change to route parameters:
- **Next.js 14**: Params were synchronous objects
- **Next.js 15**: Params are now Promise-wrapped (async)

This requires awaiting params in all dynamic route handlers.

#### Affected Files (Partial List)

**API Routes** (20+ files):
```
app/api/user/agents/[id]/route.ts
app/api/user/agents/[id]/update/route.ts
app/api/v1/agents/[agentId]/route.ts
app/api/v1/calls/[callId]/route.ts
app/api/dashboard/agents/[agentId]/route.ts
app/api/dashboard/agents/[agentId]/delete/route.ts
app/api/dashboard/agents/[agentId]/update/route.ts
app/api/dashboard/agents/[agentId]/voice/route.ts
app/api/dashboard/calls/[callId]/route.ts
app/api/dashboard/phone-numbers/[phoneNumber]/route.ts
app/api/dashboard/phone-numbers/[phoneNumber]/delete/route.ts
app/api/admin/users/[userId]/route.ts
... and 10+ more files
```

**Page Routes** (5+ files):
```
app/dashboard/agents/[id]/page.tsx
app/dashboard/calls/[callId]/page.tsx
app/agents/[id]/page.tsx
... and more
```

#### Fix Pattern

**Before (Next.js 14 - BROKEN in v15)**:
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;  // ❌ Direct access
  // ... rest of handler
}
```

**After (Next.js 15 - CORRECT)**:
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;  // ✅ Must await
  // ... rest of handler
}
```

#### Fix Instructions

**Step 1: Update Type Signature**
```typescript
// Change this:
{ params }: { params: { id: string } }

// To this:
{ params }: { params: Promise<{ id: string }> }
```

**Step 2: Await Params**
```typescript
// Change this:
const agentId = params.id;

// To this:
const { id: agentId } = await params;
```

**Step 3: Update All Dynamic Routes**

For **API routes** (`app/api/**/**/[param]/route.ts`):
```typescript
// Example: app/api/user/agents/[id]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise wrapper
) {
  const { id } = await params;  // ✅ Await params

  // Rest of implementation unchanged
  const response = await fetch(`${BACKEND_URL}/api/user/agents/${id}`, {
    // ...
  });

  return NextResponse.json(data);
}
```

For **page routes** (`app/**/[param]/page.tsx`):
```typescript
// Example: app/dashboard/agents/[id]/page.tsx
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;  // ✅ Promise wrapper
}) {
  const { id } = await params;  // ✅ Await params

  // Rest of component implementation
  return <div>Agent {id}</div>;
}
```

**Step 4: Test TypeScript Compilation**
```bash
npx tsc --noEmit
```

Should show 0 errors after all files are updated.

#### Automation Strategy

To fix all files efficiently:
1. Create a script to find all dynamic route files
2. Apply regex replacements for common patterns
3. Manually verify complex cases
4. Run TypeScript compiler to catch missed cases

**Example script**:
```bash
# Find all route files with dynamic segments
find app -name "route.ts" -o -name "page.tsx" | \
  xargs grep -l "params.*\[.*\]" | \
  xargs sed -i 's/{ params }: { params: {/{ params }: { params: Promise<{/g'
```

**⚠️ Manual verification required** after automated changes.

#### Expected Outcome

After fixes:
- ✅ `npx tsc --noEmit` shows 0 errors
- ✅ All route handlers properly handle async params
- ✅ Runtime type safety restored
- ✅ Can remove `ignoreBuildErrors: true` from next.config.ts

#### Risk Assessment

- **Risk Level**: 🟡 MEDIUM - Requires many file changes
- **Rollback**: Revert all route file changes
- **Side Effects**: None if implemented correctly
- **Testing Required**: High - test all dynamic routes after changes

#### References

- [Next.js 15 Upgrade Guide - Async Request APIs](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change)
- TypeScript error output from `.next/types/validator.ts`

---

### Issue #4: Multiple Lockfiles Warning

**Severity**: 🟡 MEDIUM - Causes warnings, may slow builds
**Location**: `/opt/livekit1/package-lock.json` and `/opt/livekit1/frontend/package-lock.json`
**Impact**: Build warnings, potential dependency resolution issues
**Estimated Fix Time**: 10 minutes

#### Problem Description

Next.js build shows warning:
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected the directory of /opt/livekit1/package-lock.json
as the root directory.
```

#### Root Cause

Two package-lock.json files exist:
1. `/opt/livekit1/package-lock.json` (parent directory)
2. `/opt/livekit1/frontend/package-lock.json` (current project)

Next.js is confused about which is the workspace root.

#### Investigation Required

**Check if parent is a monorepo**:
```bash
ls -la /opt/livekit1/
cat /opt/livekit1/package.json
```

#### Fix Options

**Option A: Not a Monorepo (Standalone Frontend)**

If parent directory is NOT a monorepo:
```bash
# Remove parent lockfile
rm /opt/livekit1/package-lock.json

# Verify frontend lockfile exists
ls -la /opt/livekit1/frontend/package-lock.json
```

**Option B: Is a Monorepo (Frontend + Backend)**

If parent directory IS a monorepo:

1. **Add to next.config.ts**:
```typescript
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),  // Add this line
  // ... rest of config
};
```

2. **Verify workspace structure**:
```bash
cat /opt/livekit1/package.json  # Should have "workspaces" field
```

#### Expected Outcome

After fix:
- ✅ No lockfile warnings in build output
- ✅ Faster dependency resolution
- ✅ Clear workspace root

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Configuration only
- **Rollback**: Easy - revert changes
- **Side Effects**: None

---

## 🟢 MEDIUM-PRIORITY ISSUES (Quality & Maintainability)

### Issue #5: React Type Definitions Mismatch

**Severity**: 🟢 MEDIUM - May cause future type errors
**Location**: `package.json` dependencies
**Impact**: Type definitions don't match runtime, potential future compatibility issues
**Estimated Fix Time**: 5 minutes

#### Problem Description

Type version mismatch:
```json
"react": "^18.3.1",           // Runtime: React 18
"react-dom": "^18.3.1",       // Runtime: React 18
"@types/react": "^19",        // Types: React 19 ⚠️
"@types/react-dom": "^19"     // Types: React 19 ⚠️
```

React 19 type definitions include API changes that don't exist in React 18 runtime.

#### Fix Options

**Option 1: Downgrade Types to Match Runtime (RECOMMENDED)**
```bash
npm install --save-dev @types/react@18 @types/react-dom@18
```

**Pros**:
- Types match runtime exactly
- No risk of using non-existent APIs
- Stable and tested

**Cons**:
- Need to upgrade again when moving to React 19

**Option 2: Upgrade Runtime to React 19 RC**
```bash
npm install react@rc react-dom@rc
```

**Pros**:
- Types and runtime aligned at v19
- Access to React 19 features

**Cons**:
- React 19 still in RC (Release Candidate)
- May have stability issues
- Breaking changes to learn

**Option 3: Keep Current (Monitor for Issues)**

Only if:
- No current type errors related to React
- Planning to upgrade to React 19 soon
- Willing to fix type errors as they appear

#### Recommendation

**Use Option 1** (downgrade types) unless:
- React 19 is stable (check [react.dev](https://react.dev))
- You have time for React 19 migration testing
- You need React 19 specific features

#### Expected Outcome

After Option 1 fix:
- ✅ Types match runtime version
- ✅ No false-positive type errors from React 19 APIs
- ✅ Stable type checking

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Dependency change only
- **Rollback**: `npm install --save-dev @types/react@19 @types/react-dom@19`
- **Side Effects**: May reveal previously hidden type errors (good thing)

---

### Issue #6: ESLint Violations (20+ Errors/Warnings)

**Severity**: 🟢 MEDIUM - Code quality issues (currently masked)
**Location**: Multiple files across codebase
**Impact**: Maintainability, potential runtime errors from any types
**Estimated Fix Time**: 30-45 minutes

#### Problem Description

ESLint shows 20+ violations:

**Error Categories**:
1. **`@typescript-eslint/no-explicit-any`** (10 errors)
   - 6 in SuperClaude_Framework TypeScript files
   - 4 in API routes

2. **`react/no-unescaped-entities`** (10+ errors)
   - Unescaped quotes in JSX (e.g., `'` should be `&apos;`)

3. **Unused variables** (multiple warnings)

#### Example Violations

**1. Explicit `any` Types**:
```typescript
// ❌ Bad
export function someFunction(data: any) {
  return data.value;
}

// ✅ Good
export function someFunction(data: { value: string }) {
  return data.value;
}
```

**2. Unescaped Entities**:
```tsx
// ❌ Bad (app/auth/signin/page.tsx:127)
<p>Don't have an account?</p>

// ✅ Good
<p>Don&apos;t have an account?</p>
```

**3. Unused Variables**:
```typescript
// ❌ Bad
const unusedVar = "value";

// ✅ Good - remove or prefix with underscore
const _intentionallyUnused = "value";
```

#### Fix Strategy

**Phase 1: Fix `any` Types (Priority)**
```bash
# Find all explicit any types
grep -rn ": any" app/api/ SuperClaude_Framework/
```

For each occurrence:
- Replace `any` with proper type
- Use TypeScript utility types if needed (`Record`, `Partial`, etc.)
- Use `unknown` for truly dynamic data (safer than `any`)

**Phase 2: Fix Unescaped Entities**
```bash
# Find unescaped quotes
grep -rn "'" app/ --include="*.tsx"
```

Replace:
- `'` → `&apos;` or `&#39;`
- `"` → `&quot;`
- Use backticks for template strings when appropriate

**Phase 3: Remove Unused Variables**
- Delete if truly unused
- Prefix with `_` if intentionally unused
- Use where appropriate

#### Expected Outcome

After fixes:
- ✅ `npm run lint` shows 0 errors
- ✅ Improved type safety (no `any` types)
- ✅ Valid JSX markup
- ✅ Can remove `ignoreDuringBuilds: true` from next.config.ts

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Mostly cosmetic fixes
- **Rollback**: Git revert
- **Side Effects**: Better type safety may reveal logic bugs (good)

#### References

- ESLint output from `npm run lint`
- [TypeScript: Avoid `any`](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#any)
- [React: Unescaped Entities](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)

---

### Issue #7: Tailwind Config Format (Optional)

**Severity**: 🟢 LOW - Works but outdated
**Location**: `tailwind.config.js`
**Impact**: None currently, future maintenance
**Estimated Fix Time**: 30 minutes

#### Problem Description

Using Tailwind v3 config format with v4 packages:
- **File**: `tailwind.config.js` (CommonJS)
- **Format**: `module.exports = {...}` (v3 style)
- **Current**: Works fine with v4
- **Recommended**: Migrate to ESM format

#### Fix (Optional)

**When to do this**: After all critical/high-priority fixes are complete.

**Step 1: Rename File**
```bash
mv tailwind.config.js tailwind.config.ts
```

**Step 2: Convert to ESM**
```typescript
// Before (CommonJS)
module.exports = {
  content: [...],
  theme: { extend: {...} },
  plugins: [heroui()],
}

// After (ESM)
export default {
  content: [...],
  theme: { extend: {...} },
  plugins: [heroui()],
}
```

**Step 3: Test**
```bash
npm run build
```

#### Expected Outcome

- ✅ Modern ESM format
- ✅ Consistent with other config files
- ✅ Better TypeScript support

#### Risk Assessment

- **Risk Level**: 🟢 LOW - Optional improvement
- **Rollback**: Rename back to .js
- **Side Effects**: None
- **Priority**: LOW - do last

---

## 🔄 Fix Order & Dependencies

### Recommended Fix Order

```
Phase 1: Critical Fixes (Required for Build)
├─ 1. Fix PostCSS Configuration (#1)          ⏱️ 5 min
├─ 2. Fix File Permissions (#2)               ⏱️ 2 min
└─ 3. Verify Build Proceeds                   ⏱️ 5 min

Phase 2: High-Priority Fixes (Type Safety)
├─ 4. Fix Next.js 15 Async Params (#3)        ⏱️ 90 min
├─ 5. Investigate Multiple Lockfiles (#4)     ⏱️ 10 min
└─ 6. Fix React Type Mismatch (#5)            ⏱️ 5 min

Phase 3: Medium-Priority Fixes (Quality)
├─ 7. Fix ESLint Violations (#6)              ⏱️ 45 min
└─ 8. Update Tailwind Config Format (#7)      ⏱️ 30 min

Phase 4: Verification
├─ 9. Remove Build Error Ignores              ⏱️ 5 min
├─ 10. Full Type Check                        ⏱️ 5 min
├─ 11. Full Lint Check                        ⏱️ 5 min
└─ 12. Production Build Test                  ⏱️ 10 min
```

### Minimum Viable Fix (10 Minutes)

To get a working build immediately:
```bash
# Fix PostCSS (5 min)
cat > postcss.config.mjs << 'EOF'
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
export default config;
EOF

# Fix permissions and build (5 min)
sudo rm -rf .next
npm run build
```

**Result**: Build succeeds (with warnings), can deploy to production.

**Note**: TypeScript/ESLint errors still masked by config flags.

### Full Fix (3 Hours)

For production-ready code:
1. Complete Phase 1 (10 min) - Build works
2. Complete Phase 2 (110 min) - Type-safe
3. Complete Phase 3 (75 min) - Quality code
4. Complete Phase 4 (25 min) - Verified

**Total**: ~220 minutes (3.5 hours)

---

## 📋 Verification Checklist

### After Phase 1 (Critical Fixes)
```bash
# Build should succeed
npm run build
# ✅ Expected: Build completes successfully
# ⚠️ May show TypeScript warnings (masked by config)

# Clean build cache should work
rm -rf .next
# ✅ Expected: No permission denied errors

# Dev server should start
npm run dev
# ✅ Expected: Server starts on http://localhost:3000
```

### After Phase 2 (High-Priority Fixes)
```bash
# TypeScript check should pass
npx tsc --noEmit
# ✅ Expected: 0 errors

# No lockfile warnings
npm run build 2>&1 | grep -i "lockfile"
# ✅ Expected: No warnings about multiple lockfiles

# React types aligned
npm list @types/react @types/react-dom
# ✅ Expected: Both show same major version as react/react-dom
```

### After Phase 3 (Medium-Priority Fixes)
```bash
# Lint should pass
npm run lint
# ✅ Expected: 0 errors, minimal warnings

# Build without error suppression
# Remove ignoreBuildErrors and ignoreDuringBuilds from next.config.ts
npm run build
# ✅ Expected: Build succeeds without masking errors
```

### After Phase 4 (Verification)
```bash
# Full production build
NODE_ENV=production npm run build
# ✅ Expected: Successful build, no errors

# Bundle size check
du -sh .next
# ✅ Expected: Reasonable size (< 100MB typical)

# Start production server
npm run start
# ✅ Expected: Starts without errors
```

---

## 🎯 Success Metrics

### Build Health
- [ ] `npm run build` succeeds without errors
- [ ] `npm run dev` starts successfully
- [ ] `.next/` directory has correct permissions
- [ ] No PostCSS/Tailwind errors
- [ ] No lockfile warnings

### Type Safety
- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] React types match runtime version
- [ ] All route params properly typed as Promise
- [ ] No `ignoreBuildErrors` needed

### Code Quality
- [ ] `npm run lint` shows 0 errors
- [ ] No explicit `any` types in code
- [ ] All JSX entities properly escaped
- [ ] No unused variables
- [ ] No `ignoreDuringBuilds` needed

### Production Readiness
- [ ] Production build succeeds
- [ ] All critical routes functional
- [ ] Authentication flow works
- [ ] Dashboard loads without errors
- [ ] API routes respond correctly

---

## 📊 Risk Matrix

| Issue | Severity | Fix Time | Risk | Dependencies |
|-------|----------|----------|------|--------------|
| #1 PostCSS Config | 🔴 Critical | 5 min | 🟢 Low | None |
| #2 File Permissions | 🟡 High | 2 min | 🟢 Low | None |
| #3 Async Params | 🟡 High | 90 min | 🟡 Medium | #1, #2 |
| #4 Multiple Lockfiles | 🟡 Medium | 10 min | 🟢 Low | None |
| #5 React Types | 🟢 Medium | 5 min | 🟢 Low | None |
| #6 ESLint Violations | 🟢 Medium | 45 min | 🟢 Low | #3 |
| #7 Tailwind Config | 🟢 Low | 30 min | 🟢 Low | #1 |

---

## 🚀 Quick Start Commands

### Minimum Viable Fix (Get Build Working)
```bash
# Fix PostCSS configuration
cat > postcss.config.mjs << 'EOF'
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
export default config;
EOF

# Clean and build
sudo rm -rf .next
npm run build

# Expected: Build succeeds ✅
```

### Full Fix (Production Ready)
```bash
# 1. Critical fixes (Phase 1)
./scripts/fix-postcss.sh
./scripts/fix-permissions.sh

# 2. High-priority fixes (Phase 2)
./scripts/fix-async-params.sh  # Updates 20+ files
npm install --save-dev @types/react@18 @types/react-dom@18

# 3. Quality fixes (Phase 3)
./scripts/fix-eslint.sh

# 4. Verify
npx tsc --noEmit
npm run lint
npm run build

# Expected: All checks pass ✅
```

---

## 📚 Additional Resources

### Documentation
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Tailwind CSS v4 Migration](https://tailwindcss.com/docs/upgrade-guide)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

### Internal Docs
- `MIGRATION_REPAIR_PLAN.md` - Detailed migration guide
- `MIGRATION_COMPLETE.md` - Migration history
- `PROJECT_INDEX.md` - Codebase structure

### Related Files
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration (FIX REQUIRED)
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `tailwind.config.js` - Tailwind configuration

---

## 🆘 Troubleshooting

### Build Still Fails After PostCSS Fix

**Symptoms**: Different error after fixing postcss.config.mjs

**Possible Causes**:
1. TypeScript errors (if `ignoreBuildErrors: false`)
2. Missing dependencies
3. Cached build artifacts

**Solutions**:
```bash
# Clear all caches
sudo rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### TypeScript Errors After Async Params Fix

**Symptoms**: Still seeing type errors after updating route files

**Possible Causes**:
1. Missed some dynamic routes
2. Incorrect await syntax
3. Cache not cleared

**Solutions**:
```bash
# Find remaining dynamic routes
grep -r "{ params }:" app/api/ app/dashboard/ | grep -v "Promise"

# Clear TypeScript cache
rm -rf .next/types
npx tsc --noEmit
```

### ESLint Errors After Fixes

**Symptoms**: More errors after fixing some ESLint issues

**Possible Causes**:
1. ESLint cache
2. New errors revealed by fixes
3. Config changes needed

**Solutions**:
```bash
# Clear ESLint cache
rm -rf .next
npm run lint -- --no-cache

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 📝 Notes

### Why Build Currently "Works"

The build is configured to **ignore errors**:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ⚠️ Ignores ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true,   // ⚠️ Ignores TypeScript errors
  },
};
```

**This is dangerous** because:
- Type errors can cause runtime bugs
- ESLint errors indicate code quality issues
- Hidden problems will surface in production

**Recommendation**: Fix all issues, then remove these flags.

### Migration Status

✅ **Complete**:
- Vite → Next.js 15 structure
- 170 components migrated
- Flask backend integration
- Authentication with NextAuth v5
- Prisma ORM setup
- HeroUI + Radix UI components
- Tailwind CSS v4 installed

⚠️ **Incomplete**:
- PostCSS v4 configuration
- Next.js 15 async params migration
- Build error suppression removal
- Type safety full verification
- Code quality cleanup

---

**END OF BLOCKING ISSUES REPORT**
