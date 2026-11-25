import { createApiClient } from '@aei/api-client';

/**
 * URL de la API definida en apps/mobile/.env (EXPO_PUBLIC_API_URL).
 * Se valida al iniciar para fallar con un mensaje claro en lugar de errores de red confusos.
 */
function readApiUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (!value || !/^https?:\/\/[^\s]+$/.test(value)) {
    throw new Error(
      'EXPO_PUBLIC_API_URL no está configurada o no es una URL http(s). Revisa apps/mobile/.env (ver .env.example).',
    );
  }
  return value;
}

export const apiBaseUrl = readApiUrl();

export const apiClient = createApiClient({ baseUrl: apiBaseUrl, timeoutMs: 8_000 });
