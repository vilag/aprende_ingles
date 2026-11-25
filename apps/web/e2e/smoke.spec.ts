import { expect, test } from '@playwright/test';

test.describe('Sitio público', () => {
  test('la portada muestra la propuesta de valor sin errores de consola', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('pensar en inglés');
    await expect(page.getByText('Ejemplo ilustrativo')).toBeVisible();
    await expect(page).toHaveTitle(/AI English Immersion/);
    expect(errors).toEqual([]);
  });

  test('aplica cabeceras de seguridad', async ({ request }) => {
    const response = await request.get('/');

    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-powered-by']).toBeUndefined();
  });

  test('la página de estado informa con claridad cuando la API no responde', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Estado del sistema' }).click();

    await expect(page).toHaveURL(/\/status$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Estado del sistema' })).toBeVisible();
    const card = page.getByTestId('system-status');
    await expect(card).toHaveAttribute('data-tone', 'unreachable');
    await expect(card).toContainText('No fue posible contactar la API');
  });
});
