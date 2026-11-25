import { defineConfig } from 'prisma/config';

// Prisma 7 no carga .env automáticamente. En local se usa apps/api/.env;
// en CI/producción las variables llegan del entorno y el archivo no existe.
try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: se usan las variables de entorno del proceso.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Opcional para `prisma generate`; obligatorio para migraciones.
    url: process.env.DATABASE_URL,
  },
});
