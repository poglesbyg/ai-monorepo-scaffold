# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY pnpm-lock.yaml ./

# Copy all package.json files to preserve workspace structure
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/web ./apps/web

# Build the application
WORKDIR /app/apps/web
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for OpenShift
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# OpenShift runs containers with random user IDs, so we need to ensure proper permissions
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

# Switch to non-root user
USER 1001

# Expose port (OpenShift will map this)
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "./dist/server/entry.mjs"] 