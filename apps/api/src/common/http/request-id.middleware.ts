import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';
const SAFE_REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Asigna un identificador a cada petición para correlacionar logs y errores.
 * Se respeta el que envía un proxy si tiene un formato seguro; si no, se genera.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}

export function getRequestId(res: Response): string | undefined {
  const value: unknown = res.locals.requestId;
  return typeof value === 'string' ? value : undefined;
}
