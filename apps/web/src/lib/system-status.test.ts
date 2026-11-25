import { ApiClientError } from '@aei/api-client';
import type { HealthCheckResponse } from '@aei/validation';
import { describe, expect, it } from 'vitest';

import { parseServerEnv } from './env.schema';
import { getSystemStatus } from './system-status';

const health: HealthCheckResponse = {
  status: 'ok',
  version: '0.1.0',
  environment: 'test',
  uptimeSeconds: 1,
  timestamp: '2026-11-25T12:00:00.000Z',
  checks: { database: 'up' },
};

const clientReturning = (result: Promise<HealthCheckResponse>) => ({
  health: { check: () => result },
});

describe('getSystemStatus', () => {
  it('operational cuando la API y sus dependencias responden', async () => {
    const view = await getSystemStatus(clientReturning(Promise.resolve(health)));
    expect(view).toMatchObject({ tone: 'operational', version: '0.1.0' });
    expect(view.dependencies).toEqual([{ name: 'Base de datos', status: 'up' }]);
  });

  it('degraded cuando la API reporta una dependencia caída', async () => {
    const view = await getSystemStatus(
      clientReturning(
        Promise.resolve({ ...health, status: 'error', checks: { database: 'down' } }),
      ),
    );
    expect(view.tone).toBe('degraded');
  });

  it('unreachable (sin lanzar) cuando la API no responde', async () => {
    const view = await getSystemStatus(
      clientReturning(Promise.reject(new ApiClientError('network', 'fetch failed'))),
    );
    expect(view).toMatchObject({ tone: 'unreachable', dependencies: [] });
    expect(view.description).toMatch(/no está accesible/);
  });
});

describe('parseServerEnv', () => {
  it('acepta una URL http(s)', () => {
    expect(parseServerEnv({ API_URL: 'http://localhost:4000' }).API_URL).toBe(
      'http://localhost:4000',
    );
  });

  it('falla con un mensaje claro si falta API_URL', () => {
    expect(() => parseServerEnv({})).toThrow(/API_URL/);
  });
});
