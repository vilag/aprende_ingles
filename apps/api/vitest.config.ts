import { defineConfig } from 'vitest/config';

/**
 * Pruebas unitarias (src/**\/*.spec.ts) y e2e (test/**\/*.e2e-spec.ts).
 * No requieren base de datos: las e2e sustituyen PrismaService por un doble.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    // Arrancar la app Nest completa puede tardar más de 10 s con la máquina/CI bajo carga.
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://unused:unused@127.0.0.1:1/unused',
      CORS_ORIGINS: 'http://localhost:3000',
      SWAGGER_ENABLED: 'true',
      THROTTLE_LIMIT: '1000',
    },
  },
});
