# syntax=docker/dockerfile:1

# ==== STAGE 1 ====
FROM node:22-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN npm install -g turbo@2.0.3
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "loki" is the name entered in the project's package.json: { name: "loki" }
RUN turbo prune loki --docker

# ==== STAGE 2 ====
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN npm ci
 
# Build the project
COPY --from=builder /app/out/full/ .
RUN npm run build

# ==== STAGE 3 ====
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary files from installer
COPY --from=installer --chown=nextjs:nodejs /app/apps/loki/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/loki/.next/static ./apps/loki/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/loki/public ./apps/loki/public



# Expose port
EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL=${DATABASE_URL}
ENV HOSTNAME=${HOSTNAME}

# Start the app
CMD ["node", "apps/loki/server.js"]