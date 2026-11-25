import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const commaSeparatedOrigins = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  )
  .pipe(z.array(z.url({ protocol: /^https?$/ })));

/**
 * Variables de entorno de la API. Se validan al arrancar: si algo falta o es
 * inválido, la API no inicia (fail fast) y el error indica qué variable revisar.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    /** Orígenes permitidos por CORS, separados por comas. Vacío = ninguno. */
    CORS_ORIGINS: commaSeparatedOrigins,
    /** Swagger UI en /api/docs. Por defecto activo fuera de producción. */
    SWAGGER_ENABLED: booleanString.optional(),
    /** Activar solo si la API corre detrás de un proxy/balanceador de confianza. */
    TRUST_PROXY: booleanString.default(false),
    THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
  })
  .transform(({ SWAGGER_ENABLED, ...env }) => ({
    ...env,
    SWAGGER_ENABLED: SWAGGER_ENABLED ?? env.NODE_ENV !== 'production',
  }));

export type Env = z.output<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    // prettifyError describe el campo y la regla incumplida; no incluye los valores recibidos.
    throw new Error(`Configuración de entorno inválida:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
