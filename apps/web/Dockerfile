# Multi-stage build for Astro application
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files for all packages
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/web ./apps/web

# Build the web app
WORKDIR /app/apps/web
RUN pnpm build

# Create production deployment
WORKDIR /app
RUN pnpm --filter @seqconsult/web deploy --legacy /prod/web

# Production stage
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy the production deployment
COPY --from=builder --chown=nodejs:nodejs /prod/web ./

# Set proper permissions for OpenShift
RUN chown -R nodejs:nodejs /app && \
    chmod -R g+rwX /app && \
    chmod -R g+s /app

USER nodejs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./dist/server/entry.mjs"] 