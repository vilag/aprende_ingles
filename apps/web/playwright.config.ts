import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * Pruebas end-to-end de la web contra el build de producción (`next start`).
 * Se ejecutan en un puerto propio para no chocar con `pnpm dev` (3000).
 * Requiere `pnpm --filter @aei/web build` antes (en CI lo hace turbo).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // Puerto sin servicio: las pruebas verifican el estado "sin conexión" de forma determinista.
      API_URL: process.env.E2E_API_URL ?? 'http://127.0.0.1:59999',
    },
  },
});
