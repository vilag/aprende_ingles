import { defineConfig } from 'vitest/config';

// Las pruebas de integración usan una base de datos PostgreSQL real y EXCLUSIVA de pruebas.
// Local: TEST_DATABASE_URL de apps/api/.env (docker compose). CI: servicio de Postgres.
try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: las variables deben venir del entorno.
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error('TEST_DATABASE_URL es obligatoria para las pruebas de integración.');
}

export default defineConfig({
  test: {
    include: ['test/**/*.int-spec.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
    },
  },
});
