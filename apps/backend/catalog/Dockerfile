FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vladi-cars/catalog prisma:generate
RUN pnpm --filter @vladi-cars/catalog build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY --from=builder /app/apps/backend/catalog/dist ./dist
COPY --from=builder /app/apps/backend/catalog/package.json ./package.json
COPY --from=builder /app/apps/backend/catalog/prisma ./prisma
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages ./packages
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
