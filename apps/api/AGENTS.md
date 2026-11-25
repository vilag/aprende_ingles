# AGENTS.md — apps/api

## NestJS 12

Esta versión de NestJS probablemente es más nueva que tu conocimiento. https://docs.nestjs.com/llms.txt indexa su documentación (una página markdown por capítulo). Consulta los tipos en `node_modules/@nestjs/*` antes de asumir una API.

- Los paquetes de Nest son **solo ESM**, y este proyecto también: las importaciones relativas terminan en `.js`, `__dirname` no existe (usa `import.meta.dirname`).
- Las pruebas usan **Vitest** (`vi.fn()`, no `jest.fn()`).
- La validación usa **Zod vía Standard Schema**: `@Body({ schema })`, `@Param('id', { schema })`, con el `StandardSchemaValidationPipe` global configurado en `src/common/validation/validation.ts`. No uses `class-validator`.
- Swagger documenta respuestas con `@ApiResponse({ standardSchema })` usando los esquemas de `@aei/validation`.

## Convenciones del proyecto

- Estructura: `src/modules/<módulo>/` para módulos de dominio; `src/common/` para piezas transversales; `src/config/` para entorno; `src/database/` para Prisma.
- Los contratos públicos (requests/responses) viven en `packages/validation` para compartirlos con web y móvil.
- `src/app.setup.ts` contiene la configuración HTTP (helmet, CORS, prefijo, versionado, pipes, filtros, Swagger). Las pruebas e2e la reutilizan mediante `test/helpers/create-test-app.ts`.
- Prisma 7: cliente generado en `src/generated/prisma` (no versionado; `pnpm db:generate`). La conexión usa `@prisma/adapter-pg`.
- Pruebas: unitarias junto al código (`*.spec.ts`), e2e en `test/*.e2e-spec.ts` (sin BD), integración en `test/*.int-spec.ts` (PostgreSQL real, `pnpm test:integration`).
- Logs en inglés y sin datos sensibles (sin cuerpos de petición, tokens ni cadenas de conexión).
