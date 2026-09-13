#!/bin/sh
set -e

log() {
  echo "[startup] $1"
}

wait_for_db() {
  log "Waiting for PostgreSQL..."
  for i in $(seq 1 30); do
    if pg_isready -h "$(echo $DATABASE_URL | sed 's|.*@||;s|:.*||')" -U "$(echo $DATABASE_URL | sed 's|.*//||;s|:.*||')" -q 2>/dev/null; then
      log "PostgreSQL is ready"
      return 0
    fi
    sleep 2
  done
  log "WARNING: PostgreSQL not reachable, continuing anyway..."
}

run_db_push() {
  local service=$1
  log "Running db push for $service..."
  cd "/app/apps/backend/$service"
  DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -E "warn|error|Your database|already" || true
}

export CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:5173}"

export JWT_SECRET="${JWT_SECRET:?JWT_SECRET is required}"

export DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

wait_for_db

run_db_push auth
run_db_push catalog
run_db_push cart
run_db_push orders

log "Starting all services..."

PORT=3000 CATALOG_URL=http://localhost:3001 AUTH_URL=http://localhost:3004 CART_URL=http://localhost:3002 ORDERS_URL=http://localhost:3003 node /app/apps/backend/api-gateway/dist/src/main.js &
PORT=3004 node /app/apps/backend/auth/dist/src/main.js &
PORT=3001 node /app/apps/backend/catalog/dist/src/main.js &
PORT=3002 node /app/apps/backend/cart/dist/src/main.js &
PORT=3003 node /app/apps/backend/orders/dist/src/main.js &

log "All services started. Waiting for processes..."

trap "kill 0" INT TERM
wait
