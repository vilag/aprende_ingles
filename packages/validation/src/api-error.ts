import { z } from 'zod';

/** Detalle de un error de validación asociado a un campo. */
export const validationIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

/**
 * Formato único de error que devuelve la API para cualquier respuesta 4xx/5xx.
 * Los clientes (web, móvil, admin) dependen de este contrato.
 */
export const apiErrorResponseSchema = z.object({
  statusCode: z.number().int().min(400).max(599),
  error: z.string(),
  message: z.string(),
  path: z.string(),
  timestamp: z.iso.datetime(),
  requestId: z.string().optional(),
  issues: z.array(validationIssueSchema).optional(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
