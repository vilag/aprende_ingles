import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AllExceptionsFilter } from './common/http/all-exceptions.filter.js';
import { REQUEST_ID_HEADER, requestIdMiddleware } from './common/http/request-id.middleware.js';
import { createValidationPipe } from './common/validation/validation.js';
import { APP_VERSION } from './config/app-version.js';
import type { Env } from './config/env.schema.js';

export const API_PREFIX = 'api';
export const DOCS_PATH = `${API_PREFIX}/docs`;

/**
 * Configuración transversal de la aplicación HTTP. Se usa tanto en main.ts como
 * en las pruebas e2e para que ambas ejecuten exactamente la misma configuración.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  if (config.get('TRUST_PROXY', { infer: true })) {
    app.set('trust proxy', 1);
  }

  app.use(requestIdMiddleware);
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    setupSwagger(app);
  }
}

function setupSwagger(app: NestExpressApplication): void {
  const document = new DocumentBuilder()
    .setTitle('AI English Immersion API')
    .setDescription('API REST de la plataforma AI English Immersion.')
    .setVersion(APP_VERSION)
    .build();

  SwaggerModule.setup(DOCS_PATH, app, () => SwaggerModule.createDocument(app, document), {
    jsonDocumentUrl: `${DOCS_PATH}/openapi.json`,
  });
}
