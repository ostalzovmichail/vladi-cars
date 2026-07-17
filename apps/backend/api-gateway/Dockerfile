FROM node:22-alpine AS builder
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @vladi-cars/api-gateway build

FROM node:22-alpine AS runner
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY --from=builder /app/apps/backend/api-gateway/dist ./dist
COPY --from=builder /app/apps/backend/api-gateway/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages ./packages
RUN pnpm install --prod --no-frozen-lockfile
EXPOSE 3000
CMD ["node", "dist/main.js"]
