import 'server-only';

import { createApiClient, type ApiClient } from '@aei/api-client';

import { parseServerEnv } from './env.schema';

let client: ApiClient | undefined;

/** Cliente de la API para Server Components. Valida el entorno en el primer uso. */
export function getServerApiClient(): ApiClient {
  client ??= createApiClient({
    baseUrl: parseServerEnv({ API_URL: process.env.API_URL }).API_URL,
    timeoutMs: 5_000,
  });
  return client;
}
