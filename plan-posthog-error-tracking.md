# PostHog Error Tracking Integration Plan

## Context & Decisions

- **PostHog Cloud EU** (`eu.posthog.com` / `eu.i.posthog.com`)
- **Temporary dual-run** with Grafana Faro during migration, then Faro removed
- **PostHog currently loaded via GTM** — will be replaced with direct `posthog-js` SDK
- **Go API backend** — plan covers frontend context propagation only (session ID, distinct ID via tracing headers); Go-side integration is out of scope
- **Source maps** uploaded to PostHog (mirroring existing Faro source map upload process)
- **Release tracking** — errors tagged with app version (git SHA) for regression tracking

---

## Phase 1: Install posthog-js SDK & Remove GTM-based PostHog

### 1.1 Install dependencies

```bash
yarn add posthog-js posthog-node @posthog/nextjs-config
```

- `posthog-js` — client-side SDK (replaces GTM-loaded PostHog)
- `posthog-node` — server-side SDK (for `onRequestError` hook and API route error capture)
- `@posthog/nextjs-config` — Next.js build plugin for automatic source map injection & upload

### 1.2 New environment variables

**Build-time (NEXT_PUBLIC_):**
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest endpoint | `https://eu.i.posthog.com` |

**Server-side / build-only:**
| Variable | Description | Example |
|---|---|---|
| `POSTHOG_PERSONAL_API_KEY` | Personal API key with `error-tracking:write` scope | `phx_...` |
| `POSTHOG_PROJECT_ID` | PostHog project ID (for source map uploads) | `12345` |

**Reuse existing:**
- `NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION` — already used for Faro, will double as PostHog release version (git SHA)
- `NEXT_PUBLIC_APP_ENV` — environment label

### 1.3 Create PostHog client-side initializer

Create `src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js'

let initialized = false

export function initializePostHog(): typeof posthog | null {
  if (initialized || typeof window === 'undefined') {
    return typeof window !== 'undefined' ? posthog : null
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || !apiHost) {
    console.log('[PostHog] Skipping initialization - NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST not configured')
    return null
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    ui_host: 'https://eu.posthog.com',          // EU cloud dashboard
    person_profiles: 'identified_only',
    autocapture: false,                           // keep autocapture off — analytics handled separately
    capture_pageview: false,                      // page views tracked by analytics.ts
    capture_pageleave: false,
    enable_recording_console_log: false,          // not needed — Winston handles logging
    persistence: 'localStorage+cookie',

    // Error tracking
    enable_exception_autocapture: true,           // auto-capture unhandled errors & promise rejections

    // Tracing headers for backend correlation
    __add_tracing_headers: true,                  // adds X-POSTHOG-SESSION-ID & X-POSTHOG-DISTINCT-ID to fetch/XHR

    // Release tracking
    __posthog_version: process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION || '1.0.0',
  })

  initialized = true
  return posthog
}

export function getPostHogClient(): typeof posthog | null {
  if (typeof window === 'undefined') return null
  return initialized ? posthog : null
}

// Manual error capture helper (mirrors Faro's pushError)
export function captureException(error: Error, context?: Record<string, string>): void {
  if (typeof window !== 'undefined' && initialized) {
    posthog.captureException(error, context)
  }
}
```

### 1.4 Create PostHog server-side client

Create `src/lib/posthog-server.ts`:

```typescript
import { PostHog } from 'posthog-node'

let serverClient: PostHog | null = null

export function getPostHogServerClient(): PostHog | null {
  if (serverClient) return serverClient

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return null

  serverClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    flushAt: 1,         // flush immediately — server-side requests are short-lived
    flushInterval: 0,   // no batching delay
  })

  return serverClient
}
```

### 1.5 Update `_app.tsx`

Initialize PostHog alongside Faro (both will run during migration):

```typescript
// Add PostHog initialization next to Faro
import { initializePostHog } from '@/lib/posthog'

if (typeof window !== 'undefined') {
  initializeFaro()
  initializePostHog()
}
```

### 1.6 Update `analytics.ts`

The current analytics wrapper accesses `window.posthog` (GTM-loaded). Once posthog-js is initialized directly via `posthog.init()`, the global `window.posthog` is set automatically — so `getPostHog()` in analytics.ts will continue to work **without changes**. No modifications needed to the analytics layer.

**Action**: Remove PostHog loading from GTM configuration (external GTM dashboard change, not code).

---

## Phase 2: Server-Side Error Capture

### 2.1 Add `onRequestError` hook to `instrumentation.ts`

Next.js provides an `onRequestError` hook that fires for unhandled errors in API routes, SSR, and middleware. Add it to the existing `instrumentation.ts`:

```typescript
import { getPostHogServerClient } from './lib/posthog-server'

export async function onRequestError(
  error: { message: string; digest?: string; stack?: string },
  request: { method: string; url: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
): Promise<void> {
  const posthog = getPostHogServerClient()
  if (!posthog) return

  // Extract PostHog tracing headers from the request (set by posthog-js frontend)
  const sessionId = request.headers['x-posthog-session-id']
  const distinctId = request.headers['x-posthog-distinct-id'] || 'anonymous'

  posthog.captureException(error, distinctId, {
    $session_id: sessionId,
    $posthog_route: context.routePath,
    $posthog_route_type: context.routeType,
    $posthog_render_source: context.renderSource,
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
    service_version: process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION || '1.0.0',
  })

  await posthog.flush()
}
```

**Important**: This hook captures errors that Next.js catches at the framework level. It complements (does not replace) the existing `withObservability` wrapper and `withSSRObservability` which handle Prometheus metrics and Winston logging.

### 2.2 Enhance `withObservability` wrapper (API routes)

In `src/lib/with-observability.ts`, add PostHog error capture alongside existing `logError`:

```typescript
import { captureException } from './posthog'  // client-side — only used on server if posthog-node is wired

// In the catch block of withObservability (line 82-89):
// After logError, add PostHog capture for API route errors
```

**Decision point**: The `onRequestError` hook already catches unhandled errors in API routes at the Next.js level. If all API route errors are caught and re-thrown by `withObservability`, they'll be captured by `onRequestError`. So explicit PostHog capture in `withObservability` is **not required** unless you want to capture errors that are caught and converted to HTTP error responses (e.g., 500 responses that don't throw).

**Recommendation**: For caught errors that return 500 responses, add PostHog server-side capture in the API route handlers themselves where you return `res.status(500)`.

### 2.3 Enhance `withSSRObservability` wrapper (SSR)

Same consideration as above — `onRequestError` captures thrown errors. For SSR errors that are caught and handled (e.g., returning `notFound`), no PostHog capture is needed since those aren't errors.

---

## Phase 3: Explicit Code Path Coverage

### 3.1 Code paths requiring explicit error capture

These are the code paths where errors are **caught and handled** (not re-thrown), so `onRequestError` won't see them. They need explicit `captureException` calls:

| Location | File | Current behavior | Action needed |
|---|---|---|---|
| **Go API client errors** | `src/lib/go-api-client.ts` | Throws `HttpError` | No action — caught by API route handlers or `onRequestError` |
| **API route caught errors** | `src/pages/api/*.ts` | Catch `HttpError`, return HTTP error response | Add server-side `captureException` for 5xx responses only |
| **SSR data fetch failures** | `src/server/mentors-data.ts` | Throws errors | No action — caught by `withSSRObservability` → re-thrown → `onRequestError` |
| **Faro init failure** | `src/lib/faro.ts` line 81 | Logs error, returns null | Add `captureException` (PostHog initializes before Faro) |
| **Client-side form submissions** | `ContactMentorForm.tsx`, `ProfileForm.tsx` | Catch errors, show user message | Add `captureException` in catch blocks |
| **Analytics queue failures** | `src/lib/analytics.ts` | Silently drops events | No action — not a critical error |
| **Image upload failures** | `src/pages/api/upload-profile-picture.ts` | Returns error response | Covered by API route pattern above |

### 3.2 Generic/unhandled error coverage

PostHog's exception autocapture (`enable_exception_autocapture: true`) handles:

- **`window.onerror`** — uncaught JS errors
- **`window.onunhandledrejection`** — unhandled promise rejections
- **React rendering errors** — caught by React's error boundary mechanism

**Missing**: No custom error pages exist. Create:

1. **`src/pages/_error.tsx`** — Custom error page with `captureException` for server-rendered errors
2. **`src/pages/500.tsx`** — Custom 500 page (optional, simpler alternative)

```typescript
// src/pages/_error.tsx
import { captureException } from '@/lib/posthog'
import type { NextPageContext } from 'next'

function ErrorPage({ statusCode }: { statusCode: number }) {
  return <div>Error {statusCode}</div>
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500
  if (err) {
    captureException(err)
  }
  return { statusCode }
}

export default ErrorPage
```

---

## Phase 4: Source Map Upload

### 4.1 Option A: `@posthog/nextjs-config` plugin (Recommended)

Wrap `next.config.js` with `withPostHogConfig`. This automatically:
- Enables `productionBrowserSourceMaps` (already enabled)
- Injects chunk IDs into built JS files
- Uploads source maps to PostHog during `next build`
- Optionally deletes source maps after upload

```javascript
// next.config.js
const { withPostHogConfig } = require('@posthog/nextjs-config')

const nextConfig = {
  // ... existing config ...
}

module.exports = withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
  projectId: process.env.POSTHOG_PROJECT_ID,
  host: 'https://eu.posthog.com',
  sourcemaps: {
    enabled: process.env.NODE_ENV === 'production',
    releaseName: 'getmentor-frontend',
    releaseVersion: process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION,
    deleteAfterUpload: false,  // keep them — Faro also needs them during migration
  },
})
```

**Known issue**: `@posthog/nextjs-config` has ESM compatibility issues with Next.js 15+. Since `next.config.js` uses CommonJS (`module.exports`), this should work. If it doesn't, fall back to Option B.

**Post-migration** (after Faro removal): Set `deleteAfterUpload: true` and remove `productionBrowserSourceMaps: true` from the config (the plugin handles it).

### 4.2 Option B: PostHog CLI in Dockerfile (Fallback)

If the plugin approach has issues, use the PostHog CLI directly in the Dockerfile, mirroring the existing Faro source map upload:

```dockerfile
# Install PostHog CLI
RUN curl --proto '=https' --tlsv1.2 -LsSf \
    https://github.com/PostHog/posthog/releases/latest/download/posthog-cli-installer.sh | sh

# After yarn build, inject and upload source maps
RUN if [ -n "$POSTHOG_PERSONAL_API_KEY" ] && [ -n "$POSTHOG_PROJECT_ID" ]; then \
      echo "Injecting PostHog source map metadata..." && \
      posthog-cli sourcemap inject --directory .next/static && \
      echo "Uploading source maps to PostHog..." && \
      posthog-cli sourcemap upload \
        --directory .next/static \
        --release-name getmentor-frontend \
        --release-version "${NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION:-1.0.0}" && \
      echo "PostHog source maps uploaded successfully"; \
    else \
      echo "Skipping PostHog source map upload (credentials not set)"; \
    fi
```

**CLI authentication** uses environment variables (no interactive login):
- `POSTHOG_CLI_API_KEY` = `$POSTHOG_PERSONAL_API_KEY`
- `POSTHOG_CLI_PROJECT_ID` = `$POSTHOG_PROJECT_ID`
- `POSTHOG_CLI_HOST` = `https://eu.posthog.com`

**Important**: The injected assets (with `//# chunkId=...` comments) **must be served in production**. The standalone output copies `.next/static` to the runner stage, so this should work if injection happens before the copy.

### 4.3 Dockerfile changes

Add new build ARGs:

```dockerfile
ARG POSTHOG_PERSONAL_API_KEY
ARG POSTHOG_PROJECT_ID
```

During migration, both Faro and PostHog source map uploads run in the build stage. After Faro removal, remove Faro-related ARGs (`FARO_API_ENDPOINT`, `FARO_APP_ID`, `FARO_STACK_ID`, `FARO_API_KEY`) and the Faro upload step.

### 4.4 Reuse existing source map filtering

The existing `scripts/filter-sourcemaps.js` filters out third-party code from source maps before Faro upload. This script can potentially be reused for PostHog uploads (Option B), but **Option A (`@posthog/nextjs-config`) handles this internally** — it processes the full `.next` output directory. Verify whether PostHog's upload handles large source maps gracefully or if filtering is still needed.

---

## Phase 5: Release Versioning

### 5.1 Version strategy

Use **git commit SHA** as the release version, consistent with the existing Faro setup:

- `NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION` is already set to the git SHA during Docker build
- PostHog source maps are tagged with this version
- PostHog client-side SDK is configured with this version
- Errors in PostHog dashboard will show which version introduced them

### 5.2 Release tracking configuration

PostHog tracks releases via the source map upload release version. When an error is captured:
1. PostHog reads the `//# chunkId=...` comment from the stack trace
2. Matches it to the uploaded source map for that release
3. Shows the unminified source and the release version

**No additional code changes needed** — the version is already passed to both the PostHog SDK init and source map upload.

---

## Phase 6: Frontend-Backend Connectivity

### 6.1 Tracing headers (automatic)

With `__add_tracing_headers: true` in posthog-js init, every `fetch()` and `XMLHttpRequest` call automatically includes:

- `X-POSTHOG-SESSION-ID` — links backend errors to frontend session
- `X-POSTHOG-DISTINCT-ID` — links backend errors to frontend user

These headers are sent to **all domains** by default. If you want to restrict them to specific domains only, configure `bootstrap` or custom fetch wrappers.

### 6.2 Go API backend preparation

When the Go API integrates PostHog (separate project):
1. Read `X-POSTHOG-SESSION-ID` and `X-POSTHOG-DISTINCT-ID` from incoming request headers
2. Pass them to `posthog-go` client when capturing exceptions: `client.Enqueue(posthog.Capture{DistinctId: distinctId, Properties: posthog.Properties{"$session_id": sessionId}})`
3. This links Go backend errors to the same PostHog session as the frontend

### 6.3 CORS considerations

The Go API must expose these headers in CORS responses:
```
Access-Control-Allow-Headers: X-POSTHOG-SESSION-ID, X-POSTHOG-DISTINCT-ID
```

If already using `Access-Control-Allow-Headers: *`, no change needed.

### 6.4 Coexistence with OpenTelemetry tracing

PostHog tracing headers (`X-POSTHOG-*`) are separate from OpenTelemetry W3C trace context headers (`traceparent`, `tracestate`). Both can coexist. The Go API client in `src/lib/go-api-client.ts` already injects W3C headers via `propagation.inject()` — PostHog headers will be added automatically by the browser's patched `fetch()`.

---

## Phase 7: CSP & Security Headers

### 7.1 Current CSP already covers PostHog

The existing CSP in `next.config.js` (lines 92-103) already includes:

- **script-src**: `https://us.i.posthog.com`, `https://eu.i.posthog.com`, `https://us-assets.i.posthog.com`, `https://eu-assets.i.posthog.com`
- **connect-src**: `https://us.i.posthog.com`, `https://eu.i.posthog.com`, `https://eu.posthog.com`

**No CSP changes required.** PostHog error tracking uses the same endpoints as PostHog analytics.

---

## Phase 8: Migration — Remove Faro

After PostHog error tracking is validated in production:

### 8.1 Code removal
1. Delete `src/lib/faro.ts`
2. Remove Faro initialization from `_app.tsx`
3. Remove `@grafana/faro-web-sdk` and `@grafana/faro-web-tracing` from `package.json`
4. Remove Faro rewrite from `next.config.js` (`/faro-collect` → Grafana Cloud)
5. Remove Faro CSP entries (`faro-collector-prod-eu-west-3.grafana.net`)
6. Remove Faro environment variables from Dockerfile (`FARO_*`, `NEXT_PUBLIC_FARO_*`)
7. Remove `scripts/filter-sourcemaps.js` and `faro:sourcemaps` / `faro:filter-sourcemaps` scripts from `package.json`
8. Set `deleteAfterUpload: true` in PostHog config (or remove source maps in Dockerfile)
9. Optionally remove `productionBrowserSourceMaps: true` if PostHog plugin handles it

### 8.2 Environment variable cleanup
Remove from deployment configuration:
- `NEXT_PUBLIC_FARO_APP_NAME`
- `NEXT_PUBLIC_FARO_COLLECTOR_URL`
- `NEXT_PUBLIC_FARO_SAMPLE_RATE`
- `FARO_API_ENDPOINT`
- `FARO_APP_ID`
- `FARO_STACK_ID`
- `FARO_API_KEY`

---

## Summary of Files Changed

| File | Change type | Description |
|---|---|---|
| `package.json` | Modified | Add `posthog-js`, `posthog-node`, `@posthog/nextjs-config` |
| `src/lib/posthog.ts` | **New** | Client-side PostHog initialization & helpers |
| `src/lib/posthog-server.ts` | **New** | Server-side PostHog Node client |
| `src/pages/_app.tsx` | Modified | Add PostHog initialization |
| `src/instrumentation.ts` | Modified | Add `onRequestError` hook for server-side error capture |
| `next.config.js` | Modified | Wrap with `withPostHogConfig` for source map upload |
| `Dockerfile` | Modified | Add PostHog build ARGs (and optionally CLI for fallback) |
| `.github/workflows/main.yml` | Modified | Add PostHog env vars to build job |
| `src/pages/_error.tsx` | **New** | Custom error page with PostHog capture |
| `src/components/forms/ContactMentorForm.tsx` | Modified | Add `captureException` in error catch |
| `src/components/forms/ProfileForm.tsx` | Modified | Add `captureException` in error catch |
| `src/types/env.d.ts` | Modified | Add PostHog env var type declarations |

---

## Implementation Order

1. **Phase 1** — Install SDK, create initializer, update `_app.tsx` (working error autocapture)
2. **Phase 4** — Source map upload (readable stack traces)
3. **Phase 5** — Release versioning (regression tracking)
4. **Phase 2** — Server-side error capture (`onRequestError`)
5. **Phase 3** — Explicit error capture in form components and error pages
6. **Phase 6** — Verify tracing headers reach Go API (prepare for future Go integration)
7. **Phase 7** — Verify CSP (should already work)
8. **Phase 8** — Remove Faro (after validation period)

---

## Open Questions / Risks

1. **`@posthog/nextjs-config` + Turbopack compatibility**: Next.js 16 uses Turbopack by default. The PostHog plugin may use Webpack-specific APIs (SourceMapDevToolPlugin). Need to test whether it works with Turbopack or if we need the CLI fallback (Option B).

2. **`@posthog/nextjs-config` + standalone output**: The plugin runs during `next build`. With `output: 'standalone'`, source maps need to be injected before the standalone copy. Verify the plugin handles this correctly.

3. **Source map upload during Docker build**: The build stage needs network access to PostHog EU to upload source maps. Ensure your Docker build environment allows outbound HTTPS to `eu.posthog.com`.

4. **PostHog SDK bundle size**: `posthog-js` adds ~30-40KB gzipped to the client bundle. Since PostHog was previously loaded via GTM (external script), this shifts the load from an external CDN to the app bundle. Monitor bundle size impact.

5. **`onRequestError` availability**: This hook requires Next.js 15.3+. With Next.js 16, this should be available. Verify it works with the pages router (not just app router).

6. **Dual source map uploads during migration**: Both Faro and PostHog will upload source maps during the build. This doubles build time for the upload step. The existing Faro source map filtering reduces this, but PostHog uploads full maps.
