# Testing Guide

## Test Framework
- **E2E Testing**: Playwright 1.56.1
- **Test Directory**: `/e2e/`
- **Test Configuration**: `playwright.config.ts`
- **Base URL**: http://localhost:3001

## Test Structure

### Existing E2E Tests
1. **agent-creation.spec.ts** - Agent wizard flow (3 steps)
2. **phone-provisioning.spec.ts** - Phone number provisioning and assignment
3. **dashboard-load.spec.ts** - Dashboard loading and statistics

## Running Tests

### Quick Start
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

### Individual Test Files
```bash
# Run specific test file
npx playwright test e2e/agent-creation.spec.ts

# Run specific browser
npx playwright test --project=chromium

# Run with trace
npx playwright test --trace on
```

### Test Reports
```bash
# View HTML report
npx playwright show-report

# Reports are generated in: test-results/
```

## Test Configuration

### Playwright Config
- **Parallel execution**: Enabled (fully parallel)
- **Retries**: 2 on CI, 0 locally
- **Reporter**: HTML
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Trace**: On first retry

### Browser Projects
- **Chromium**: Enabled (primary)
- **Firefox**: Disabled (commented out)
- **WebKit**: Disabled (commented out)
- **Mobile**: Disabled (commented out)

### Web Server Config
- **Command**: `npm run dev`
- **URL**: http://localhost:3001
- **Reuse Existing**: Yes (unless CI)

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('description of test', async ({ page }) => {
  // 1. Navigate to page
  await page.goto('/dashboard');
  
  // 2. Interact with page
  await page.click('button[aria-label="Create Agent"]');
  await page.fill('input[name="name"]', 'Test Agent');
  
  // 3. Assert expectations
  await expect(page.locator('h1')).toHaveText('Agent Created');
});
```

### Common Patterns

#### Wait for Navigation
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]')
]);
```

#### Wait for API Response
```typescript
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/user/agents')),
  page.click('button')
]);
```

#### Fill Form
```typescript
await page.fill('input[name="name"]', 'Agent Name');
await page.fill('textarea[name="description"]', 'Description');
await page.selectOption('select[name="voice"]', 'alloy');
```

#### Check Element Visibility
```typescript
await expect(page.locator('.agent-card')).toBeVisible();
await expect(page.locator('.error-message')).not.toBeVisible();
```

## Manual Testing

### Required Test Scenarios

#### 1. Agent Creation Flow
- [ ] Navigate to /dashboard/agents/new
- [ ] Step 1: Enter name and description
- [ ] Step 2: Configure instructions and voice
- [ ] Step 3: Advanced settings
- [ ] Submit and verify agent created
- [ ] Check no console errors

#### 2. Phone Number Flow
- [ ] Navigate to /dashboard/phone-numbers
- [ ] Click "Provision Phone Number"
- [ ] Select country and area code
- [ ] Submit and verify number provisioned
- [ ] Assign to agent
- [ ] Verify assignment successful

#### 3. Dashboard Loading
- [ ] Navigate to /dashboard
- [ ] Verify stats load (agents, phone numbers, calls)
- [ ] Check recent calls widget
- [ ] Verify no skeleton loaders stuck
- [ ] Check no console errors

#### 4. Call History
- [ ] Navigate to /dashboard/calls
- [ ] Verify call logs display
- [ ] Test filters (date range, status)
- [ ] Test pagination (if implemented)
- [ ] Check call details modal

#### 5. Settings
- [ ] Navigate to /dashboard/settings
- [ ] Update profile information
- [ ] Change timezone
- [ ] Verify changes saved
- [ ] Check success notification

### Browser Testing
Test on multiple browsers:
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive Testing
Test on different screen sizes:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)

### Performance Testing
```bash
# Lighthouse CLI
lighthouse http://localhost:3000/dashboard --view

# Target scores: ≥90 on all categories
# - Performance
# - Accessibility
# - Best Practices
# - SEO
```

## Error Handling Tests

### Network Errors
- [ ] Test with network offline
- [ ] Test with slow connection (throttling)
- [ ] Verify retry functionality
- [ ] Check error messages display

### Validation Errors
- [ ] Submit empty forms
- [ ] Submit invalid data
- [ ] Check field-level errors display
- [ ] Verify form doesn't submit

### Authentication Errors
- [ ] Test with expired token
- [ ] Test with invalid credentials
- [ ] Verify redirect to login
- [ ] Check 401 error handling

### API Errors
- [ ] Test 400 errors (validation)
- [ ] Test 500 errors (server error)
- [ ] Test timeout errors
- [ ] Verify error messages shown

## Accessibility Testing

### Automated Testing
```bash
# Install axe-core
npm install --save-dev @axe-core/playwright

# Run accessibility tests
npx playwright test --grep @a11y
```

### Manual Testing
- [ ] Keyboard navigation (Tab through all elements)
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Color contrast check
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Aria-labels on icon buttons
- [ ] Form labels present

### Tools
- axe DevTools (Chrome extension)
- WAVE (Chrome/Firefox extension)
- Lighthouse accessibility audit

## Test Data

### Prerequisites
- Backend server running on http://localhost:8000
- Database seeded with test data
- Test user account created

### Test User
```
Email: test@example.com
Password: testpassword123
```

### Cleanup
```bash
# Reset database after tests
npx prisma migrate reset

# Reseed test data
# (run backend seed script)
```

## Debugging Tests

### Interactive Mode
```bash
# Open Playwright UI
npm run test:e2e:ui

# Step through tests visually
# Set breakpoints
# Inspect DOM
```

### Debug Mode
```bash
# Run with debugger
npm run test:e2e:debug

# Or use --debug flag
npx playwright test --debug
```

### Trace Viewer
```bash
# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Screenshots
```bash
# Take screenshot during test
await page.screenshot({ path: 'screenshot.png' });

# Full page screenshot
await page.screenshot({ path: 'full.png', fullPage: true });
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Best Practices

### Do's
✅ Write descriptive test names
✅ Use data-testid attributes for stable selectors
✅ Wait for elements to be ready
✅ Clean up after tests
✅ Use page object model for complex flows
✅ Test critical user paths
✅ Run tests in CI/CD pipeline

### Don'ts
❌ Don't use fragile selectors (e.g., nth-child)
❌ Don't hardcode waits (use waitFor methods)
❌ Don't test implementation details
❌ Don't share state between tests
❌ Don't skip flaky tests (fix them)

## Test Coverage Goals

### Current Coverage
- E2E: 3 test files (critical paths)
- Unit: Not implemented yet
- Integration: Not implemented yet

### Target Coverage
- E2E: All critical user flows (≥80%)
- Unit: Component library (≥70%)
- Integration: API client (≥80%)

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Library](https://testing-library.com/react)

### Project Documentation
- QUICK_REFERENCE.md → Testing section
- NEXT_STEPS.md → Phase 1: Run All Tests
- tests/PHASE8_TESTING_CHECKLIST.md → Complete checklist
- tests/manual/error-handling-test-guide.md → Error scenarios
