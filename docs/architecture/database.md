# Base de datos

PostgreSQL 18 + Prisma 7. Esquema en `apps/api/prisma/schema.prisma`; configuración en `apps/api/prisma.config.ts`.

## Estado actual (FASE 1)

Infraestructura lista y verificada (conexión, health check, pruebas de integración). **Aún no hay modelos ni migraciones**: los modelos de dominio se agregan módulo por módulo desde la FASE 2, cada uno con su migración versionada.

## Convenciones

| Tema                    | Regla                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identificadores         | UUID v7 (ordenables en el tiempo): `id String @id @default(uuid(7)) @db.Uuid`                                                                                   |
| Fechas                  | Siempre UTC: `DateTime @db.Timestamptz(3)`. El contenedor corre con `TZ=UTC`.                                                                                   |
| Nombres                 | Modelos en PascalCase en Prisma; tablas y columnas en `snake_case` vía `@@map` / `@map`                                                                         |
| Auditoría               | `createdAt` / `updatedAt` en todas las tablas de negocio                                                                                                        |
| Integridad              | Relaciones explícitas, `onDelete` declarado siempre, `@@unique` para reglas de negocio                                                                          |
| Índices                 | En toda FK y en columnas de filtrado/orden frecuente; justificar índices compuestos                                                                             |
| Contenido vs resultados | El contenido pedagógico (cursos, lecciones, ejercicios) se versiona (`ContentVersion`) y nunca se mezcla con los resultados del estudiante (intentos, progreso) |
| Historial               | Los intentos (`ExerciseAttempt`, `SpeechAttempt`) son inmutables: se insertan, no se actualizan                                                                 |
| Duplicación             | No almacenar datos derivables salvo agregados de lectura justificados (p. ej. `SkillProgress`)                                                                  |
| Borrado                 | Borrado lógico solo donde haya requisito legal o de auditoría; el resto, físico con cascadas explícitas                                                         |

## Datos personales y audio

- Las grabaciones de voz se almacenarán en Cloudflare R2 (FASE 5), nunca en la base de datos; en BD solo la clave del objeto y metadatos.
- Política de retención de audio (a confirmar en FASE 5): eliminación automática tras un periodo definido y bajo solicitud del usuario; las transcripciones y evaluaciones se conservan desvinculadas del audio.
- La eliminación de cuenta debe borrar o anonimizar los datos personales en todas las tablas.

## Flujo de migraciones

```powershell
# Desarrollo: cambia schema.prisma y crea la migración
pnpm db:migrate              # prisma migrate dev --name <descripcion>
# Producción / CI: aplica migraciones existentes, nunca genera nuevas
pnpm --filter @aei/api db:migrate:deploy
```

- Las migraciones se versionan en `apps/api/prisma/migrations` y se revisan en el PR.
- Nunca editar una migración ya aplicada en otro entorno.
- Las pruebas de integración usan la base `aei_test`, nunca `aei_dev`.
