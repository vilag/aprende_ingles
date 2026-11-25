import { healthCheckResponseSchema, type HealthCheckResponse } from '@aei/validation';
import { Controller, Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Estado de la API y de sus dependencias' })
  // El contrato documentado es el mismo esquema Zod que validan los clientes.
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo funciona',
    standardSchema: healthCheckResponseSchema,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Alguna dependencia no responde',
    standardSchema: healthCheckResponseSchema,
  })
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthCheckResponse> {
    const result = await this.health.check();
    res.status(result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return result;
  }
}
