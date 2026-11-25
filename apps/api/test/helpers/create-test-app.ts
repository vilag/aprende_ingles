import type { ModuleMetadata } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/database/prisma.service.js';

export interface PrismaDouble {
  ping: () => Promise<void>;
  $disconnect: () => Promise<void>;
}

/**
 * Levanta la aplicación completa (mismos middlewares, filtros y pipes que producción).
 * Si se pasa `prisma`, sustituye la base de datos por un doble de prueba.
 */
export async function createTestApp(
  options: {
    prisma?: PrismaDouble;
    extraModules?: ModuleMetadata['imports'];
  } = {},
): Promise<NestExpressApplication> {
  let builder = Test.createTestingModule({
    imports: [AppModule, ...(options.extraModules ?? [])],
  });
  if (options.prisma) {
    builder = builder.overrideProvider(PrismaService).useValue(options.prisma);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
  configureApp(app);
  await app.init();
  return app;
}
