import { apiErrorResponseSchema, healthCheckResponseSchema } from '@aei/validation';
import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createTestApp } from './helpers/create-test-app.js';

/**
 * Controlador SOLO para pruebas: ejercita la validación global y el manejo de
 * errores inesperados sin exponer endpoints ficticios en la aplicación real.
 */
const signupProbeSchema = z.object({
  email: z.email(),
  age: z.number().int().min(13),
});

@Controller({ path: 'test-probe', version: '1' })
class ProbeController {
  @Post('validate')
  validate(@Body({ schema: signupProbeSchema }) body: z.infer<typeof signupProbeSchema>) {
    return { received: body };
  }

  @Get('crash')
  crash(): never {
    throw new Error('detalle interno que no debe filtrarse: password=hunter2');
  }
}

@Module({ controllers: [ProbeController] })
class ProbeModule {}

describe('API (e2e)', () => {
  const prisma = {
    ping: vi.fn<() => Promise<void>>(),
    $disconnect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp({ prisma, extraModules: [ProbeModule] });
  });

  afterAll(async () => {
    // Si beforeAll falló, `app` no existe: no ocultar el error original con otro.
    await (app as NestExpressApplication | undefined)?.close();
  });

  beforeEach(() => {
    prisma.ping.mockReset();
  });

  describe('GET /api/v1/health', () => {
    it('responde 200 con el contrato compartido cuando la base de datos responde', async () => {
      prisma.ping.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      const body = healthCheckResponseSchema.parse(res.body);
      expect(body).toMatchObject({ status: 'ok', environment: 'test', checks: { database: 'up' } });
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('responde 503 cuando la base de datos no responde', async () => {
      prisma.ping.mockRejectedValue(new Error('ECONNREFUSED'));

      const res = await request(app.getHttpServer()).get('/api/v1/health').expect(503);

      expect(healthCheckResponseSchema.parse(res.body)).toMatchObject({
        status: 'error',
        checks: { database: 'down' },
      });
    });
  });

  describe('errores', () => {
    it('devuelve 404 con el formato de error estándar y requestId', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/no-existe?token=abc').expect(404);

      const body = apiErrorResponseSchema.parse(res.body);
      expect(body.path).toBe('/api/v1/no-existe');
      expect(body.requestId).toBe(res.headers['x-request-id']);
    });

    it('oculta el detalle de errores inesperados (500)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/test-probe/crash').expect(500);

      const body = apiErrorResponseSchema.parse(res.body);
      expect(body.message).toBe('Internal server error');
      expect(JSON.stringify(res.body)).not.toContain('hunter2');
    });
  });

  describe('validación con Zod (Standard Schema)', () => {
    it('acepta un cuerpo válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-probe/validate')
        .send({ email: 'ana@example.com', age: 30 })
        .expect(201);

      expect(res.body).toEqual({ received: { email: 'ana@example.com', age: 30 } });
    });

    it('rechaza un cuerpo inválido con 400 e issues por campo', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-probe/validate')
        .send({ email: 'no-es-email', age: 5 })
        .expect(400);

      const body = apiErrorResponseSchema.parse(res.body);
      expect(body.issues?.map((issue) => issue.path).sort()).toEqual(['age', 'email']);
    });
  });

  describe('seguridad HTTP', () => {
    it('aplica cabeceras de seguridad y oculta la tecnología del servidor', async () => {
      prisma.ping.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).get('/api/v1/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('permite CORS solo para orígenes configurados', async () => {
      prisma.ping.mockResolvedValue(undefined);

      const allowed = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000');
      expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');

      const denied = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('Origin', 'https://sitio-malicioso.example');
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('respeta un X-Request-Id seguro y reemplaza uno inválido', async () => {
      prisma.ping.mockResolvedValue(undefined);

      const kept = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('X-Request-Id', 'abc-12345678');
      expect(kept.headers['x-request-id']).toBe('abc-12345678');

      const replaced = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('X-Request-Id', '<script>alert(1)</script>');
      expect(replaced.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('documentación OpenAPI', () => {
    it('publica el documento OpenAPI con el endpoint de health', async () => {
      const res = await request(app.getHttpServer()).get('/api/docs/openapi.json').expect(200);

      const doc = z
        .object({ openapi: z.string(), paths: z.record(z.string(), z.unknown()) })
        .parse(res.body);
      expect(Object.keys(doc.paths)).toContain('/api/v1/health');
    });
  });
});
