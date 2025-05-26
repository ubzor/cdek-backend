# CDEK Backend

Backend для [cdek-widget](https://github.com/ubzor/cdek-widget).

## Требования

-   PostgreSQL с установленным плагином PostGIS
    -   Для разработки рекомендуется использовать Docker-образ [postgis/postgis](https://hub.docker.com/r/postgis/postgis/)

## Установка

1. Клонируйте репозиторий:

    ```bash
    git clone https://github.com/ubzor/cdek-backend.git
    cd cdek-backend
    ```

2. Скопируйте файл `.env.example` в `.env`:

    ```bash
    cp .env.example .env
    ```

3. Отредактируйте файл `.env`, указав данные для подключения к базе данных PostgreSQL:

    ```
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_DATABASE=cdek
    DATABASE_USER=postgres
    DATABASE_PASSWORD=your_password
    ```

4. Установите зависимости:

    ```bash
    yarn
    ```

5. Примените миграции к базе данных:
    ```bash
    yarn prisma migrate deploy
    ```

## Запуск

### Режим разработки

```bash
yarn dev
```

### Production-режим

```bash
yarn build
yarn start
```
