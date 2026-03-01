import { expect, test } from '@playwright/test';

test('dashboard page loads index cards and watchlist interactions', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByText(/上证|深证|创业板/).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/上证/)).toBeVisible();
  await expect(page.getByText(/深证/)).toBeVisible();
  await expect(page.getByText(/创业板/)).toBeVisible();

  await expect(page.getByText('自选股')).toBeVisible();
  await expect(page.getByText('名称')).toBeVisible();

  const watchlistSymbols = page.getByText(/^\d{6}$/);
  await expect(watchlistSymbols.first()).toBeVisible({ timeout: 30000 });

  const symbolCount = await watchlistSymbols.count();
  expect(symbolCount).toBeGreaterThanOrEqual(2);

  const secondSymbol = (await watchlistSymbols.nth(1).textContent())?.trim();
  expect(secondSymbol).toBeTruthy();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes(`/api/stocks/${secondSymbol}/daily`) && response.status() === 200,
      { timeout: 30000 }
    ),
    watchlistSymbols.nth(1).click(),
  ]);

  await expect(page.getByText('日K')).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
});
