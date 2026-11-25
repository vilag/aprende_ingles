import { describe, expect, it, vi } from 'vitest';

import { ApiClientError, createApiClient } from './index.js';

const healthyBody = {
  status: 'ok',
  version: '0.1.0',
  environment: 'test',
  uptimeSeconds: 5,
  timestamp: '2026-11-25T12:00:00.000Z',
  checks: { database: 'up' },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createApiClient().health.check', () => {
  it('construye la URL con el prefijo /api/v1 y elimina la barra final de baseUrl', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(healthyBody, 200));
    const client = createApiClient({ baseUrl: 'http://api.test/', fetch: fetchMock });

    await client.health.check();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('devuelve la respuesta validada cuando la API está sana', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(healthyBody, 200)),
    });

    await expect(client.health.check()).resolves.toEqual(healthyBody);
  });

  it('trata un 503 con cuerpo válido como respuesta (estado degradado), no como excepción', async () => {
    const degraded = { ...healthyBody, status: 'error', checks: { database: 'down' } };
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(degraded, 503)),
    });

    await expect(client.health.check()).resolves.toMatchObject({
      status: 'error',
      checks: { database: 'down' },
    });
  });

  it('lanza invalid_response si el cuerpo no cumple el contrato', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ status: 'ok' }, 200)),
    });

    await expect(client.health.check()).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  it('lanza http con el cuerpo de error tipado', async () => {
    const errorBody = {
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      path: '/api/v1/health',
      timestamp: '2026-11-25T12:00:00.000Z',
    };
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(errorBody, 429)),
    });

    const error = await client.health.check().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ kind: 'http', status: 429, message: 'Rate limit exceeded' });
  });

  it('lanza network cuando fetch falla', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed')),
    });

    await expect(client.health.check()).rejects.toMatchObject({ kind: 'network' });
  });

  it('lanza timeout cuando se supera el tiempo límite', async () => {
    const neverResolves: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: neverResolves,
      timeoutMs: 10,
    });

    await expect(client.health.check()).rejects.toMatchObject({ kind: 'timeout' });
  });
});
