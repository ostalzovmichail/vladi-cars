FROM node:22-alpine AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm install -g pnpm@11.11.0
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @vladi-cars/frontend build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY --from=builder /app/apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
