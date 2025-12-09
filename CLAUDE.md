# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GetMentor.dev is a **TypeScript** Next.js 16 frontend application for a mentor marketplace platform. The frontend delegates all data operations (Airtable, Azure Storage, email) to a separate Go API backend. Features include filtering, search, contact forms, and profile management.

## Development Commands

```bash
# Development
yarn dev                    # Start development server on http://localhost:3000

# Building
yarn build                  # Build Next.js app for production
yarn start                  # Start production server with memory limit (512MB)

# Code Quality
yarn lint                   # Run ESLint on src/ directory
yarn test                   # Run Jest tests
npx tsc --noEmit            # TypeScript type check
npx prettier --write <file> # Format files with Prettier

# Docker Development
./docker-build-test.sh      # Build Docker image with .env variables
docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test
```

## TypeScript Conventions

### File Extensions
- `.ts` - TypeScript without JSX (utils, types, API routes, hooks)
- `.tsx` - TypeScript with JSX (components, pages with UI)

### Path Aliases
Always use path aliases instead of relative imports:
```typescript
import { MentorListItem } from '@/types'
import { getAllMentors } from '@/server/mentors-data'
import { getGoApiClient } from '@/lib/go-api-client'
import { filters } from '@/config'
import { MentorsList, useMentors } from '@/components'
```

### Type Imports
Use `type` imports for type-only imports:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import type { MentorBase, MentorListItem } from '@/types'
```

### Core Types (src/types/)
- `MentorBase` - Core mentor data structure
- `MentorWithSecureFields` - Mentor with authToken/calendarUrl
- `MentorListItem` - Mentor for list views (optional long fields)
- `CalendarType` - 'calendly' | 'koalendar' | 'calendlab' | 'url' | 'none'
- `ExperienceLevel` - '2-5' | '5-10' | '10+'

### Strict Mode
TypeScript strict mode is enabled. All code must:
- Have explicit types for function parameters
- Handle null/undefined properly
- Avoid `any` types (use `unknown` if type is truly unknown)

## Project Structure

```
src/
├── types/                    # Type definitions
│   ├── index.ts              # Barrel export
│   ├── mentor.ts             # Mentor domain types
│   ├── api.ts                # API request/response types
│   ├── filters.ts            # Filter configuration types
│   ├── components.ts         # Component prop types
│   ├── config.ts             # Configuration types
│   └── env.d.ts              # Environment variable types
├── components/
│   ├── index.ts              # Barrel export
│   ├── ui/                   # Presentational components
│   │   ├── Section.tsx
│   │   ├── Notification.tsx
│   │   └── HtmlContent.tsx
│   ├── forms/                # Form components
│   │   ├── ProfileForm.tsx
│   │   ├── ContactMentorForm.tsx
│   │   └── Wysiwyg.tsx
│   ├── layout/               # Layout components
│   │   ├── NavHeader.tsx
│   │   ├── Footer.tsx
│   │   └── MetaHeader.tsx
│   ├── mentors/              # Mentor-specific components
│   │   ├── MentorsList.tsx
│   │   ├── MentorsFilters.tsx
│   │   ├── MentorsSearch.tsx
│   │   └── FilterGroupDropdown.tsx
│   ├── calendar/             # Calendar widgets
│   │   ├── Koalendar.tsx
│   │   └── CalendlabWidget.tsx
│   └── hooks/                # Custom hooks
│       └── useMentors.ts
├── lib/                      # Utilities and services
│   ├── index.ts              # Barrel export
│   ├── go-api-client.ts      # Go API HTTP client
│   ├── logger.ts             # Winston logger
│   ├── metrics.ts            # Prometheus metrics
│   └── ...
├── config/                   # Configuration
│   ├── index.ts              # Barrel export
│   ├── filters.ts
│   └── seo.ts
├── server/                   # Server-side data access
│   ├── index.ts              # Barrel export
│   └── mentors-data.ts
├── pages/                    # Next.js pages (flat structure)
│   ├── api/                  # API routes
│   └── ...
└── __tests__/                # Test files
    ├── components/
    ├── pages/api/
    └── server/
```

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_GO_API_URL` - Go API backend URL (default: http://localhost:8081)
- `GO_API_INTERNAL_TOKEN` - Internal API authentication token
- `NEXT_PUBLIC_AZURE_STORAGE_DOMAIN` - Azure domain for image URLs
- `NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY` - ReCAPTCHA site key
- `METRICS_AUTH_TOKEN` - Bearer token for /api/metrics endpoint
- `LOG_LEVEL` - Logging level (debug/info/warn/error, default: info)

## Architecture

### Data Flow
```
Browser → Next.js Pages/API Routes → Go API Backend → Airtable/Azure/Email
```

All data operations are handled by the Go API backend. The Next.js frontend is a thin client.

### API Routes (`src/pages/api/`)
All routes proxy to Go API:
- `/api/contact-mentor` - Contact form submission
- `/api/save-profile` - Mentor profile updates (requires auth headers)
- `/api/upload-profile-picture` - Profile picture upload (requires auth headers)
- `/api/healthcheck` - Health check endpoint
- `/api/metrics` - Prometheus metrics (secured with bearer token)

## Common Patterns

### Fetching Mentors Server-Side
```typescript
import { getAllMentors, getOneMentorBySlug } from '@/server/mentors-data'
import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const mentors = await getAllMentors({ onlyVisible: true })
  const mentor = await getOneMentorBySlug(params?.slug as string, { showHiddenFields: true })
  return { props: { mentors, mentor } }
}
```

### Go API Client
```typescript
import { getGoApiClient } from '@/lib/go-api-client'

const client = getGoApiClient()
const data = await client.getAllMentors({ onlyVisible: true })
```

### API Route with Observability
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { withObservability } from '@/lib/with-observability'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // handler logic
}

export default withObservability(handler)
```

### Component Props
```typescript
interface MentorsListProps {
  mentors: MentorListItem[]
  hasMore: boolean
  onClickMore: () => void
}

export default function MentorsList({ mentors, hasMore, onClickMore }: MentorsListProps): JSX.Element {
  // component logic
}
```

## Testing

### Running Tests
```bash
yarn test           # Run all tests
yarn test --watch   # Watch mode
yarn test --coverage # With coverage
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/           # Component tests
│   │   ├── MentorsList.test.tsx
│   │   └── ContactMentorForm.test.tsx
│   ├── pages/api/            # API route tests
│   │   ├── healthcheck.test.ts
│   │   ├── contact-mentor.test.ts
│   │   ├── save-profile.test.ts
│   │   └── upload-profile-picture.test.ts
│   └── server/               # Server function tests
│       └── mentors-data.test.ts
├── components/hooks/__tests__/
│   └── useMentors.test.tsx
└── lib/__tests__/
    └── html-content.test.ts
```

### Writing Tests
- Use `@testing-library/react` for component tests
- Use `node-mocks-http` for API route tests
- Mock external dependencies (Go API client, ReCAPTCHA, etc.)
- Wrap state updates in `act()` for async operations

### CI/CD
GitHub Actions runs on push to main and PRs:
1. **test** job: ESLint, TypeScript type check, Jest tests
2. **build** job: Production build (runs after test passes)

## Ways of Working

### Git Flow
For every new feature, create a separate Git branch. You may commit and push to that branch but never merge to main without explicit permission.

### Before Committing
```bash
yarn lint           # Check for lint errors
npx tsc --noEmit    # Check for type errors
yarn test           # Run tests
yarn build          # Verify build works
```

### Node Version
- **Required**: Node 22.x (specified in package.json engines)
- Docker uses `node:22.21.1-alpine3.22`

## Misc

DO NOT CREATE .md files with summaries of your job runs.
