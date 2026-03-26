import { expect, test } from '@playwright/test';

test.describe('Cart', () => {
  test('guest can add a product to cart and see it reflected in the header badge', async ({
    page,
  }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Click the first add-to-cart button
    const addBtn = page.getByRole('button', { name: /add to cart|dodaj do koszyka/i }).first();
    await addBtn.click();

    // Badge / cart count should show 1
    const badge = page.locator(
      '[data-testid="cart-count"], [aria-label*="cart"], [aria-label*="koszyk"]',
    );
    await expect(badge.first()).toContainText('1', { timeout: 5_000 });
  });

  test('cart persists in localStorage between page navigations', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /add to cart|dodaj do koszyka/i }).first();
    await addBtn.click();

    // Navigate away and back
    await page.goto('/blog');
    await page.goto('/products');

    const token = await page.evaluate(() => localStorage.getItem('cart_token'));
    expect(token).not.toBeNull();
  });

  test('cart page shows added items', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: /add to cart|dodaj do koszyka/i })
      .first()
      .click();

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const items = page.locator('[data-testid="cart-item"]');
    await expect(items.first()).toBeVisible({ timeout: 8_000 });
  });
});
