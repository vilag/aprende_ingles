# Arquitectura

## Estilo: monolito modular en un monorepo

Una sola API (NestJS) desplegable, organizada en módulos de dominio con límites claros, y varios clientes (web, móvil, admin) que la consumen. No hay microservicios: se evaluarán solo si un módulo tiene necesidades de escala o despliegue claramente distintas (ver [ADR 0001](decisions/0001-monolito-modular.md)).

```
            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
            │  apps/web    │   │ apps/mobile  │   │ apps/admin   │ (fase futura)
            │  Next.js     │   │ Expo / RN    │   │              │
            └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                   │  @aei/api-client (HTTP tipado, valida con @aei/validation)
                   └──────────────────┼──────────────────┘
                                      ▼
                         ┌────────────────────────┐
                         │ apps/api  (NestJS)     │
                         │  módulos de dominio    │
                         │  Learning Engine       │──► Proveedores de IA (fase 4+)
                         └───────┬──────────┬─────┘
                                 ▼          ▼
                           PostgreSQL     Redis (colas BullMQ, fase 4+)
```

## Paquetes

| Paquete           | Responsabilidad                                                                                            | Consumidores         |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | -------------------- |
| `@aei/config`     | Bases de `tsconfig` y configuración ESLint compartida                                                      | Todos (dev)          |
| `@aei/validation` | Esquemas Zod de los contratos de la API y tipos inferidos                                                  | API, api-client, web |
| `@aei/api-client` | Cliente HTTP tipado; valida respuestas; errores tipados (`network`, `timeout`, `http`, `invalid_response`) | web, móvil           |

Los paquetes internos se compilan a ESM en `dist/` con `tsc`. Turborepo construye las dependencias antes que sus consumidores (`dependsOn: ["^build"]`).

### Paquetes planificados (se crean cuando haya código real para ellos)

| Paquete              | Fase | Propósito                                                                                                                                   |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin`         | 3    | Gestión de contenido, usuarios y métricas                                                                                                   |
| `@aei/ui`            | 2–3  | Componentes compartidos cuando exista UI que reutilizar entre web y admin                                                                   |
| `@aei/learning-core` | 3–6  | Reglas puras del motor pedagógico (repetición espaciada, criterios de avance), sin dependencias de framework, 100 % probadas                |
| `@aei/ai-contracts`  | 4    | Interfaces `LLMProvider`, `SpeechToTextProvider`, `TextToSpeechProvider`, `PronunciationEvaluationProvider` y esquemas de salida de agentes |
| `@aei/shared-types`  | —    | Solo si aparecen tipos que no derivan de un esquema Zod; hoy los tipos se infieren de `@aei/validation`                                     |

## Reglas de dependencia

1. Las apps dependen de paquetes; los paquetes nunca dependen de apps.
2. Web y móvil **nunca** hablan con la base de datos ni con proveedores de IA: solo con la API.
3. Ningún secreto llega a un cliente. Las variables `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` son públicas por definición.
4. Los agentes de IA no modifican el progreso del estudiante directamente: proponen; el Learning Engine decide con reglas explícitas y trazables.
5. Los contratos HTTP se definen una vez en `@aei/validation` y se usan para validar (API), documentar (Swagger) y consumir (clientes).

## API (apps/api)

```
src/
  main.ts               Arranque
  app.module.ts         Módulo raíz: config, rate limiting, base de datos, módulos
  app.setup.ts          Config HTTP transversal (compartida con pruebas e2e)
  config/               Validación de entorno (Zod), versión
  common/               Filtro global de errores, request-id, validación
  database/             PrismaService (adapter-pg), DatabaseModule global
  modules/<dominio>/    Módulos de negocio (health hoy; auth, users, … después)
  generated/prisma/     Cliente Prisma generado (no versionado)
```

Transversal desde la FASE 1:

- **Configuración validada** al arrancar (fail fast, sin filtrar valores).
- **Errores uniformes** (`ApiErrorResponse`): los 5xx nunca exponen detalles internos; se registran con `requestId`.
- **Seguridad HTTP:** helmet, CORS con lista blanca, rate limiting global por IP, `X-Request-Id`.
- **Versionado** por URI: `/api/v1/...`.
- **OpenAPI** en `/api/docs` (desactivado por defecto en producción).

## Módulos de dominio previstos

Auth · Users · Assessment · Learning Engine · Courses · AI Tutor · Conversation · Speech · Vocabulary · Progress · Subscription · Admin. Cada uno se agregará como `src/modules/<nombre>` con su controlador, servicio, esquemas en `@aei/validation`, modelos Prisma y pruebas.
