# Base stage
FROM node:22-alpine AS base
RUN npm install -g pnpm@11.11.0
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/*/package.json ./apps/backend/
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY turbo.json tsconfig.json ./
RUN pnpm build

# Runner stage
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "run", "start"]
