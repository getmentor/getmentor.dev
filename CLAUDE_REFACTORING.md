# Frontend Code Review & Refactoring Report
**Date:** 2025-11-26
**Reviewer:** Claude Code (Staff Frontend Engineer Role)
**Project:** GetMentor.dev Next.js Application

## Executive Summary

This document contains findings from a comprehensive code review of the GetMentor.dev frontend codebase. The application is generally well-structured with good observability practices, security headers, and clean architecture. However, there are several maintainability and code quality issues that should be addressed to improve long-term health.

**Overall Assessment:** The codebase is production-ready but has technical debt that could impact maintainability. No critical security vulnerabilities were found (recent security hardening is evident).

---

## Issues Found

### Critical (Security/Breaking)

#### [CRITICAL-001] API Routes Missing Observability Instrumentation
- **Location:** `src/pages/api/contact-mentor.js`, `src/pages/api/save-profile.js`, `src/pages/api/upload-profile-picture.js`
- **Problem:** These API routes don't use the `withObservability` wrapper, meaning they lack metrics, logging, and error tracking that other routes have
- **Impact:** Blind spots in monitoring, harder to debug production issues, inconsistent observability coverage
- **Suggested fix:** Wrap handlers with `withObservability()` from `src/lib/with-observability.js`

#### [CRITICAL-002] console.error Used in Production API Routes
- **Location:**
  - `src/pages/api/contact-mentor.js:20`
  - `src/pages/api/save-profile.js:28`
  - `src/pages/profile.js:137, 190`
  - `src/pages/mentor/[slug]/contact.js:140`
- **Problem:** Using `console.error` instead of structured logger in production code
- **Impact:** Logs won't be collected by Grafana Alloy, missing structured metadata, harder to search/filter
- **Suggested fix:** Replace with `logger.error()` or `logError()` from `src/lib/logger.js`

### High (Maintainability Blockers)

#### [HIGH-001] Stale Closure in useEffect
- **Location:** `src/pages/mentor/[slug]/contact.js:56-86`
- **Problem:** `requestsToday` is a regular variable (line 55) but used inside useEffect without being in dependencies. The useEffect on line 81-86 uses stale closure
- **Impact:** The rate limiting logic may not work correctly - `requestsToday` will always be 0 inside the effect
- **Suggested fix:** Convert `requestsToday` to useState or refactor the rate limiting logic to read from localStorage inside the effect

#### [HIGH-002] Missing useEffect Dependencies
- **Location:**
  - `src/pages/mentor/[slug]/index.js:68` - empty array but uses `mentor` data
  - `src/pages/mentor/[slug]/contact.js:79` - empty array but uses `mentor` data
  - `src/components/MentorsFilters.js:32` - empty array but uses `appliedFilters`
  - `src/pages/profile.js:83` - empty array but uses `mentor` data
- **Problem:** useEffect hooks with empty dependency arrays that reference props/state
- **Impact:** Effects won't re-run when dependencies change, potential stale data issues, React warnings in development
- **Suggested fix:** Add proper dependencies or use eslint-disable comment if intentional run-once behavior

#### [HIGH-003] Deprecated process.browser Usage
- **Location:** `src/lib/analytics.js:3`
- **Problem:** `process.browser` is deprecated in Next.js and will be removed
- **Impact:** Code will break in future Next.js versions
- **Suggested fix:** Replace with `typeof window !== 'undefined'`

#### [HIGH-004] React Version Mismatch in ESLint Config
- **Location:** `.eslintrc.js:19`
- **Problem:** ESLint configured for React 17.0.2 but package.json uses React 18.3.1
- **Impact:** ESLint rules may not catch React 18-specific issues
- **Suggested fix:** Update to `version: '18.3.1'` or use `version: 'detect'`

#### [HIGH-005] Missing Error Boundaries
- **Location:** Application-wide (no error boundary components found)
- **Problem:** No React Error Boundaries to catch rendering errors
- **Impact:** Single component error can crash entire app, poor user experience
- **Suggested fix:** Add Error Boundary component and wrap top-level routes

### Medium (Code Quality)

#### [MED-001] Duplicate Analytics Event Properties
- **Location:**
  - `src/pages/mentor/[slug]/index.js:54-67`
  - `src/pages/mentor/[slug]/contact.js:66-78, 228-240, 289-301`
  - `src/pages/profile.js:76-82, 111-116`
- **Problem:** Analytics events send both new format ('Mentor Id', 'Mentor Name') and legacy format (id, name, experience, price)
- **Impact:** Duplicate data in analytics, wasted bandwidth, confusion about which properties to use
- **Suggested fix:** Remove legacy properties if no longer needed, or document why both are required

#### [MED-002] Commented-Out Code Should Be Removed
- **Location:**
  - `src/components/MentorsFilters.js:186-188` (commented ul tags)
  - `src/components/MentorsFilters.js:255-263` (commented tooltip)
  - `src/pages/_app.js:5, 12-14` (commented client tracing)
- **Problem:** Dead code clutters the codebase
- **Impact:** Reduces readability, creates confusion about intent
- **Suggested fix:** Remove if not needed, or uncomment if needed with explanation

#### [MED-003] Magic Numbers/Strings Should Be Constants
- **Location:**
  - `src/pages/mentor/[slug]/contact.js:51` - `MAX_REQUESTS_PER_DAY = 5`
  - `src/lib/go-api-client.js:23` - `timeout = 30000`
  - `src/lib/logger.js:40, 49` - `maxsize: 10485760`
  - `src/components/useMentors.js:4` - `pageSize = 48`
- **Problem:** Important values hardcoded inline
- **Impact:** Harder to maintain, easy to overlook when tuning, no single source of truth
- **Suggested fix:** Extract to config file or constants at top of file

#### [MED-004] Inconsistent Image Handling Patterns
- **Location:**
  - `src/pages/mentor/[slug]/index.js:108-112` (uses img tag)
  - `src/pages/mentor/[slug]/index.js:180` (uses img tag)
  - vs `src/pages/mentor/[slug]/contact.js:161-169` (uses Next.js Image)
- **Problem:** Mixing native `<img>` tags with Next.js `<Image>` component
- **Impact:** Inconsistent image optimization, some images won't benefit from Next.js optimizations
- **Suggested fix:** Standardize on Next.js `<Image>` component or document why native img is needed

#### [MED-005] Missing Response Status Check in Fetch Calls
- **Location:**
  - `src/pages/profile.js:129-138` (save profile)
  - `src/pages/profile.js:166-191` (upload image)
  - `src/pages/mentor/[slug]/contact.js:126-141` (contact mentor)
- **Problem:** fetch().then(res => res.json()) doesn't check if response is ok before parsing
- **Impact:** Will try to parse error responses as JSON, unhelpful error messages
- **Suggested fix:** Check `res.ok` before parsing, or throw on error status codes

#### [MED-006] Inconsistent Array Destructuring Pattern
- **Location:** `src/pages/index.js:62-63`
- **Problem:** Destructuring return value from custom hook with 6 items is hard to read
- **Impact:** Difficult to understand what each value represents
- **Suggested fix:** Return object instead of array from `useMentors`, or add JSDoc comments

#### [MED-007] Missing Input Validation on Client Side
- **Location:** `src/components/ProfileForm.js:36-62`
- **Problem:** File validation happens in onChange handler with alerts, but validation logic could be extracted
- **Impact:** Validation logic is coupled to UI, harder to test, alerts are poor UX
- **Suggested fix:** Extract validation to utility function, use proper form error state instead of alerts

#### [MED-008] var Usage Instead of const/let
- **Location:**
  - `src/pages/mentor/[slug]/contact.js:55` - `var requestsToday = 0`
  - `src/components/ProfileForm.js:14` - `const Url = require('url')`
- **Problem:** Using `var` (line 55) and CommonJS `require` (line 14) in modern codebase
- **Impact:** `var` has function scope and hoisting issues, inconsistent with rest of codebase
- **Suggested fix:** Use `let` or `const` consistently, use ES6 imports

#### [MED-009] Potential Memory Leak in setTimeout
- **Location:** `src/pages/profile.js:94-102`
- **Problem:** setTimeout cleared in cleanup but not stored in ref
- **Impact:** If component unmounts between creating timer and cleanup, timer will leak
- **Suggested fix:** Store timer ID in ref to ensure it's always cleared

#### [MED-010] Missing Keys in Map Operations
- **Location:** Multiple files use `.map()` with key prop, but some use potentially unstable keys
- **Problem:** Using `key={tag}` where tag is a string is fine, but worth auditing
- **Impact:** React may re-render unnecessarily if keys aren't stable
- **Suggested fix:** Audit all .map() operations to ensure stable keys

### Low (Nice to Have)

#### [LOW-001] No Test Coverage
- **Location:** Application-wide (confirmed by CLAUDE.md line 168)
- **Problem:** Zero automated tests as documented in project
- **Impact:** No safety net for refactoring, manual testing burden
- **Suggested fix:** Add Jest + React Testing Library, start with critical paths (auth, forms, data fetching)

#### [LOW-002] Missing TypeScript
- **Location:** Application-wide (uses .js files, has TypeScript as dependency but not configured)
- **Problem:** No static type checking despite TypeScript being in dependencies
- **Impact:** Runtime errors that could be caught at build time, harder to refactor
- **Suggested fix:** Consider migrating to TypeScript incrementally, or remove unused dependency

#### [LOW-003] Inconsistent Error Message Language
- **Location:** Various error messages in Russian vs English code
- **Problem:** Mix of Russian UI text and English code/logs
- **Impact:** Minor - this is expected for Russian-language app
- **Suggested fix:** N/A - this is by design

#### [LOW-004] No PropTypes or TypeScript Types
- **Location:** All components (PropTypes disabled in `.eslintrc.js:27`)
- **Problem:** No runtime or static type checking for component props
- **Impact:** Harder to catch prop-related bugs, poor IDE autocomplete
- **Suggested fix:** Either enable PropTypes or migrate to TypeScript

#### [LOW-005] Potential for Custom Hook Extraction
- **Location:**
  - `src/pages/profile.js` - Image upload logic could be a hook
  - `src/pages/mentor/[slug]/contact.js` - Rate limiting logic could be a hook
- **Problem:** Complex stateful logic embedded in components
- **Impact:** Harder to test, can't reuse logic
- **Suggested fix:** Extract to custom hooks (useImageUpload, useRateLimiter)

#### [LOW-006] Documentation Could Be Improved
- **Location:** Various files lack JSDoc comments for complex functions
- **Problem:** Functions like `hasAllInArray`, `hasAllTags` lack documentation
- **Impact:** Harder for new developers to understand code
- **Suggested fix:** Add JSDoc comments to utility functions and complex logic

#### [LOW-007] Unused File Check Needed
- **Location:** `src/lib/cloudinary.js`, `src/lib/entities.js`
- **Problem:** These files exist but usage unclear (cloudinary might be unused since Azure is used)
- **Impact:** Dead code increases bundle size and maintenance burden
- **Suggested fix:** Audit usage with grep, remove if unused

---

## Positive Findings

The following aspects of the codebase are well-executed:

1. **Security Hardening**: Recent security improvements evident (auth tokens in headers, CSP, security headers)
2. **Observability**: Comprehensive observability with Grafana stack, structured logging, metrics
3. **Architecture**: Clean separation of concerns (data layer, API routes, components)
4. **Configuration**: Well-documented CLAUDE.md, clear project structure
5. **Git Hooks**: Pre-commit hooks for code quality (Prettier, ESLint)
6. **Next.js Best Practices**: Standalone output, proper image domains, ISR usage
7. **Error Handling**: HttpError class for proper error types
8. **Code Style**: Generally consistent, follows React conventions

---

## Recommended Fix Priority

Based on impact and effort:

1. **Phase 1 - Quick Wins (1-2 hours)**
   - [CRITICAL-002] Replace console.error with logger
   - [HIGH-003] Fix deprecated process.browser
   - [HIGH-004] Update React version in ESLint
   - [MED-002] Remove commented-out code
   - [MED-008] Fix var usage

2. **Phase 2 - High Impact (2-4 hours)**
   - [CRITICAL-001] Add observability to missing API routes
   - [HIGH-002] Fix missing useEffect dependencies
   - [HIGH-001] Fix stale closure in rate limiting
   - [MED-005] Add response status checks to fetch calls

3. **Phase 3 - Code Quality (4-6 hours)**
   - [MED-001] Clean up duplicate analytics properties
   - [MED-003] Extract magic values to constants
   - [MED-004] Standardize image component usage
   - [MED-006] Improve useMentors hook API
   - [MED-007] Improve form validation UX

4. **Phase 4 - Long-term (Future Sprints)**
   - [HIGH-005] Add Error Boundaries
   - [LOW-001] Add test coverage
   - [LOW-002] Consider TypeScript migration
   - [LOW-005] Extract custom hooks

---

## Progress Report

### Phase 1 - Quick Wins (✅ COMPLETED - 2025-11-26)

All Phase 1 fixes have been completed and verified. The application builds successfully and runs correctly.

#### [CRITICAL-002] Replace console.error with logger
**Status:** ✅ Fixed in API routes only
**Changed files:**
- `src/pages/api/contact-mentor.js` - Added `logError` import and replaced console.error
- `src/pages/api/save-profile.js` - Added `logError` import and replaced console.error
- `src/lib/logger.js` - Fixed to handle missing log directories gracefully

**Note:** Client-side code in `profile.js` and `contact.js` still uses `console.error` which is appropriate for browser code. The logger module is server-side only and cannot be used in client components.

**Additional fix:** Updated logger.js to:
- Use `./logs` for local dev instead of `/app/logs`
- Create log directory if it doesn't exist
- Gracefully fall back to console-only logging if file transport fails

#### [HIGH-003] Fix deprecated process.browser
**Status:** ✅ Fixed
**Changed files:**
- `src/lib/analytics.js` - Replaced `process.browser` with `typeof window !== 'undefined'`

#### [HIGH-004] Update React version in ESLint
**Status:** ✅ Fixed
**Changed files:**
- `.eslintrc.js` - Changed React version from `'17.0.2'` to `'detect'` (auto-detects installed version)

#### [MED-002] Remove commented-out code
**Status:** ✅ Fixed
**Changed files:**
- `src/components/MentorsFilters.js` - Removed commented ul tags (lines 186-188) and tooltip (lines 255-263)
- `src/pages/_app.js` - Removed commented client tracing import and related comments

#### [MED-008] Fix var usage
**Status:** ✅ Fixed
**Changed files:**
- `src/pages/mentor/[slug]/contact.js` - Changed `var requestsToday = 0` to `let requestsToday = 0`
- `src/components/ProfileForm.js` - Changed `const Url = require('url')` to `import Url from 'url'`

#### Build & Test Results
- ✅ `yarn lint` passes with only pre-existing warnings
- ✅ `yarn build` succeeds
- ✅ Dev server starts successfully
- ✅ Application runs correctly

---

## Next Steps

1. **Review Findings**: Discuss issues with team, prioritize based on business needs
2. **Fix Iteratively**: Address issues one at a time, verify each fix
3. **Add Tests**: Once fixes are in, add tests to prevent regressions
4. **Document Decisions**: Update CLAUDE.md with any new patterns or decisions

---

## Notes

- No SQL injection, XSS, or authentication vulnerabilities found
- Airtable API calls handled through Go backend (good security practice)
- Recent refactoring to Go API backend is well-executed
- Project follows Next.js Pages Router patterns correctly
- Russian language UI is intentional for target market
