import { test, expect } from '@playwright/test';

test.describe('Locale routing', () => {
  test('/ redirects to /{locale}/  based on browser language', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/(en|pl)\//);
    expect(page.url()).toMatch(/\/(en|pl)/);
  });

  test('/en/products — prices shown (page loads)', async ({ page }) => {
    await page.goto('/en/products');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveTitle('404');
  });

  test('/pl/products — prices shown (page loads)', async ({ page }) => {
    await page.goto('/pl/products');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveTitle('404');
  });

  test('locale cookie is set after visiting locale URL', async ({ page }) => {
    await page.goto('/en/products');
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'locale');
    expect(localeCookie?.value).toBe('en');
  });
});
