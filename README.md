# Подбор автозапчастей

Двухэтапный поиск запчастей по API [Favorit Parts «Проценка»](https://lk.favorit-parts.ru/static/wsprice.pdf): артикул → производители → аналоги и цены.

## Стек

- React, Redux Toolkit, Bootstrap 5
- Vite, JavaScript (без TypeScript)

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Откройте `http://localhost:5173`. Ключ API задаётся в `.env` (см. `.env.example`).

## Сборка

```bash
npm run build
npm start
```

`npm start` — статика из `dist` и прокси `/api/hsprice` (для сервера). Подробности деплоя — в [deploy/README.md](./deploy/README.md).
