import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import type { Env } from '../config/env.schema.js';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Cliente Prisma compartido por todos los módulos.
 * La conexión es perezosa: se abre con la primera consulta, de modo que la API
 * arranca aunque la base de datos no esté disponible (el health check lo reporta).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL', { infer: true }),
        connectionTimeoutMillis: 5_000,
      }),
    });
  }

  /** Verifica que la base de datos responde. Lanza si no hay conexión. */
  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
