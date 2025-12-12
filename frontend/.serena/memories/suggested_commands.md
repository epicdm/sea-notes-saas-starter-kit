# Suggested Development Commands

## Daily Development

### Start Development Server
```bash
npm run dev
# Starts Next.js development server on http://localhost:3000
# Hot reload enabled
```

### Build for Production
```bash
npm run build
# Creates optimized production build
# Checks TypeScript and ESLint
```

### Start Production Server
```bash
npm run start
# Runs production build locally
# Must run `npm run build` first
```

## Code Quality

### Linting
```bash
npm run lint
# Checks code with ESLint

npm run lint -- --fix
# Auto-fixes ESLint issues
```

### Type Checking
```bash
npx tsc --noEmit
# Type-check without building
# Shows all TypeScript errors
```

## Testing

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Install Playwright browsers (first time only)
npx playwright install
```

### Individual Test Files
```bash
# Run specific test file
npx playwright test e2e/agent-creation.spec.ts

# Run with specific browser
npx playwright test --project=chromium
```

## Database (Prisma)

### Generate Prisma Client
```bash
npx prisma generate
# Regenerate Prisma client after schema changes
```

### Database Migrations
```bash
npx prisma migrate dev
# Create and apply migration in development

npx prisma migrate deploy
# Apply migrations in production
```

### Database Studio
```bash
npx prisma studio
# Opens Prisma Studio GUI (http://localhost:5555)
```

### Reset Database
```bash
npx prisma migrate reset
# CAUTION: Drops database and reapplies all migrations
```

## Performance & Auditing

### Lighthouse Audit
```bash
# Install Lighthouse CLI (one-time)
npm install -g lighthouse

# Run audit on dashboard
lighthouse http://localhost:3000/dashboard --view

# Audit specific pages
lighthouse http://localhost:3000/dashboard/agents --view
lighthouse http://localhost:3000/dashboard/phone-numbers --view
```

### Bundle Analysis
```bash
# Analyze bundle size
npx @next/bundle-analyzer
# Creates .next/analyze/ with reports
```

## Git Commands (Linux)

### Standard Git Operations
```bash
git status                    # Check working tree status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch        # Push to remote
git pull origin branch        # Pull from remote
git checkout -b feature/name  # Create new branch
git branch                    # List branches
git log --oneline             # View commit history
```

### File Operations
```bash
ls -la                        # List all files (including hidden)
cd path/to/directory          # Change directory
pwd                           # Print working directory
find . -name "*.tsx"          # Find TypeScript files
grep -r "search term" .       # Search in files
```

## Package Management

### Install Dependencies
```bash
npm install
# Installs all dependencies from package.json

npm install package-name
# Install new package

npm install --save-dev package-name
# Install dev dependency
```

### Update Dependencies
```bash
npm outdated
# Check for outdated packages

npm update
# Update all packages (respects semver)
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
# Fresh install of all dependencies
```

## Environment Setup

### Check Environment Variables
```bash
cat .env
# View environment variables

# Copy example env file
cp .env.example .env
```

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Troubleshooting

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Fix Type Errors
```bash
npx tsc --noEmit
# Shows all TypeScript errors
```

### Check Port Usage
```bash
lsof -i :3000
# Check if port 3000 is in use

kill -9 PID
# Kill process using the port
```

## Quick Reference

### Most Used Commands
```bash
npm run dev              # Start development
npm run lint -- --fix    # Fix linting issues
npm run test:e2e         # Run E2E tests
npm run build            # Build for production
npx tsc --noEmit         # Check types
```

### Before Committing
```bash
npm run lint             # Check for lint errors
npx tsc --noEmit        # Check for type errors
npm run test:e2e        # Run E2E tests
npm run build           # Ensure production build works
```
