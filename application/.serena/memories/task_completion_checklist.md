# Task Completion Checklist

## Before Starting Any Task

- [ ] Understand the requirements clearly
- [ ] Check if there are existing patterns to follow
- [ ] Review related documentation (QUICK_REFERENCE.md, etc.)
- [ ] Ensure development server is running (`npm run dev`)

## During Development

### Code Quality
- [ ] Follow TypeScript strict mode (no `any` types)
- [ ] Use proper naming conventions (see code_style_and_conventions.md)
- [ ] Add JSDoc comments for exported functions/components
- [ ] Handle errors with try-catch blocks
- [ ] Show loading states for async operations
- [ ] Display user-friendly error messages
- [ ] Use toast notifications for feedback

### Component Development
- [ ] Create reusable components when possible
- [ ] Use HeroUI components for consistency
- [ ] Implement responsive design (mobile-first)
- [ ] Add proper TypeScript types for props
- [ ] Use custom hooks for data fetching
- [ ] Implement error boundaries for page-level components
- [ ] Show skeleton loaders during data loading
- [ ] Display empty states for zero data

### Form Development
- [ ] Use React Hook Form with Zod validation
- [ ] Validate on submit
- [ ] Show field-level error messages
- [ ] Disable submit during loading
- [ ] Clear form after successful submission
- [ ] Display success/error toast notifications

### API Integration
- [ ] Use the centralized API client (`lib/api-client.ts`)
- [ ] Handle all error cases (network, timeout, validation, auth)
- [ ] Show loading indicators during API calls
- [ ] Refresh data after mutations
- [ ] Implement retry logic for failed requests

## After Completing Code

### Testing
- [ ] Run linter: `npm run lint`
- [ ] Fix linting errors: `npm run lint -- --fix`
- [ ] Check TypeScript: `npx tsc --noEmit`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Manual testing in browser
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test with different user scenarios
- [ ] Verify zero console errors

### Accessibility
- [ ] Add alt text to all images
- [ ] Add aria-labels to icon-only buttons
- [ ] Ensure proper heading hierarchy
- [ ] Test keyboard navigation (Tab through all elements)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios

### Performance
- [ ] Check bundle size impact
- [ ] Optimize images (use next/image)
- [ ] Implement code splitting if needed
- [ ] Add lazy loading for heavy components
- [ ] Verify no unnecessary re-renders

### Documentation
- [ ] Update component documentation
- [ ] Add code comments for complex logic
- [ ] Update README if adding new features
- [ ] Document any new environment variables
- [ ] Update QUICK_REFERENCE.md if needed

### Security
- [ ] No hardcoded credentials or secrets
- [ ] Validate all user inputs (client + server)
- [ ] Use environment variables for sensitive data
- [ ] Ensure data is scoped by user_id
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSRF protection

## Before Committing

### Final Checks
- [ ] Remove console.log statements
- [ ] Remove commented-out code
- [ ] Remove unused imports
- [ ] Remove TODO/FIXME comments (move to issues)
- [ ] Ensure code follows project conventions
- [ ] No merge conflicts
- [ ] Branch is up to date with base branch

### Quality Validation
- [ ] `npm run lint` passes with zero errors
- [ ] `npx tsc --noEmit` shows no type errors
- [ ] `npm run build` completes successfully
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Manual smoke test completed
- [ ] No console errors during testing

### Git Workflow
```bash
# 1. Check status
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: description of changes"

# 4. Push to remote
git push origin branch-name

# 5. Create pull request (if applicable)
```

## After Deployment

### Production Validation
- [ ] Verify deployment succeeded
- [ ] Check application loads correctly
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify database migrations applied
- [ ] Test authentication works
- [ ] Verify API endpoints respond correctly

### Monitoring
- [ ] Check error tracking (Sentry, etc.)
- [ ] Monitor application logs
- [ ] Verify analytics tracking
- [ ] Check performance metrics
- [ ] Monitor user feedback

## Common Commands Checklist

```bash
# Start development
npm run dev

# Lint and fix
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# View console (during dev)
# Open browser DevTools (F12) → Console tab
```

## When Task is Complete

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Code reviewed (if team environment)
- [ ] Documentation updated
- [ ] Changes committed to version control
- [ ] Pull request created (if applicable)
- [ ] Stakeholders notified (if needed)

## Emergency Rollback

If critical issues found in production:
```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Deploy previous version
# (Follow deployment process)

# 3. Investigate and fix issues
# 4. Redeploy when fixed
```

## Reference Documents

When working on specific features:
- **Forms**: See QUICK_REFERENCE.md → Form Handling
- **Components**: See QUICK_REFERENCE.md → Component Library
- **API**: See QUICK_REFERENCE.md → API Client
- **Testing**: See QUICK_REFERENCE.md → Testing
- **Styling**: See QUICK_REFERENCE.md → Styling Guidelines
- **QA Process**: See NEXT_STEPS.md for comprehensive QA roadmap
