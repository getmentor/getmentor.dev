# Multi-stage Dockerfile for Next.js frontend-only deployment
# Simplified without Grafana Alloy (hosted elsewhere)

# Stage 1: Install dependencies
FROM node:20.19.5-alpine3.22 AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20.19.5-alpine3.22 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
# These are needed for the build process (client-side env vars)
ARG NEXT_PUBLIC_GO_API_URL
ARG NEXT_PUBLIC_AZURE_STORAGE_DOMAIN
ARG NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ARG NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT
ARG NEXT_PUBLIC_O11Y_SERVICE_NAME
ARG NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE
ARG NEXT_PUBLIC_SERVICE_VERSION
ARG NEXT_PUBLIC_APP_ENV

ENV NEXT_PUBLIC_GO_API_URL=$NEXT_PUBLIC_GO_API_URL
ENV NEXT_PUBLIC_AZURE_STORAGE_DOMAIN=$NEXT_PUBLIC_AZURE_STORAGE_DOMAIN
ENV NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ENV NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT=$NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT
ENV NEXT_PUBLIC_O11Y_SERVICE_NAME=$NEXT_PUBLIC_O11Y_SERVICE_NAME
ENV NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE=$NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE
ENV NEXT_PUBLIC_SERVICE_VERSION=$NEXT_PUBLIC_SERVICE_VERSION
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN yarn build

# Stage 3: Production image (using Alpine for smaller size)
FROM node:20.19.5-alpine3.22 AS runner
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

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check to ensure the application is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/healthcheck || exit 1

# Start Next.js with dumb-init for proper signal handling and memory limit
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "--max-old-space-size=512", "server.js"]
