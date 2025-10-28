# Multi-stage Dockerfile for Next.js production deployment
# This version creates a smaller final image by separating build and runtime stages

# Stage 1: Install dependencies
# Using specific version to avoid vulnerabilities in latest 'node:20-alpine'
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
# These are needed for the build process but won't be in the final image
ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID
ARG AZURE_STORAGE_DOMAIN
ARG NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

ENV AIRTABLE_API_KEY=$AIRTABLE_API_KEY
ENV AIRTABLE_BASE_ID=$AIRTABLE_BASE_ID
ENV AZURE_STORAGE_DOMAIN=$AZURE_STORAGE_DOMAIN
ENV NEXT_PUBLIC_AZURE_STORAGE_DOMAIN=$NEXT_PUBLIC_AZURE_STORAGE_DOMAIN
ENV RECAPTCHA_V2_SITE_KEY=$RECAPTCHA_V2_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN yarn build

# Stage 3: Production image
FROM node:20.19.5-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

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

# Use the custom start command with memory limit
CMD ["node", "--max-old-space-size=512", "server.js"]
