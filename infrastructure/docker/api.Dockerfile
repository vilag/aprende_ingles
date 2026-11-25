# syntax=docker/dockerfile:1
#
# Imagen de producción de la API (NestJS).
# Construir desde la RAÍZ del monorepo:
#   docker build -f infrastructure/docker/api.Dockerfile -t aei-api .
#
# Las migraciones NO se ejecutan al arrancar el contenedor: se aplican como paso
# separado del despliegue (`pnpm --filter @aei/api db:migrate:deploy`).

ARG NODE_VERSION=22.22.3

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

# ── Build: instala, genera Prisma, compila la API y sus paquetes internos ──
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@aei/api
# Extrae solo lo necesario para ejecutar la API (dependencias de producción).
RUN pnpm --filter @aei/api deploy --prod --legacy /out

# ── Runtime: imagen mínima, usuario sin privilegios ──
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-4000}/api/v1/health > /dev/null || exit 1
CMD ["node", "dist/main.js"]
