import {
  apiErrorResponseSchema,
  healthCheckResponseSchema,
  type HealthCheckResponse,
} from '@aei/validation';
import type { z } from 'zod';

import { ApiClientError } from './errors.js';

export interface ApiClientOptions {
  /** URL base de la API, sin el prefijo `/api/v1`. Ej.: `http://localhost:4000`. */
  readonly baseUrl: string;
  /** Tiempo máximo por petición en milisegundos. Por defecto 10 s. */
  readonly timeoutMs?: number;
  /** Implementación de fetch a usar (útil en pruebas). Por defecto `globalThis.fetch`. */
  readonly fetch?: typeof fetch;
}

interface RequestOptions<T> {
  readonly path: string;
  readonly schema: z.ZodType<T>;
  /** Códigos HTTP (además de 2xx) cuyo cuerpo es una respuesta válida del contrato. */
  readonly acceptStatuses?: readonly number[];
}

const API_PREFIX = '/api/v1';
const DEFAULT_TIMEOUT_MS = 10_000;

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);

  async function request<T>({ path, schema, acceptStatuses = [] }: RequestOptions<T>): Promise<T> {
    const url = `${baseUrl}${API_PREFIX}${path}`;
    // AbortController + setTimeout en lugar de AbortSignal.timeout por compatibilidad con React Native.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (cause) {
      if (controller.signal.aborted) {
        throw new ApiClientError('timeout', `La petición a ${path} superó ${timeoutMs} ms`, {
          cause,
        });
      }
      throw new ApiClientError('network', `No se pudo contactar la API (${path})`, { cause });
    } finally {
      clearTimeout(timer);
    }

    const body = await readJson(response);

    if (response.ok || acceptStatuses.includes(response.status)) {
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        throw new ApiClientError('invalid_response', `Respuesta inesperada de ${path}`, {
          status: response.status,
          cause: parsed.error,
        });
      }
      return parsed.data;
    }

    const errorBody = apiErrorResponseSchema.safeParse(body);
    throw new ApiClientError(
      'http',
      errorBody.success ? errorBody.data.message : `HTTP ${response.status} en ${path}`,
      {
        status: response.status,
        ...(errorBody.success ? { body: errorBody.data } : {}),
      },
    );
  }

  return {
    health: {
      /**
       * Estado de la API y sus dependencias. Un 503 no es una excepción:
       * es una respuesta válida con `status: 'error'`.
       */
      check: (): Promise<HealthCheckResponse> =>
        request({ path: '/health', schema: healthCheckResponseSchema, acceptStatuses: [503] }),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}
