# Multi-stage Dockerfile shared by apps/web and apps/admin.
# Build with: docker build --build-arg APP=web -t synergy-web .
#         or: docker build --build-arg APP=admin -t synergy-admin .

# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY packages/api/package.json packages/api/
COPY packages/ai/package.json packages/ai/
COPY packages/emails/package.json packages/emails/
RUN corepack prepare pnpm@10.33.0 --activate \
 && pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
ARG APP
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /repo/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /repo/packages/ui/node_modules ./packages/ui/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN pnpm --filter "@synergy/${APP}" build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
ARG APP
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001
# Standalone bundle from Next.js — includes minimal node_modules + server.js
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/public ./apps/${APP}/public
USER nextjs
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
# `WORKDIR /app` + standalone layout means server.js lives at /app/apps/${APP}/server.js
# The shell form lets us interpolate the build arg at run time via env.
ENV APP_NAME=${APP}
CMD ["sh", "-c", "node apps/${APP_NAME}/server.js"]
