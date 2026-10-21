# jsonplaceholder-test

Блог на Next.js (Pages Router), React, TypeScript, Chakra UI и MobX.
Данные загружаются из JSONPlaceholder через Axios.

## Запуск

Требуются Node.js 24 LTS и npm. Версия Node указана в `.nvmrc`.

```sh
npm ci
npm run dev
```

Откройте http://localhost:3000. Для production:

```sh
npm run build
npm start
```

В dev и build используется webpack, рекомендованный Chakra UI для Pages Router
во избежание проблем гидратации Emotion с Turbopack.

## API и конфигурация

По умолчанию используется `https://jsonplaceholder.typicode.com`.
Для изменения адреса скопируйте `.env.example` в `.env.local` и задайте
`NEXT_PUBLIC_API_URL`. Это публичная переменная, включаемая в браузерную сборку:
после изменения нужна пересборка. Старый `API_URL` больше не используется.

- Список: `GET /posts?_limit=10&_page=1`, авторы: `GET /users`.
- Количество записей берётся из `X-Total-Count`; если заголовка нет или он некорректен,
  выполняется резервный `GET /posts`. Другой API должен разрешать CORS и доступ
  браузера к заголовку `X-Total-Count`.
- Детальная страница: `GET /posts/:id`, затем `GET /users/:userId`.
- Создание: `POST /posts` с JSON `{ "title": "...", "body": "...", "userId": 1 }`.
  JSONPlaceholder возвращает `201` и `id: 101`, **но не сохраняет пост**.
  Полученный результат выводится в консоль и показывается уведомление об имитации создания.
  Отправка JSON заменяет старое требование FormData.

Параметры списка синхронизируются с URL (`/?page=2&limit=5`). Разрешены лимиты
5, 10, 20; по умолчанию страница 1 и лимит 10. Некорректные параметры
нормализуются, страница за пределами списка заменяется последней.
Изменение лимита сбрасывает страницу на первую одним переходом.
Устаревшие запросы отменяются и не могут перезаписать актуальные данные.

Обложки загружаются из LoremFlickr. При ошибке используется локальная SVG-заглушка.
Аватары автора показывают инициалы без внешнего сервиса.

## Проверки

```sh
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:api
npm audit
```

Vitest проверяет HTTP-контракты, пагинацию, состояния ошибок и гонки запросов.
Playwright запускает production-сборку и проверяет desktop/mobile с подменой API:
навигацию, историю, 404, повтор загрузки, создание, ошибки формы, тему и fallback изображений.
Скриншоты и traces сохраняются в `test-results/`, HTML-отчёт — в `playwright-report/`.
`test:api` отдельно обращается к настоящему API и отправляет один тестовый POST.
Если нужен другой адрес, передайте `NEXT_PUBLIC_API_URL` в окружении команды.

Если скачивание Chromium недоступно, можно использовать установленный Google Chrome:
в PowerShell выполните `$env:PLAYWRIGHT_CHANNEL = 'chrome'`, затем `npm run test:e2e`.
При проверке этого обновления использован этот вариант из-за тайм-аута CDN Playwright.

## Совместимость зависимостей

Зависимости обновлены до стабильных совместимых версий; точные версии фиксирует
`package-lock.json`. TypeScript оставлен на 6.0.3, поскольку текущий
`typescript-eslint` не поддерживает TypeScript 7. ESLint оставлен на 9.39.5
из-за peer-ограничений `eslint-plugin-react`, используемого `eslint-config-next`.
Типы Node соответствуют целевому Node.js 24.

После безопасного `npm audit fix` остаётся цепочка dev-зависимостей
`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`:
5 high-записей аудита относятся к одной уязвимости `braces`
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)).
На момент обновления исправленной версии `braces` в npm нет; предлагаемый npm
откат `eslint-config-next` до 14 несовместим с выбранной миграцией.
В production-зависимостях известных уязвимостей аудит не обнаружил.
