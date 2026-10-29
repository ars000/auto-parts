# Подбор автозапчастей (React + Redux)

Клиент для двухэтапного поиска по [Web-сервису «Проценка» Favorit Parts](https://lk.favorit-parts.ru/static/wsprice.pdf).

## Запуск

```bash
npm install
cp .env.example .env   # укажите свой ключ покупателя
npm run dev
```

Приложение откроется на `http://localhost:5173`. Запросы к API идут через прокси Vite (`/api/hsprice`), чтобы обойти ограничения CORS в браузере.

## Сценарий

1. Введите артикул — после паузы (~500 мс) загружается список производителей.
2. Выберите бренд — загружаются основная позиция и аналоги с ценой (минимум по складам) и остатком.

## Стек

- React, Redux Toolkit, Bootstrap 5
- JavaScript (без TypeScript)
