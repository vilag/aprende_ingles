import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

/**
 * Versión de la API tomada de apps/api/package.json.
 * Funciona igual desde src/ (pruebas) y desde dist/ (build), ambos a dos niveles.
 */
function readVersion(): string {
  const raw: unknown = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', '..', 'package.json'), 'utf8'),
  );
  return z.object({ version: z.string().min(1) }).parse(raw).version;
}

export const APP_VERSION = readVersion();
