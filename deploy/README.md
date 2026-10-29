# Деплой на VPS

Node-процесс (`npm start`) отдаёт `dist` и проксирует API. Ключ **только на сервере** — `FAVORIT_API_KEY`, не в клиентской сборке.

## Сборка

```bash
cp .env.production.example .env.production
npm ci
npm run build
```

## Сервер

```bash
npm ci --omit=dev
cp deploy/env.server.example .env.server
# FAVORIT_API_KEY=…
export $(grep -v '^#' .env.server | xargs)
npm start
```

Порт по умолчанию: **8080**.

## nginx и systemd

- `auto-parts.nginx.conf` — vhost **autoparts.ars000.ru** → `127.0.0.1:8080`
- `auto-parts.service` — unit для systemd (`/var/www/auto-parts`)
- `vps-install.sh` — установка/обновление на VPS (LF)
- `nginx.example.conf`, `auto-parts.service.example` — шаблоны

## Переменные

| Переменная | Где | Назначение |
|------------|-----|------------|
| `VITE_FAVORIT_API_KEY` | `.env` (dev) | Ключ в браузере + прокси Vite |
| `FAVORIT_API_KEY` | `.env.server` (prod) | Ключ на backend-прокси |
| `PORT` | `.env.server` | Порт Node (8080) |
