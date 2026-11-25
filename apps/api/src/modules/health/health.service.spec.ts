import { healthCheckResponseSchema } from '@aei/validation';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../../database/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  const ping = vi.fn<() => Promise<void>>();
  let service: HealthService;

  beforeEach(async () => {
    ping.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { ping } },
        { provide: ConfigService, useValue: { get: () => 'test' } },
      ],
    }).compile();
    service = moduleRef.get(HealthService);
  });

  it('reporta ok cuando la base de datos responde', async () => {
    ping.mockResolvedValue(undefined);

    const result = await service.check();

    expect(healthCheckResponseSchema.parse(result)).toEqual(result);
    expect(result).toMatchObject({ status: 'ok', environment: 'test', checks: { database: 'up' } });
  });

  it('reporta error (sin lanzar) cuando la base de datos no responde', async () => {
    ping.mockRejectedValue(
      Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }),
    );

    const result = await service.check();

    expect(result).toMatchObject({ status: 'error', checks: { database: 'down' } });
  });

  it('incluye la versión del package.json de la API', async () => {
    ping.mockResolvedValue(undefined);

    const result = await service.check();

    expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
