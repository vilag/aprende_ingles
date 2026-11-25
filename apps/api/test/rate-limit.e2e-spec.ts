import { apiErrorResponseSchema } from '@aei/validation';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Rate limiting (e2e)', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    // Límite bajo SOLO en este archivo. El módulo se importa después de fijar
    // el entorno porque ConfigModule valida las variables al cargarse.
    vi.stubEnv('THROTTLE_LIMIT', '2');
    const { createTestApp } = await import('./helpers/create-test-app.js');
    app = await createTestApp({
      prisma: { ping: () => Promise.resolve(), $disconnect: () => Promise.resolve() },
    });
  });

  afterAll(async () => {
    await app?.close();
    vi.unstubAllEnvs();
  });

  it('responde 429 con el formato estándar al superar el límite', async () => {
    if (!app) throw new Error('La aplicación no se inicializó');
    const server = app.getHttpServer();
    await request(server).get('/api/v1/health').expect(200);
    await request(server).get('/api/v1/health').expect(200);

    const res = await request(server).get('/api/v1/health').expect(429);

    expect(apiErrorResponseSchema.parse(res.body).statusCode).toBe(429);
  });
});
