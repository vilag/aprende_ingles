import type { ApiErrorResponse } from '@aei/validation';

/**
 * - `network`: no hubo respuesta (servidor caído, sin conexión, DNS, CORS).
 * - `timeout`: la petición superó el tiempo límite.
 * - `http`: el servidor respondió con un código de error.
 * - `invalid_response`: la respuesta no cumple el contrato esperado.
 */
export type ApiClientErrorKind = 'network' | 'timeout' | 'http' | 'invalid_response';

export class ApiClientError extends Error {
  override readonly name = 'ApiClientError';

  constructor(
    readonly kind: ApiClientErrorKind,
    message: string,
    readonly details: {
      readonly status?: number;
      readonly body?: ApiErrorResponse;
      readonly cause?: unknown;
    } = {},
  ) {
    super(message, { cause: details.cause });
  }

  get status(): number | undefined {
    return this.details.status;
  }
}
