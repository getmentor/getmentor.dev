# How Next.js Instrumentation Works

## Overview

`instrumentation.js` is a special file that Next.js loads **before** your application starts. It's part of the Instrumentation API introduced in Next.js 13.2+.

## File Location

```
your-project/
├── instrumentation.js     ← Must be at project root
├── next.config.js
├── package.json
├── src/
│   ├── pages/
│   └── lib/
└── ...
```

**Important:** The file must be at the project root, **not** in `src/` or `pages/`.

## Configuration

To enable instrumentation, add this to `next.config.js`:

```javascript
module.exports = {
  experimental: {
    instrumentationHook: true,  // ← Enable instrumentation
  },
  // ... rest of your config
}
```

## How It Loads

### Loading Sequence

```
┌─────────────────────────────────────────┐
│  1. Next.js Process Starts              │
│     (yarn dev or yarn start)            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  2. Next.js Detects instrumentation.js  │
│     - Checks if file exists             │
│     - Checks if feature is enabled      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  3. Calls register() Function           │
│     - Runs ONCE per process             │
│     - Runs BEFORE server starts         │
│     - Only in Node.js runtime           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  4. Your Initialization Code Runs       │
│     - Import metrics registry           │
│     - Import logger                     │
│     - Set up process handlers           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  5. Next.js Server Starts               │
│     - Accepts incoming requests         │
│     - Metrics/logging are available     │
└─────────────────────────────────────────┘
```

### When It Runs

✅ **Runs:**
- On `yarn dev` (development server start)
- On `yarn start` (production server start)
- Before any page or API route loads
- **Once per Node.js process**

❌ **Does NOT run:**
- On every request
- In the browser
- During `yarn build`
- In Edge runtime

## Runtime Check

The code checks the runtime to ensure it only runs in Node.js:

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only runs on the server
    // NOT in the browser
    // NOT in Edge runtime
  }
}
```

### Why This Check?

Next.js can run in different environments:
- **nodejs** - Traditional Node.js server (most common)
- **edge** - Edge runtime (Vercel Edge Functions, Cloudflare Workers)
- **browser** - Client-side (never for instrumentation)

We only want server-side initialization for metrics and logging.

## Our Implementation

```javascript
// instrumentation.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. Load metrics registry
    const { default: register } = await import('./src/lib/metrics')

    // 2. Load logger
    const { default: logger } = await import('./src/lib/logger')

    // 3. Log that initialization happened
    logger.info('Observability instrumentation initialized', {
      runtime: 'nodejs',
      env: process.env.NODE_ENV,
    })

    // 4. Set up graceful shutdown handlers
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully')
    })

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully')
    })
  }
}
```

### What This Does

1. **Initializes Metrics Registry**
   - Imports `src/lib/metrics.js`
   - Registers all Prometheus metrics
   - Makes them available globally

2. **Initializes Logger**
   - Imports `src/lib/logger.js`
   - Sets up Winston transports
   - Configures log files (in production)

3. **Logs Startup**
   - Records that observability is ready
   - Includes runtime and environment info

4. **Handles Shutdown**
   - Listens for SIGTERM/SIGINT signals
   - Logs graceful shutdown events
   - Useful for debugging container restarts

## Benefits of Using instrumentation.js

### ✅ Early Initialization
- Runs **before** any page or API route
- Ensures metrics/logging are ready from the first request
- No race conditions

### ✅ Global Availability
- Metrics registry is available everywhere
- Logger is available everywhere
- No need to initialize in each file

### ✅ Clean Separation
- Infrastructure setup separated from business logic
- Single place for all observability initialization
- Easy to maintain

### ✅ Process-Wide
- Only runs once per process
- No overhead from repeated initialization
- Efficient resource usage

## Testing It

### Development
```bash
yarn dev
```

You should see in the console:
```
{"timestamp":"2025-...","level":"info","message":"Observability instrumentation initialized","service":"getmentor-nextjs","runtime":"nodejs","env":"development"}
```

### Production
```bash
yarn build
yarn start
```

In production, this log goes to:
- Console (captured by Docker)
- `/app/logs/app.log` (parsed by Grafana Agent)

## Comparison: With vs Without instrumentation.js

### Without instrumentation.js
```javascript
// In EVERY file that needs metrics
import register from './lib/metrics'
import logger from './lib/logger'

// Metrics might not be ready on first import
// Race conditions possible
// Duplicated imports everywhere
```

### With instrumentation.js
```javascript
// In your business logic files
import { httpRequestTotal } from './lib/metrics'
import logger from './lib/logger'

// Metrics are ALWAYS ready
// No initialization needed
// Cleaner code
```

## Troubleshooting

### Feature Not Enabled

**Error:**
```
instrumentation.js exists but nothing happens
```

**Fix:**
Add to `next.config.js`:
```javascript
experimental: {
  instrumentationHook: true,
}
```

### File in Wrong Location

**Error:**
```
instrumentation.js not detected
```

**Fix:**
Move to project root (same level as `next.config.js`)

### Not Running in Production

**Check:**
1. Is `instrumentationHook` enabled in config?
2. Is the file included in your Docker build?
3. Check Docker logs for the initialization message

### Want to Test Locally

```bash
# Development
yarn dev

# Look for this log:
# {"level":"info","message":"Observability instrumentation initialized",...}

# Production build
yarn build
yarn start

# Should see the same log
```

## Advanced: Multiple Runtimes

If you need different initialization for Edge runtime:

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js server initialization
    const { default: register } = await import('./src/lib/metrics')
    // ... your Node.js setup
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    // (different approach, edge-compatible libraries)
  }
}
```

## Summary

**instrumentation.js** is like a "bootstrap" file for your Next.js application:

1. ✅ Runs **before** your app starts
2. ✅ Runs **once** per process
3. ✅ Perfect for **global initialization**
4. ✅ Requires `experimentalInstrumentationHook: true`
5. ✅ Must be at **project root**
6. ✅ Should check **NEXT_RUNTIME**

It's the best place to:
- Initialize metrics registries
- Set up logging
- Configure APM/monitoring
- Set up process handlers
- Load global configuration

For our observability setup, it ensures metrics and logging are ready **before the first request arrives**! 🚀
