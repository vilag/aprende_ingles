import type { DependencyStatus, HealthCheckResponse } from '@aei/validation';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APP_VERSION } from '../../config/app-version.js';
import type { Env } from '../../config/env.schema.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const database = await this.checkDatabase();
    return {
      status: database === 'up' ? 'ok' : 'error',
      version: APP_VERSION,
      environment: this.config.get('NODE_ENV', { infer: true }),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: { database },
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.ping();
      return 'up';
    } catch (error) {
      // Solo el tipo/código del error: el mensaje del driver puede incluir datos de conexión.
      this.logger.warn(`Database unavailable (${describeError(error)})`);
      return 'down';
    }
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code;
    return typeof code === 'string' ? `${error.name}:${code}` : error.name;
  }
  return 'unknown';
}
