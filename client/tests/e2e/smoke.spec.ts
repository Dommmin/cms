import { expect, test } from '@playwright/test';

const PUBLIC_PAGES = ['/', '/products', '/blog', '/contact'];

for (const path of PUBLIC_PAGES) {
  test(`${path} — loads without JS errors`, async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    expect(jsErrors, `JS errors on ${path}: ${jsErrors.join(', ')}`).toHaveLength(0);
  });
}

test('homepage — shows site name in title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('products page — renders at least one product card', async ({ page }) => {
  await page.goto('/products');
  await page.waitForLoadState('networkidle');

  const cards = page.locator('[data-testid="product-card"], .product-card, article');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });
});
