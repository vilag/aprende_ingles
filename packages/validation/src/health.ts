import { z } from 'zod';

/** Estado de una dependencia individual (base de datos, caché, etc.). */
export const dependencyStatusSchema = z.enum(['up', 'down']);
export type DependencyStatus = z.infer<typeof dependencyStatusSchema>;

/**
 * Respuesta de `GET /api/v1/health`.
 *
 * - `ok`: todas las dependencias responden (HTTP 200).
 * - `error`: al menos una dependencia no responde (HTTP 503).
 *
 * No expone detalles internos (hosts, mensajes de error de drivers, etc.).
 */
export const healthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  version: z.string().min(1),
  environment: z.enum(['development', 'test', 'production']),
  uptimeSeconds: z.number().int().nonnegative(),
  timestamp: z.iso.datetime(),
  checks: z.object({
    database: dependencyStatusSchema,
  }),
});
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
