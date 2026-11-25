# Convenciones de la API

- **Base:** `/api/v1` (versionado por URI). Una versión nueva solo ante cambios incompatibles.
- **Documentación interactiva:** `GET /api/docs` · especificación: `GET /api/docs/openapi.json` (activa fuera de producción; `SWAGGER_ENABLED=true` para forzarla).
- **Formato:** JSON. Fechas en ISO 8601 UTC.
- **Contratos:** cada request/response se define como esquema Zod en `packages/validation` y se reutiliza en API, Swagger y clientes.

## Errores

Todas las respuestas 4xx/5xx usan el mismo formato (`apiErrorResponseSchema`):

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/recurso",
  "timestamp": "2026-11-25T12:00:00.000Z",
  "requestId": "0b6f9c1e-…",
  "issues": [{ "path": "email", "message": "Invalid email address" }]
}
```

- `issues` solo aparece en errores de validación.
- Los 500 siempre dicen `"Internal server error"`; el detalle se registra en el servidor con el `requestId`.
- La ruta no incluye la query string (puede contener datos sensibles).

## Cabeceras

| Cabecera           | Uso                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `X-Request-Id`     | Se devuelve siempre. Si el cliente/proxy envía uno con formato seguro (`[A-Za-z0-9-]{8,64}`) se respeta. |
| Seguridad (helmet) | CSP, `X-Content-Type-Options`, HSTS, etc. Sin `X-Powered-By`.                                            |

## Rate limiting

Global por IP (`THROTTLE_LIMIT` peticiones cada `THROTTLE_TTL_MS`). Al superarlo: `429` con el formato de error estándar. Detrás de un proxy, activar `TRUST_PROXY=true` para usar la IP real.

## Endpoints actuales

| Método | Ruta             | Descripción                                                                                                                                                  |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/v1/health` | Estado de la API y sus dependencias. `200` si todo responde, `503` si alguna dependencia falla (mismo cuerpo, `status: "error"`). `Cache-Control: no-store`. |
