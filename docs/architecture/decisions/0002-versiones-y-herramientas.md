# ADR 0002 — Versiones y herramientas (FASE 1)

- **Estado:** aceptada
- **Fecha:** 2026-11-25

Criterio general: última versión **estable** compatible con el resto del stack. Nada en RC/beta salvo justificación.

## Versiones elegidas

| Herramienta | Versión          | Motivo                                                                                                                 |
| ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Node.js     | 22 LTS (22.22.3) | Requerido ≥ 22.12 por Prisma 7.                                                                                        |
| pnpm        | 12.23            | Estable desde ago-2026. Catálogos, `allowBuilds` y edad mínima de publicación (protección de cadena de suministro).    |
| TypeScript  | 6.0.x            | **No 7.0**: TS 7 (compilador nativo) aún no es soportado por typescript-eslint (`<6.1`), ts-jest ni Nest CLI (`~6.0`). |
| NestJS      | 12.6             | Estable. ESM nativo, validación Standard Schema.                                                                       |
| Prisma      | 7.10.1           | **No 8.x**: el dist-tag `latest` de npm apunta a `8.0.0-rc.*` (release candidate). Se fija 7.10.1 de forma exacta.     |
| Next.js     | 16.4             | Estable; Cache Components.                                                                                             |
| Expo SDK    | 58               | Estable (React Native 0.88, React 19.3 — misma versión de React que la web).                                           |
| PostgreSQL  | 18               | Imagen oficial `postgres:18-alpine`.                                                                                   |
| Vitest      | 5.1              | Estable.                                                                                                               |

Cuando una versión llevaba **menos de un día publicada** (p. ej. NestJS 12.6.2, Vitest 5.1.2), se dejó que pnpm resolviera la anterior madura en vez de saltarse la política de edad mínima.

## Desviaciones respecto al plan original

1. **Vitest en lugar de Jest para la API.** NestJS 12 es solo ESM y su generador oficial usa Vitest. Jest con ESM requiere configuración experimental. Un solo runner (Vitest) en todo el monorepo simplifica CI. Las pruebas usan `@nestjs/testing` igual que antes.
2. **ESLint dividido.**
   - API y paquetes: **ESLint 10** (versión soportada), con `typescript-eslint` en modo `strictTypeChecked`.
   - Web y móvil: **ESLint 9** (catálogo `eslint9`), porque `eslint-config-next` y `eslint-config-expo` dependen de `eslint-plugin-react`, `jsx-a11y` e `import`, que aún no declaran soporte para ESLint 10. Los generadores oficiales de Next 16.4 y Expo 58 también fijan ESLint 9.
   - ESLint 9 ya no recibe soporte. Es una herramienta solo de desarrollo (no llega a producción). **Acción:** migrar web y móvil a ESLint 10 cuando esos plugins lo soporten (Dependabot avisará).
3. **Zod con Standard Schema en NestJS** en lugar de DTOs con `class-validator`: los mismos esquemas validan la API, documentan Swagger (`@ApiResponse({ standardSchema })`) y validan respuestas en los clientes. Una sola fuente de verdad.
4. **Paquetes y `apps/admin` diferidos** hasta que tengan código real (ver overview).
5. **Variables de entorno por aplicación** además del `.env.example` raíz (que solo configura Docker Compose), para que ningún cliente reciba secretos del backend.
6. **Elementos retirados del scaffolding oficial:**
   - `@nestjs/observe` (servicio externo de telemetría que el generador de Nest 12 conecta por defecto) y `@nestjs/mau` (despliegue en la nube de Nest): no forman parte del stack; la observabilidad será Sentry/PostHog.
   - `oxlint` del generador de Nest: se usa el ESLint compartido.
   - Contenido de demostración de Expo y Next.
7. **Sentry y PostHog** no se integran en la FASE 1: requieren cuentas/DSN y no hay flujos de usuario que medir. Se integran en la FASE 2 (errores) y FASE 6 (analítica de producto).
8. **Sin `tsconfig.json` en la raíz.** Las bases de TypeScript viven en `packages/config/tsconfig/` (`base`, `library`, `nestjs`) y cada paquete tiene el suyo. Un `tsconfig.json` raíz no compilaría nada (no hay código TypeScript en la raíz) y podría confundir al editor.
9. **`infrastructure/deployment/` diferido a la FASE 8**, cuando se elija proveedor de hosting. Hoy existe el Dockerfile de producción de la API (`infrastructure/docker/`), verificado en local y construido en CI.
10. **Turborepo en modo estricto de variables de entorno** (comportamiento por defecto de Turbo 2): las tareas solo reciben las variables declaradas en `turbo.json`. Es más seguro y hace fiable la caché, pero obliga a declarar cada variable nueva que una tarea lea del entorno del proceso (ver `docs/development/README.md`).

## Seguridad de instalación

`pnpm-workspace.yaml → allowBuilds`: solo `prisma` y `@prisma/engines` pueden ejecutar scripts de instalación. `@scarf/scarf` (telemetría) está bloqueado. Un paquete nuevo con scripts hace fallar la instalación hasta revisarlo.
