#!/bin/bash
set -euo pipefail

APP_DIR=/var/www/auto-parts

ln -sf /etc/nginx/sites-available/auto-parts /etc/nginx/sites-enabled/auto-parts

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
else
  git clone https://github.com/ars000/auto-parts.git "$APP_DIR"
  cd "$APP_DIR"
fi

cp .env.production.example .env.production
npm ci
npm run build
npm ci --omit=dev

if [ ! -f .env.server ]; then
  printf 'PORT=8080\nFAVORIT_API_KEY=00000000-0000-0000-0000-000000000001\n' > .env.server
  chmod 600 .env.server
fi

chown -R www-data:www-data "$APP_DIR"

systemctl daemon-reload
systemctl enable auto-parts
systemctl restart auto-parts

nginx -t
systemctl reload nginx

curl -s -o /dev/null -w 'local_api:%{http_code}\n' 'http://127.0.0.1:8080/api/hsprice?number=01089'
systemctl --no-pager status auto-parts --lines=8
