import { createNodeConfig } from '@aei/config/eslint';

export default [
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,
    ignores: ['src/generated/**', 'prisma/migrations/**'],
  }),
  {
    rules: {
      // NestJS declara sus objetos de opciones como clases (p. ej. NestApplicationContextOptions)
      // pero su API pública espera objetos literales; esta regla da falsos positivos.
      '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
    },
  },
];
