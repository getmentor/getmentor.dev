# TypeScript Migration Plan for GetMentor.dev

## Overview

**Scope**: Migrate 54 JavaScript files to TypeScript with strict mode
**Approach**: Big-bang migration in a single feature branch
**Key Changes**: Full type system, library replacements, code reorganization

---

## Phase 1: Pre-Migration Setup

### 1.1 Create Feature Branch
```bash
git checkout -b feature/typescript-migration
```

### 1.2 Create tsconfig.json
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/types/*": ["./src/types/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/config/*": ["./src/config/*"],
      "@/server/*": ["./src/server/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.3 Update Dependencies

**Add to devDependencies:**
```bash
yarn add -D @types/node@^22 @types/react@^19 @types/react-dom@^19 @types/sanitize-html@^2.13 @types/cors@^2.8 typescript-eslint@^8
```

**Upgrade TypeScript:**
```bash
yarn add -D typescript@^5.6
```

**Add react-select (replacement for multiselect-react-dropdown):**
```bash
yarn add react-select@^5.8
```

**Remove deprecated libraries:**
```bash
yarn remove multiselect-react-dropdown interweave interweave-ssr rc-dropdown
```

### 1.4 Update ESLint Configuration
Update `eslint.config.js` to add TypeScript support with `typescript-eslint` parser and plugin.

### 1.5 Update lint-staged
In `package.json`, change:
```json
"lint-staged": {
  "*.{ts,tsx}": ["prettier --write", "eslint --fix"]
}
```

---

## Phase 2: Create Type System

### 2.1 New Directory Structure
```
src/types/
  index.ts          # Barrel export
  mentor.ts         # Mentor domain types
  api.ts            # API request/response types
  filters.ts        # Filter configuration types
  components.ts     # Component prop types
  config.ts         # Configuration types
  env.d.ts          # Environment variable types
  global.d.ts       # Global augmentations
```

### 2.2 Core Type Definitions

**`src/types/mentor.ts`** - Key types:
- `CalendarType`: 'calendly' | 'koalendar' | 'calendlab' | 'url' | 'none'
- `ExperienceLevel`: '2-5' | '5-10' | '10+'
- `MentorBase`: Core mentor data structure
- `MentorWithSecureFields`: Mentor with authToken/calendarUrl
- `MentorListItem`: Mentor for list views (optional long fields)

**`src/types/api.ts`** - Key types:
- `GetAllMentorsParams`, `GetOneMentorParams`
- `ContactMentorRequest/Response`
- `SaveProfileRequest/Response`
- `UploadProfilePictureRequest/Response`
- `HttpError` class

**`src/types/filters.ts`** - Key types:
- `FiltersConfig`: Filter configuration object shape
- `AppliedFilters`: Filter state from useMentors hook
- `UseMentorsReturn`: Tuple return type [mentors, searchInput, hasMore, setSearch, showMore, filters]

**`src/types/components.ts`** - Props for all components

**`src/types/env.d.ts`** - ProcessEnv augmentation for all environment variables

---

## Phase 3: Library Replacements

### 3.1 multiselect-react-dropdown → react-select
**File**: `src/components/forms/ProfileForm.tsx`

Replace Multiselect component with:
```typescript
import Select, { MultiValue, StylesConfig } from 'react-select'

interface TagOption { value: string; label: string }

<Select<TagOption, true>
  isMulti
  value={selectedOptions}
  onChange={(newValue: MultiValue<TagOption>) => {
    field.onChange(newValue.map((opt) => opt.value))
  }}
  options={tagOptions}
  closeMenuOnSelect={false}
/>
```

### 3.2 interweave → Custom HtmlContent Component
**New file**: `src/components/ui/HtmlContent.tsx`

Use existing `sanitize-html` library (already in project) instead of interweave:
```typescript
import sanitizeHtml from 'sanitize-html'

export function HtmlContent({ content, className }: HtmlContentProps): JSX.Element {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
}
```

### 3.3 rc-dropdown → @headlessui/react Menu
**File**: `src/components/mentors/FilterGroupDropdown.tsx`

Replace rc-dropdown with @headlessui/react Menu component (already installed).

---

## Phase 4: Code Reorganization

### 4.1 New Folder Structure
```
src/
  types/                    # Type definitions (NEW)
  components/
    index.ts               # Barrel export (NEW)
    ui/                    # Presentational (NEW subfolder)
      Section.tsx
      Notification.tsx
      HtmlContent.tsx      # NEW (replaces interweave)
    forms/                 # Form components (NEW subfolder)
      ProfileForm.tsx
      ContactMentorForm.tsx
      Wysiwyg.tsx
    layout/                # Layout (NEW subfolder)
      NavHeader.tsx
      Footer.tsx
      MetaHeader.tsx
    mentors/               # Mentor-specific (NEW subfolder)
      MentorsList.tsx
      MentorsFilters.tsx
      MentorsSearch.tsx
      FilterGroupDropdown.tsx
    calendar/              # Calendar widgets (NEW subfolder)
      Koalendar.tsx
      CalendlabWidget.tsx
    hooks/                 # Custom hooks (NEW subfolder)
      useMentors.ts
  lib/
    index.ts               # Barrel export (NEW)
    api/go-api-client.ts
    observability/         # Logger, metrics, etc. (NEW subfolder)
    utils/                 # Utilities (NEW subfolder)
  config/
    index.ts               # Barrel export (NEW)
  server/
    index.ts               # Barrel export (NEW)
  pages/                   # Keep flat (Next.js routing)
```

### 4.2 File Naming
- `.ts` - TypeScript without JSX (utils, types, API routes)
- `.tsx` - TypeScript with JSX (components, pages with UI)

---

## Phase 5: Migration Order

### Day 1: Foundation
1. **Types** (create all type definitions first)
   - `src/types/mentor.ts`
   - `src/types/api.ts`
   - `src/types/filters.ts`
   - `src/types/components.ts`
   - `src/types/config.ts`
   - `src/types/env.d.ts`
   - `src/types/global.d.ts`
   - `src/types/index.ts`

2. **Config files**
   - `src/config/filters.ts`
   - `src/config/seo.ts`
   - `src/config/constants.ts`
   - `src/config/donates.ts`

### Day 1-2: Core Libraries
3. **Utilities** (14 files in src/lib/)
   - `src/lib/pluralize.ts`
   - `src/lib/entities.ts`
   - `src/lib/html-content.ts`
   - `src/lib/analytics.ts`
   - `src/lib/azure-image-loader.ts`
   - `src/lib/logger.ts`
   - `src/lib/metrics.ts`
   - `src/lib/with-observability.ts`
   - `src/lib/go-api-client.ts`
   - ... (remaining lib files)

4. **Server data layer**
   - `src/server/mentors-data.ts`

### Day 2-3: Components
5. **Base UI components** (15 files)
   - Section, Notification, HtmlContent (new)
   - MetaHeader, NavHeader, Footer
   - Koalendar, CalendlabWidget
   - Wysiwyg
   - ContactMentorForm
   - **ProfileForm** (complex, react-select migration)
   - **FilterGroupDropdown** (headlessui migration)
   - MentorsSearch, MentorsFilters, MentorsList
   - **useMentors** (complex tuple return)

### Day 3: API Routes
6. **API routes** (5 files)
   - `src/pages/api/healthcheck.ts`
   - `src/pages/api/metrics.ts`
   - `src/pages/api/contact-mentor.ts`
   - `src/pages/api/save-profile.ts`
   - `src/pages/api/upload-profile-picture.ts`

### Day 3-4: Pages
7. **Static pages**
   - `_document.tsx`, `_app.tsx`
   - disclaimer, privacy, bementor, donate, ontico

8. **Dynamic pages**
   - `index.tsx` (homepage)
   - `mentor/[slug]/index.tsx`
   - `mentor/[slug]/contact.tsx`
   - `profile.tsx`
   - `sitemap.xml.tsx`

9. **Instrumentation**
   - `src/instrumentation.ts`

---

## Phase 6: Validation & Testing

### 6.1 Build Verification
```bash
rm -rf .next node_modules/.cache
npx tsc --noEmit        # Type check
yarn lint               # Lint check
yarn build              # Production build
```

### 6.2 Runtime Testing
```bash
yarn dev
# Test pages:
curl http://localhost:3000/                    # Homepage
curl http://localhost:3000/mentor/{slug}       # Mentor detail
curl http://localhost:3000/api/healthcheck     # API health
```

### 6.3 Docker Validation
```bash
./docker-build-test.sh
docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test
curl http://localhost:3000/api/healthcheck
```

---

## Phase 7: Post-Migration

1. **Update CLAUDE.md** with TypeScript conventions
2. **Commit and push** to feature branch
3. **Request PR review** (do not merge without approval)

---

## Critical Files (High Complexity)

| File | Size | Complexity | Notes |
|------|------|------------|-------|
| `src/components/ProfileForm.js` | 21KB | High | react-select migration, FileReader callbacks |
| `src/components/useMentors.js` | 4KB | High | Tuple return with 6 mixed types |
| `src/lib/go-api-client.js` | 6KB | Medium | Class with custom errors |
| `src/lib/http-log-transport.js` | 3KB | Medium | Winston Transport class extension |
| `src/components/FilterGroupDropdown.js` | 4KB | Medium | @headlessui/react migration |
| `src/config/filters.js` | 3KB | Medium | Deeply nested config objects |

---

## Rollback Strategy

**Before starting:**
```bash
git checkout -b backup/pre-typescript-migration
git push origin backup/pre-typescript-migration
```

**If migration fails:**
```bash
git checkout main
git branch -D feature/typescript-migration
```

---

## Potential Failure Points

1. **Symbol-based secure fields** → Go API returns regular properties, no Symbol handling needed
2. **Next.js getServerSideProps** → Use `GetServerSideProps<Props>` generic type
3. **Environment variables in next.config.js** → Keep as .js, use fallbacks
4. **Winston Transport class** → Needs proper TypeScript class extension
5. **react-hook-form Controller** → Use generic `useForm<FormData>()`

---

## Summary

- **54 files** to migrate
- **3 libraries** to replace (multiselect-react-dropdown, interweave, rc-dropdown)
- **~15 type definition files** to create
- **Estimated effort**: 3-4 days for complete migration
- **Risk level**: Medium (big-bang approach, but well-planned)

---

## Progress log (Dec 9 session)

- Added `HtmlContent` component and replaced interweave usage on mentor page.
- Migrated remaining JS pages and instrumentation to TS/TSX (`_app`, `_document`, `index`, mentor detail/contact, profile, static pages, sitemap, mentors_aikb, ontico), updated imports to path aliases, and typed SSR handlers with observability wrapper.
- Fixed observability/tracing typings (`with-ssr-observability`, `tracing-server`, `with-observability`) and JSX/global typings (JSX namespace via React imports); adjusted hook ordering in `profile.tsx`, react-select URL validation, headlessui dropdown.
- Added Jest + Testing Library + node-mocks-http setup (`jest.config.mjs`, `jest.setup.ts`, `yarn test` script) and third-party type stubs.
- Implemented tests:
  - `src/lib/__tests__/html-content.test.ts` (sanitization/link hardening/paragraph wrapping)
  - `src/components/__tests__/useMentors.test.tsx` (search/tags/experience/price filters, new/noSessions, pagination)
  - `src/pages/api/__tests__/healthcheck.test.ts` (200 + cache headers; logging mocked)
- `npx tsc --noEmit` passes. `yarn test` passes on Node 22.x (engine enforced; switch local env accordingly).

### Dec 9 (final review session)

- Moved API tests from `src/pages/api/__tests__/` to `src/__tests__/pages/api/` to fix Next.js build treating them as API routes
- All validation passes:

### Dec 9 (code reorganization)

- Reorganized components into subdirectories:
  - `ui/` - Section, Notification, HtmlContent
  - `forms/` - ProfileForm, ContactMentorForm, Wysiwyg
  - `layout/` - NavHeader, Footer, MetaHeader + NavHeader.module.css
  - `mentors/` - MentorsList, MentorsFilters, MentorsSearch, FilterGroupDropdown
  - `calendar/` - Koalendar, CalendlabWidget
  - `hooks/` - useMentors + __tests__/
- Updated barrel export in `components/index.ts` to re-export from subdirectories
- All existing imports via `@/components` continue to work (no changes needed in pages)
- All validation passes:
  - `npx tsc --noEmit` ✓
  - `yarn lint` ✓
  - `yarn test` ✓ (3 test suites, 7 tests)
  - `yarn build` ✓

### Dec 9 (comprehensive tests)

- Added API route tests:
  - `src/__tests__/pages/api/contact-mentor.test.ts` (3 tests)
  - `src/__tests__/pages/api/save-profile.test.ts` (6 tests)
  - `src/__tests__/pages/api/upload-profile-picture.test.ts` (5 tests)
- Added server tests:
  - `src/__tests__/server/mentors-data.test.ts` (12 tests for all CRUD operations)
- Added component tests:
  - `src/__tests__/components/MentorsList.test.tsx` (10 tests)
  - `src/__tests__/components/ContactMentorForm.test.tsx` (9 tests)
- All validation passes:
  - `npx tsc --noEmit` ✓
  - `yarn lint` ✓
  - `yarn test` ✓ (9 test suites, 52 tests)
  - `yarn build` ✓
  - Docker build ✓

---

## Migration Status: COMPLETE ✓

### Final Statistics
- **71 TypeScript files** (43 `.ts` + 28 `.tsx`)
- **0 JavaScript files** remaining in `src/`
- **6,733 total lines** of TypeScript code
- **9 type definition files** in `src/types/`
- **9 test suites** with **52 tests**

### What Was Accomplished

1. **Full TypeScript Migration**
   - All 54+ source files converted from `.js`/`.jsx` to `.ts`/`.tsx`
   - Strict mode enabled with all strict flags
   - Path aliases configured (`@/types`, `@/components`, `@/lib`, `@/config`, `@/server`)

2. **Library Replacements**
   - `multiselect-react-dropdown` → `react-select` (ProfileForm)
   - `interweave` + `interweave-ssr` → custom `HtmlContent` component using `sanitize-html`
   - `rc-dropdown` → `@headlessui/react` Menu (FilterGroupDropdown)

3. **Type System**
   - `src/types/mentor.ts` - Mentor domain types with proper union types
   - `src/types/api.ts` - API request/response types, HttpError class
   - `src/types/filters.ts` - Filter configuration and state types
   - `src/types/components.ts` - Component prop interfaces
   - `src/types/config.ts` - Configuration object types
   - `src/types/env.d.ts` - ProcessEnv augmentation
   - `src/types/global.d.ts` - Global type augmentations
   - `src/types/third-party.d.ts` - Third-party module stubs

4. **Testing Infrastructure**
   - Jest configured with Next.js integration
   - Testing Library for React components
   - node-mocks-http for API route testing
   - Tests for: html-content sanitization, useMentors hook, healthcheck API

5. **Build Validation**
   - TypeScript strict compilation passes
   - ESLint with typescript-eslint passes
   - Next.js production build succeeds
   - Docker multi-stage build succeeds

### Remaining Items (Nice to Have)

1. **Code Reorganization** ✓ COMPLETED
   - Components organized into subfolders: `ui/`, `forms/`, `layout/`, `mentors/`, `calendar/`, `hooks/`
   - Barrel export updated to re-export from subdirectories
   - All imports updated and validated

2. **Additional Tests** ✓ COMPLETED
   - API routes: contact-mentor, save-profile, upload-profile-picture (15 tests)
   - Server: mentors-data functions (12 tests)
   - Components: MentorsList, ContactMentorForm (16 tests)
   - Total: 52 tests across 9 test suites
   - Remaining: Integration tests with MSW, ProfileForm tests

3. **Documentation Updates**
   - Update CLAUDE.md with TypeScript conventions
   - Add JSDoc comments to exported functions
   - Generate API documentation from types
