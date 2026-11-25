import { ApiClientError, type ApiClient } from '@aei/api-client';
import type { DependencyStatus } from '@aei/validation';

export type SystemStatusTone = 'operational' | 'degraded' | 'unreachable';

export interface SystemStatusView {
  readonly tone: SystemStatusTone;
  readonly title: string;
  readonly description: string;
  readonly version?: string;
  readonly checkedAt?: string;
  readonly dependencies: readonly { readonly name: string; readonly status: DependencyStatus }[];
}

/**
 * Consulta la salud real de la API y la traduce a un modelo de vista.
 * Nunca lanza: cualquier fallo se muestra como un estado, no como una pantalla de error.
 */
export async function getSystemStatus(
  client: Pick<ApiClient, 'health'>,
): Promise<SystemStatusView> {
  try {
    const health = await client.health.check();
    const dependencies = [{ name: 'Base de datos', status: health.checks.database }];
    if (health.status === 'ok') {
      return {
        tone: 'operational',
        title: 'Todos los sistemas operan con normalidad',
        description: 'La API y sus dependencias responden correctamente.',
        version: health.version,
        checkedAt: health.timestamp,
        dependencies,
      };
    }
    return {
      tone: 'degraded',
      title: 'Servicio degradado',
      description: 'La API responde, pero alguna dependencia no está disponible.',
      version: health.version,
      checkedAt: health.timestamp,
      dependencies,
    };
  } catch (error) {
    return {
      tone: 'unreachable',
      title: 'No fue posible contactar la API',
      description: describeFailure(error),
      dependencies: [],
    };
  }
}

function describeFailure(error: unknown): string {
  if (!(error instanceof ApiClientError))
    return 'Ocurrió un error inesperado al consultar el estado.';
  switch (error.kind) {
    case 'timeout':
      return 'La API tardó demasiado en responder.';
    case 'network':
      return 'La API no está accesible en este momento.';
    case 'http':
      return `La API respondió con un error (HTTP ${error.status ?? 'desconocido'}).`;
    case 'invalid_response':
      return 'La API respondió con un formato inesperado.';
  }
}
