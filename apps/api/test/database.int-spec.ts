import { healthCheckResponseSchema } from '@aei/validation';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/database/prisma.service.js';
import { createTestApp } from './helpers/create-test-app.js';

/**
 * Integración real con PostgreSQL (sin dobles). Requiere `pnpm infra:up`
 * en local o el servicio de Postgres en CI.
 */
describe('PostgreSQL (integración)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    // Si beforeAll falló, `app` no existe: no ocultar el error original con otro.
    await (app as NestExpressApplication | undefined)?.close();
  });

  it('Prisma se conecta y ejecuta consultas', async () => {
    const prisma = app.get(PrismaService);

    const rows = await prisma.$queryRaw<{ version: string }[]>`SELECT version() AS version`;

    expect(rows[0]?.version).toMatch(/^PostgreSQL/);
  });

  it('el health check reporta la base de datos como disponible', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(healthCheckResponseSchema.parse(res.body).checks.database).toBe('up');
  });
});
