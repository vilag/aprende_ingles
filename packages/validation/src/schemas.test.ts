import { describe, expect, it } from 'vitest';

import { apiErrorResponseSchema, healthCheckResponseSchema } from './index.js';

describe('healthCheckResponseSchema', () => {
  const valid = {
    status: 'ok',
    version: '0.1.0',
    environment: 'development',
    uptimeSeconds: 12,
    timestamp: '2026-11-25T12:00:00.000Z',
    checks: { database: 'up' },
  };

  it('acepta una respuesta válida', () => {
    expect(healthCheckResponseSchema.parse(valid)).toEqual(valid);
  });

  it('rechaza un estado desconocido', () => {
    const result = healthCheckResponseSchema.safeParse({ ...valid, status: 'maybe' });
    expect(result.success).toBe(false);
  });

  it('rechaza un timestamp que no es ISO 8601', () => {
    const result = healthCheckResponseSchema.safeParse({ ...valid, timestamp: 'ayer' });
    expect(result.success).toBe(false);
  });

  it('rechaza uptime negativo', () => {
    const result = healthCheckResponseSchema.safeParse({ ...valid, uptimeSeconds: -1 });
    expect(result.success).toBe(false);
  });
});

describe('apiErrorResponseSchema', () => {
  it('acepta un error con detalles de validación', () => {
    const payload = {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      path: '/api/v1/example',
      timestamp: '2026-11-25T12:00:00.000Z',
      issues: [{ path: 'email', message: 'Invalid email' }],
    };
    expect(apiErrorResponseSchema.parse(payload)).toEqual(payload);
  });

  it('rechaza códigos HTTP que no son de error', () => {
    const result = apiErrorResponseSchema.safeParse({
      statusCode: 200,
      error: 'OK',
      message: 'ok',
      path: '/',
      timestamp: '2026-11-25T12:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});
