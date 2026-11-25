import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { API_PREFIX, configureApp, DOCS_PATH } from './app.setup.js';
import type { Env } from './config/env.schema.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  // Logs en inglés y ASCII: legibles en cualquier consola (incl. Windows PowerShell 5.1).
  logger.log(`API listening on http://localhost:${port}/${API_PREFIX}/v1`);
  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    logger.log(`OpenAPI docs at http://localhost:${port}/${DOCS_PATH}`);
  }
}

await bootstrap();
