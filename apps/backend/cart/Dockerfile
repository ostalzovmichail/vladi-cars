FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vladi-cars/cart prisma:generate
RUN pnpm --filter @vladi-cars/cart build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY --from=builder /app/apps/backend/cart/dist ./dist
COPY --from=builder /app/apps/backend/cart/package.json ./package.json
COPY --from=builder /app/apps/backend/cart/prisma ./prisma
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages ./packages
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3002
CMD ["node", "dist/src/main.js"]
