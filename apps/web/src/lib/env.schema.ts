import { z } from 'zod';

/** Variables de entorno del servidor de Next.js (nunca llegan al navegador). */
export const serverEnvSchema = z.object({
  API_URL: z.url({ protocol: /^https?$/ }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Configuración de entorno inválida (web):\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
