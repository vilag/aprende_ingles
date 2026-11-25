import { describe, expect, it } from 'vitest';

import { validateEnv } from './env.schema.js';

const base = { DATABASE_URL: 'postgresql://user:secret-password@localhost:5432/db' };

describe('validateEnv', () => {
  it('aplica valores por defecto seguros', () => {
    const env = validateEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 4000,
      CORS_ORIGINS: [],
      TRUST_PROXY: false,
      SWAGGER_ENABLED: true,
      THROTTLE_TTL_MS: 60_000,
      THROTTLE_LIMIT: 100,
    });
  });

  it('convierte CORS_ORIGINS separado por comas en una lista', () => {
    const env = validateEnv({
      ...base,
      CORS_ORIGINS: 'http://localhost:3000, https://app.example.com',
    });
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000', 'https://app.example.com']);
  });

  it('rechaza orígenes CORS que no son http(s)', () => {
    expect(() => validateEnv({ ...base, CORS_ORIGINS: 'ftp://example.com' })).toThrow(
      /CORS_ORIGINS/,
    );
  });

  it('desactiva Swagger por defecto en producción', () => {
    const env = validateEnv({ ...base, NODE_ENV: 'production' });
    expect(env.SWAGGER_ENABLED).toBe(false);
  });

  it('permite activar Swagger explícitamente en producción', () => {
    const env = validateEnv({ ...base, NODE_ENV: 'production', SWAGGER_ENABLED: 'true' });
    expect(env.SWAGGER_ENABLED).toBe(true);
  });

  it('exige DATABASE_URL con protocolo postgres', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: 'mysql://localhost/db' })).toThrow(/DATABASE_URL/);
  });

  it('no incluye secretos en el mensaje de error', () => {
    expect(() => validateEnv({ ...base, PORT: 'no-es-numero' })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('secret-password') }),
    );
  });

  it('rechaza puertos fuera de rango', () => {
    expect(() => validateEnv({ ...base, PORT: '70000' })).toThrow(/PORT/);
  });
});
