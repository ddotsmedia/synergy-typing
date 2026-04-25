# Multi-stage Dockerfile shared by apps/web and apps/admin.
# Build with: docker build --build-arg APP=web -t synergy-web .
#         or: docker build --build-arg APP=admin -t synergy-admin .

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
ARG APP
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo
# Bring the whole repo + run pnpm install once. Workspaces + symlinks are
# fragile to copy piecewise across stages; one install gets every per-package
# node_modules right (typecheck on packages/config/tailwind/preset.ts needs
# tailwindcss, which lives in packages/config/node_modules — easy to miss).
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN pnpm --filter "@synergy/${APP}" build

# ─── Stage 2: runner ──────────────────────────────────────────────────────────
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
ENV APP_NAME=${APP}
CMD ["sh", "-c", "node apps/${APP_NAME}/server.js"]
