# Guía de desarrollo

La puesta en marcha está en el [README principal](../../README.md). Aquí: cómo trabajar en el código.

## Estándares

- TypeScript estricto (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`…). `any` prohibido salvo justificación explícita (`eslint-disable` + comentario).
- Archivos pequeños con una responsabilidad. Sin código muerto ni funcionalidades simuladas.
- Errores: nunca se ocultan. En la API, lanzar excepciones HTTP de Nest; el filtro global las formatea.
- Logs: en inglés, sin datos personales, tokens, cuerpos de petición ni cadenas de conexión.
- Comentarios y documentación en español; identificadores en inglés.
- Prettier formatea todo (`pnpm format`); CI falla si hay archivos sin formatear.

## Estrategia de pruebas

| Tipo        | Dónde                                      | Herramienta                              | Requiere                          |
| ----------- | ------------------------------------------ | ---------------------------------------- | --------------------------------- |
| Unitarias   | junto al código (`*.spec.ts`, `*.test.ts`) | Vitest                                   | nada                              |
| E2E de API  | `apps/api/test/*.e2e-spec.ts`              | Vitest + Supertest + `@nestjs/testing`   | nada (BD sustituida por un doble) |
| Integración | `apps/api/test/*.int-spec.ts`              | Vitest                                   | PostgreSQL (`aei_test`)           |
| E2E web     | `apps/web/e2e/*.spec.ts`                   | Playwright (Chromium escritorio + móvil) | build de la web                   |

Reglas: cada cambio de comportamiento lleva su prueba; las reglas del Learning Engine tendrán cobertura completa; ninguna prueba depende de servicios externos de pago (los proveedores de IA se sustituyen por dobles).

## Agregar un módulo a la API

1. Esquemas de request/response en `packages/validation/src/<modulo>.ts` (+ export en `index.ts`) con pruebas.
2. Modelos en `apps/api/prisma/schema.prisma` → `pnpm db:migrate` (nombre descriptivo).
3. `apps/api/src/modules/<modulo>/`: `*.module.ts`, `*.controller.ts`, `*.service.ts`, pruebas.
4. Validación de entrada con `@Body({ schema })`; documentación con `@ApiResponse({ standardSchema })`.
5. Importar el módulo en `app.module.ts`.
6. Métodos tipados en `packages/api-client` para los clientes.
7. Actualizar `docs/api/README.md`.

## Variables de entorno

| Archivo               | Quién lo lee                            | Notas                                      |
| --------------------- | --------------------------------------- | ------------------------------------------ |
| `.env` (raíz)         | Docker Compose                          | Opcional                                   |
| `apps/api/.env`       | API, Prisma CLI, pruebas de integración | Validado con Zod al arrancar               |
| `apps/web/.env.local` | Next.js                                 | Solo servidor salvo prefijo `NEXT_PUBLIC_` |
| `apps/mobile/.env`    | Expo                                    | Todo `EXPO_PUBLIC_*` es público            |

Una variable nueva siempre se documenta en el `.env.example` correspondiente y, en la API, en `src/config/env.schema.ts`.

**Turborepo filtra variables (modo estricto).** Las tareas lanzadas con `turbo` solo reciben las variables declaradas en `turbo.json` (`globalEnv`, `env`, `passThroughEnv`). Los archivos `.env` que cada herramienta lee desde disco no se ven afectados, pero una variable definida en la terminal o en CI sí. Si una tarea necesita una variable nueva del entorno del proceso:

- Si afecta al resultado del build o de las pruebas, va en `env` de esa tarea (forma parte del hash de caché).
- Si solo se usa en desarrollo, va en `passThroughEnv` de `dev`.

Ejemplo real: `TEST_DATABASE_URL` está en `env` de `test:integration`, porque en CI no existe `apps/api/.env`.

## Dependencias

- Paquetes compartidos por varias apps: versión en el catálogo de `pnpm-workspace.yaml` (`"catalog:"`).
- App móvil: usar `pnpm --filter @aei/mobile exec expo install <paquete>` para obtener versiones compatibles con el SDK.
- Un paquete que necesite scripts de instalación debe revisarse y agregarse a `allowBuilds`.
