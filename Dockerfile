# Multi-stage Dockerfile for Next.js frontend-only deployment
# Simplified without Grafana Alloy (hosted elsewhere)

# Stage 1: Install dependencies
FROM node:22.21.1-alpine3.22 AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:22.21.1-alpine3.22 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
# These are needed for the build process (client-side env vars)
ARG NEXT_PUBLIC_GO_API_URL
ARG NEXT_PUBLIC_AZURE_STORAGE_DOMAIN
ARG NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT
ARG NEXT_PUBLIC_YANDEX_STORAGE_BUCKET
ARG NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ARG NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT
ARG NEXT_PUBLIC_O11Y_FE_SERVICE_NAME
ARG NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE
ARG NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_CDN_ENDPOINT
ARG NEXT_PUBLIC_FARO_APP_NAME
ARG NEXT_PUBLIC_FARO_COLLECTOR_URL
ARG NEXT_PUBLIC_FARO_SAMPLE_RATE
ARG FARO_API_ENDPOINT
ARG FARO_APP_ID
ARG FARO_STACK_ID
ARG FARO_API_KEY

ENV NEXT_PUBLIC_GO_API_URL=$NEXT_PUBLIC_GO_API_URL
ENV NEXT_PUBLIC_AZURE_STORAGE_DOMAIN=$NEXT_PUBLIC_AZURE_STORAGE_DOMAIN
ENV NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT=$NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT
ENV NEXT_PUBLIC_YANDEX_STORAGE_BUCKET=$NEXT_PUBLIC_YANDEX_STORAGE_BUCKET
ENV NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ENV NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT=$NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT
ENV NEXT_PUBLIC_O11Y_FE_SERVICE_NAME=$NEXT_PUBLIC_O11Y_FE_SERVICE_NAME
ENV NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE=$NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE
ENV NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION=$NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_CDN_ENDPOINT=$NEXT_PUBLIC_CDN_ENDPOINT
ENV NEXT_PUBLIC_FARO_APP_NAME=$NEXT_PUBLIC_FARO_APP_NAME
ENV NEXT_PUBLIC_FARO_COLLECTOR_URL=$NEXT_PUBLIC_FARO_COLLECTOR_URL
ENV NEXT_PUBLIC_FARO_SAMPLE_RATE=$NEXT_PUBLIC_FARO_SAMPLE_RATE
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN yarn build

# Add curl for source map upload
RUN apk add --update curl

# Upload source maps to Grafana Faro (if credentials provided)
# Uses git commit SHA or package version as bundle ID
RUN if [ -n "$FARO_API_KEY" ] && [ -n "$FARO_APP_ID" ] && [ -n "$FARO_STACK_ID" ]; then \
      echo "Uploading source maps to Grafana Faro..." && \
      yarn faro:sourcemaps \
        -e "${FARO_API_ENDPOINT:-https://faro-api-prod-eu-west-3.grafana.net/faro/api/v1}" \
        -a "$FARO_APP_ID" \
        -s "$FARO_STACK_ID" \
        -k "$FARO_API_KEY" \
        -b "${NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION:-1.0.0}"; \
    else \
      echo "Skipping source map upload (FARO_API_KEY, FARO_APP_ID, or FARO_STACK_ID not set)"; \
    fi

# Stage 3: Production image (using Alpine for smaller size)
FROM node:22.21.1-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies for healthchecks and proper process handling
RUN apk add --no-cache curl dumb-init

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create logs directory for application logs
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Copy only necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy observability files
# COPY --from=builder /app/instrumentation.js ./instrumentation.js
# COPY --from=builder /app/start-server.js ./start-server.js

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check to ensure the application is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/healthcheck || exit 1

# Start Next.js with observability wrapper for proper signal handling and memory limit
# Use start-server.js instead of server.js to initialize tracing before Next.js starts
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "--max-old-space-size=512", "server.js"]
