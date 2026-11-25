# AI English Immersion

Plataforma SaaS para aprender inglés con inteligencia artificial, dirigida a hispanohablantes de México y Latinoamérica. Web, Android e iOS sobre una única API.

> **Estado:** FASE 1 — fundación técnica. Monorepo, API, web, móvil, base de datos, calidad y CI funcionando. Las funcionalidades de producto (usuarios, cursos, tutor de IA…) se construyen a partir de la FASE 2. Ver [docs/requirements/product-vision.md](docs/requirements/product-vision.md).

## Stack

| Capa            | Tecnología                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| Monorepo        | pnpm 12 (workspaces + catálogos) · Turborepo 2                                   |
| API             | NestJS 12 (ESM) · REST versionado · OpenAPI/Swagger · Zod (Standard Schema)      |
| Base de datos   | PostgreSQL 18 · Prisma 7 (`@prisma/adapter-pg`)                                  |
| Web             | Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4            |
| Móvil           | Expo SDK 58 · React Native 0.88 · Expo Router · TanStack Query                   |
| Infraestructura | Docker Compose (PostgreSQL + Redis) · Dockerfile de producción de la API         |
| Calidad         | TypeScript 6 estricto · ESLint · Prettier · Vitest · Playwright · GitHub Actions |

Las razones de cada versión están en [docs/architecture/decisions/0002-versiones-y-herramientas.md](docs/architecture/decisions/0002-versiones-y-herramientas.md).

## Estructura

```
apps/
  api/        API NestJS (monolito modular) + Prisma
  web/        Aplicación web Next.js
  mobile/     Aplicación Expo (Android / iOS)
packages/
  config/       Bases compartidas de TypeScript y ESLint
  validation/   Esquemas Zod = contratos de la API (compartidos por API y clientes)
  api-client/   Cliente HTTP tipado que usan web y móvil
infrastructure/
  docker/       Dockerfile de producción de la API
  database/     Scripts de inicialización de PostgreSQL local
docs/           Arquitectura, decisiones, requisitos, API y desarrollo
```

`apps/admin` y los paquetes `ui`, `learning-core`, `ai-contracts` y `shared-types` se crearán en la fase que los necesite (no se crean paquetes vacíos). Ver [docs/architecture/overview.md](docs/architecture/overview.md).

---

## Puesta en marcha en Windows 10 (PowerShell)

### 1. Requisitos

| Herramienta    | Versión                                              | Comprobar        |
| -------------- | ---------------------------------------------------- | ---------------- |
| Node.js        | 22.12 o superior (recomendado 22.22.3, ver `.nvmrc`) | `node --version` |
| pnpm           | 12.23.0 (vía Corepack)                               | `pnpm --version` |
| Docker Desktop | con WSL 2 y el motor en ejecución                    | `docker info`    |
| Git            | cualquiera reciente                                  | `git --version`  |

**Node con nvm-windows** (si tienes varias versiones):

```powershell
nvm install 22.22.3
nvm use 22.22.3
node --version   # v22.22.3
```

**Activar pnpm** (Corepack viene con Node; ejecutar una sola vez):

```powershell
corepack enable pnpm
corepack prepare pnpm@12.23.0 --activate
pnpm --version   # 12.23.0
```

> Si PowerShell bloquea `pnpm.ps1` con "la ejecución de scripts está deshabilitada", ejecuta una vez:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### 2. Instalar dependencias

```powershell
pnpm install
```

pnpm 12 aplica políticas de cadena de suministro: solo los paquetes listados en `allowBuilds` (`pnpm-workspace.yaml`) pueden ejecutar scripts de instalación, y se evitan versiones publicadas hace muy poco.

### 3. Variables de entorno

Cada aplicación tiene su propio archivo (así ningún cliente recibe secretos del backend):

```powershell
Copy-Item apps\api\.env.example    apps\api\.env
Copy-Item apps\web\.env.example    apps\web\.env.local
Copy-Item apps\mobile\.env.example apps\mobile\.env
# Opcional (docker-compose ya tiene valores por defecto):
Copy-Item .env.example .env
```

Los archivos `.env` están en `.gitignore`. Nunca subas claves reales al repositorio.

### 4. Levantar PostgreSQL y Redis

Con Docker Desktop abierto:

```powershell
pnpm infra:up       # docker compose up -d
docker compose ps   # ambos servicios deben aparecer "healthy"
```

- PostgreSQL queda en **localhost:5433** (no 5432, para no chocar con un PostgreSQL instalado en Windows). Bases: `aei_dev` y `aei_test`.
- Redis queda en **localhost:6379** (se usará con BullMQ en fases posteriores).
- Los puertos solo escuchan en `127.0.0.1`.

### 5. Ejecutar en desarrollo

```powershell
pnpm dev            # API + web en paralelo
```

| Servicio                            | URL                                 |
| ----------------------------------- | ----------------------------------- |
| API                                 | http://localhost:4000/api/v1/health |
| Swagger UI                          | http://localhost:4000/api/docs      |
| Web                                 | http://localhost:3000               |
| Estado del sistema (web → API → BD) | http://localhost:3000/status        |

Por separado: `pnpm dev:api`, `pnpm dev:web`.

### 6. App móvil

```powershell
pnpm dev:mobile     # inicia Metro (Expo) en http://localhost:8081
```

- **Teléfono físico:** instala _Expo Go_, escanea el QR y pon en `apps/mobile/.env` la IP de tu PC en la red local (`ipconfig` → "Dirección IPv4"), p. ej. `EXPO_PUBLIC_API_URL=http://192.168.1.50:4000`. Agrega ese origen a `CORS_ORIGINS` solo si usas Expo web. Puede que necesites permitir Node.js en el Firewall de Windows (red privada).
- **Emulador Android:** usa `http://10.0.2.2:4000` (valor por defecto del ejemplo).
- **iOS:** requiere macOS para el simulador; en Windows usa Expo Go en un iPhone o compila con EAS.

La pantalla inicial muestra si la app logra conectarse con la API.

---

## Comandos

| Comando                                       | Qué hace                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                    | API + web en modo desarrollo                                                                                    |
| `pnpm build`                                  | Compila todos los paquetes y apps                                                                               |
| `pnpm lint`                                   | ESLint en todo el monorepo                                                                                      |
| `pnpm typecheck`                              | Verificación de tipos                                                                                           |
| `pnpm test`                                   | Pruebas unitarias y e2e de API (sin BD)                                                                         |
| `pnpm test:integration`                       | Pruebas contra PostgreSQL real (requiere `pnpm infra:up`)                                                       |
| `pnpm test:e2e`                               | Playwright sobre el build de la web (la primera vez: `pnpm --filter @aei/web exec playwright install chromium`) |
| `pnpm format` / `pnpm format:check`           | Prettier                                                                                                        |
| `pnpm infra:up` / `infra:down` / `infra:logs` | Docker Compose                                                                                                  |
| `pnpm db:generate`                            | Genera el cliente Prisma                                                                                        |
| `pnpm db:migrate`                             | Crea/aplica migraciones en desarrollo                                                                           |
| `pnpm db:status`                              | Estado de las migraciones                                                                                       |
| `pnpm db:studio`                              | Prisma Studio                                                                                                   |
| `pnpm --filter @aei/mobile doctor`            | Diagnóstico de Expo                                                                                             |

Comprobación completa equivalente a CI:

```powershell
pnpm install --frozen-lockfile; pnpm format:check; pnpm turbo run lint typecheck test build
```

Imagen de producción de la API:

```powershell
docker build -f infrastructure/docker/api.Dockerfile -t aei-api .
```

## Solución de problemas

| Síntoma                                                | Solución                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `node --version` muestra una versión antigua           | `nvm use 22.22.3` y abre una terminal nueva                                                            |
| `pnpm` no se reconoce                                  | `corepack enable pnpm`                                                                                 |
| `failed to connect to the docker API`                  | Abre Docker Desktop y espera a que el motor esté en ejecución                                          |
| Puerto 5433 ocupado                                    | Cambia `POSTGRES_PORT` en `.env` y el puerto de `DATABASE_URL` en `apps/api/.env`                      |
| La API no arranca: "Configuración de entorno inválida" | Revisa `apps/api/.env`; el mensaje indica la variable                                                  |
| El móvil dice "Sin conexión con la API"                | `EXPO_PUBLIC_API_URL` no puede ser `localhost` en un teléfono; usa la IP de tu PC                      |
| Git muestra `Filename too long`                        | `git config --global core.longpaths true` (límite de rutas de Windows en dependencias de React Native) |
| Health devuelve 503                                    | PostgreSQL no responde: `pnpm infra:up`                                                                |

## Documentación

- [Arquitectura](docs/architecture/overview.md) · [Decisiones (ADR)](docs/architecture/decisions/) · [Base de datos](docs/architecture/database.md)
- [Visión y fases del producto](docs/requirements/product-vision.md)
- [Convenciones de la API](docs/api/README.md)
- [Guía de desarrollo](docs/development/README.md)
