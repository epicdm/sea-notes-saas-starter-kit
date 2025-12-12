# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Module**: ESNext (bundler resolution)
- **Strict mode**: Enabled
- **Path aliases**: `@/*` maps to project root
- **JSX**: Preserve (Next.js handles compilation)

## File Organization
- **Components**: `/components/` (categorized by feature)
- **Pages**: `/app/` (Next.js App Router structure)
- **Utilities**: `/lib/` and `/utils/`
- **Types**: `/types/`
- **Hooks**: `/hooks/`
- **API Routes**: `/app/api/`
- **Schemas**: `/lib/schemas/`

## Naming Conventions
- **Components**: PascalCase (e.g., `AgentCard.tsx`, `AgentWizardStep1.tsx`)
- **Files**: kebab-case for utilities (e.g., `api-client.ts`, `agent-templates.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAgents`, `usePhoneNumbers`)
- **Types/Interfaces**: PascalCase (e.g., `Agent`, `PhoneNumber`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase

## Component Structure
```typescript
// 1. Imports (React, libraries, local)
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Component definition
export function ComponentName({ title, onSubmit }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleClick = () => { ... };
  
  // 6. Render
  return ( ... );
}
```

## React Patterns

### Page Structure
- Use Error Boundaries for page-level components
- Separate data fetching (Content component) from layout (Page component)
- Show loading states with Skeleton components
- Show empty states for zero data
- Handle errors with ErrorState component

### Form Handling
- Use React Hook Form with Zod resolver
- Validate on submit
- Show field-level errors
- Display toast notifications for success/error
- Disable submit during loading

### Modal Pattern
- Control with `showModal` state
- Handle open/close/success callbacks
- Refresh data after successful operations
- Clear state on close

## Styling Guidelines
- **Tailwind CSS**: Primary styling approach
- **Utility-first**: Use Tailwind utility classes
- **HeroUI components**: Use for consistent UI
- **Responsive**: Mobile-first approach (sm, md, lg, xl, 2xl breakpoints)
- **Colors**: Use semantic colors (primary, success, danger, warning)
- **Spacing**: Consistent spacing scale (p-4, mb-6, gap-3)

## Error Handling
- Always wrap API calls in try-catch
- Use toast notifications for user feedback
- Provide retry mechanisms for failed operations
- Log errors to console in development
- Show user-friendly error messages

## Security Practices
- No hardcoded credentials
- Use environment variables for sensitive data
- Validate all user inputs (client and server)
- Scope data by user_id (multi-tenant isolation)
- Use NextAuth for authentication

## Comments and Documentation
- JSDoc comments for exported functions/components
- Inline comments for complex logic
- Document props with TypeScript types
- Keep comments concise and meaningful

## Code Quality
- No console.log statements in production code
- No TODO/FIXME in production code (move to issues)
- Remove unused imports
- Use proper TypeScript types (avoid `any`)
- Follow ESLint rules (see eslint.config.mjs)
