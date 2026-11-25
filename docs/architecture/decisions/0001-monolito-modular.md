# ADR 0001 — Monolito modular en monorepo

- **Estado:** aceptada
- **Fecha:** 2026-11-25

## Contexto

Producto en etapa inicial, equipo pequeño, varias plataformas cliente (web, Android, iOS, admin) que comparten contratos.

## Decisión

- Un monorepo con pnpm workspaces y Turborepo.
- Una sola API NestJS organizada en módulos de dominio (monolito modular).
- Contratos compartidos en paquetes internos (`@aei/validation`, `@aei/api-client`).

## Alternativas consideradas

- **Microservicios:** más infraestructura, despliegues y observabilidad distribuida sin necesidad actual de escala independiente. Descartado por ahora.
- **Repositorios separados por app:** duplicación de contratos y versiones desalineadas entre clientes y API.

## Consecuencias

- Refactorizaciones entre API y clientes en un solo cambio.
- Hay que vigilar los límites entre módulos (sin acceso directo a tablas de otro módulo; comunicación vía servicios exportados).
- Si un módulo (p. ej. procesamiento de audio) requiere escalar aparte, se podrá extraer a un worker que consuma colas BullMQ sin rediseñar el resto.
