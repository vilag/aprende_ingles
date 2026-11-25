// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuración ESLint compartida para código TypeScript que corre en Node
 * o que es agnóstico de plataforma (API y paquetes internos).
 *
 * Usa linting con información de tipos (projectService), por lo que cada
 * consumidor debe indicar `tsconfigRootDir` (normalmente `import.meta.dirname`).
 *
 * @param {{ tsconfigRootDir: string, ignores?: string[] }} options
 */
export function createNodeConfig({ tsconfigRootDir, ignores = [] }) {
  return tseslint.config(
    {
      ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.*', ...ignores],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        // `any` solo con justificación explícita (eslint-disable + comentario).
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        // Clases vacías solo si llevan decoradores (p. ej. @Module de NestJS).
        '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          { allowNumber: true, allowBoolean: true },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    {
      // En pruebas se relajan reglas que dificultan los mocks.
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts', '**/*.int-spec.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  );
}
