import { STATUS_CODES } from 'node:http';

import type { ApiErrorResponse } from '@aei/validation';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { RequestValidationException } from '../validation/validation.js';
import { getRequestId } from './request-id.middleware.js';

/**
 * Convierte cualquier excepción en el formato único `ApiErrorResponse`.
 * - Errores HTTP conocidos: se devuelve su mensaje.
 * - Errores inesperados: 500 genérico; el detalle solo va al log del servidor.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = getRequestId(res);
    // Sin query string: puede contener tokens u otros datos sensibles.
    const path = req.originalUrl.split('?')[0] ?? req.originalUrl;

    if (statusCode >= 500) {
      this.logger.error(
        `${req.method} ${path} -> ${statusCode} [requestId=${requestId ?? 'n/a'}]`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ApiErrorResponse = {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      message: publicMessage(exception, statusCode),
      path,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(exception instanceof RequestValidationException ? { issues: [...exception.issues] } : {}),
    };

    res.status(statusCode).json(body);
  }
}

function publicMessage(exception: unknown, statusCode: number): string {
  if (!(exception instanceof HttpException) || statusCode >= 500) {
    return 'Internal server error';
  }
  const response = exception.getResponse();
  if (typeof response === 'string') return response;
  const message: unknown = (response as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.map(String).join('; ');
  return exception.message;
}
