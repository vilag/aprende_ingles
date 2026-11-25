import type { ValidationIssue } from '@aei/validation';
import {
  BadRequestException,
  StandardSchemaValidationPipe,
  type StandardSchemaValidationPipeOptions,
} from '@nestjs/common';

type SchemaIssue = Parameters<
  NonNullable<StandardSchemaValidationPipeOptions['exceptionFactory']>
>[0][number];

/** Error 400 que conserva el detalle por campo para el filtro global. */
export class RequestValidationException extends BadRequestException {
  constructor(readonly issues: readonly ValidationIssue[]) {
    super('Validation failed');
  }
}

/**
 * Pipe global: valida @Body/@Query/@Param que declaren `{ schema }` (Zod u otra
 * librería Standard Schema) y responde 400 con `issues` en el formato de la API.
 */
export function createValidationPipe(): StandardSchemaValidationPipe {
  return new StandardSchemaValidationPipe({
    exceptionFactory: (issues) => new RequestValidationException(issues.map(toValidationIssue)),
  });
}

function toValidationIssue(issue: SchemaIssue): ValidationIssue {
  const path = (issue.path ?? [])
    .map((segment) => (typeof segment === 'object' ? segment.key : segment))
    .map(String)
    .join('.');
  return { path, message: issue.message };
}
