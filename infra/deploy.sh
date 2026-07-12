#!/usr/bin/env bash
set -euo pipefail

# Usage: DOMAIN=vladi-cars.ru JWT_SECRET=your-secret ./infra/deploy.sh
# Optional: POSTGRES_PASSWORD=your-password

DOMAIN="${DOMAIN:-vladi-cars.ru}"
JWT_SECRET="${JWT_SECRET:?JWT_SECRET is required}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 32)}"

echo "=== Deploying VladiCars to $DOMAIN ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "Docker Compose is required"; exit 1; }

# Create .env file for docker compose
cat > .env << EOF
DOMAIN=$DOMAIN
JWT_SECRET=$JWT_SECRET
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
CORS_ORIGIN=https://$DOMAIN
EOF

echo "--- Pulling latest changes ---"
git pull

echo "--- Building and starting services ---"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

echo "--- Running database migrations ---"
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T auth npx prisma db push
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T catalog npx prisma db push
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T cart npx prisma db push
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T orders npx prisma db push

echo "--- Running seed ---"
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T catalog pnpm seed
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T orders pnpm seed

echo "=== Deploy complete! https://$DOMAIN ==="
echo "PostgreSQL password: $POSTGRES_PASSWORD"
