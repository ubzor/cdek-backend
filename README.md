# CDEK Backend

Backend на Fastify с использованием Prisma и SQLite (Turso).

## Установка

1. Клонируйте репозиторий.
2. Выполните `npm install`.
3. Создайте файл `.env` на основе примера.
4. Примените миграции Prisma: `npx prisma migrate dev --name init`.

## Запуск

-   В режиме разработки: `npm run dev`
-   Для сборки: `npm run build` и затем `npm start`.

## Деплой на Vercel

Vercel будет использовать `vercel.json` для сборки и маршрутизации.
