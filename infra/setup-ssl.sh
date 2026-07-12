#!/usr/bin/env bash
set -euo pipefail

# Usage: DOMAIN=vladi-cars.ru EMAIL=admin@example.com ./infra/setup-ssl.sh
# Run this ONCE on the VPS to get Let's Encrypt certificates.

DOMAIN="${DOMAIN:?DOMAIN is required}"
EMAIL="${EMAIL:?EMAIL is required}"

echo "=== Setting up Let's Encrypt for $DOMAIN ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

# Stop any existing containers that use port 80
docker compose -f docker-compose.yml -f docker-compose.prod.yml down frontend 2>/dev/null || true

# Get certificate using standalone mode (port 80 must be free)
docker run --rm \
    -p 80:80 \
    -v /etc/letsencrypt:/etc/letsencrypt \
    certbot/certbot \
    certonly --standalone \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

echo "--- Setting up auto-renewal ---"
# Create a cron job for renewal (runs daily at 3am)
(crontab -l 2>/dev/null | grep -v certbot || true; echo "0 3 * * * docker run --rm -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot renew --quiet && docker compose -f /opt/vladi-cars/docker-compose.yml -f /opt/vladi-cars/docker-compose.prod.yml restart frontend") | crontab -

echo "=== SSL certificates for $DOMAIN are ready! ==="
echo "Certificates: /etc/letsencrypt/live/$DOMAIN/"
echo "Auto-renewal configured via cron at 3:00 AM daily."
echo ""
echo "Next steps:"
echo "  1. Copy the host nginx config:"
echo "     sudo cp infra/nginx.conf /etc/nginx/sites-available/$DOMAIN"
echo "     sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo "  2. Deploy the app:"
echo "     DOMAIN=$DOMAIN JWT_SECRET=<secret> ./infra/deploy.sh"
