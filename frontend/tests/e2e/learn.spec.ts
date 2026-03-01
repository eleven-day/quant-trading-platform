import { expect, test } from '@playwright/test';

test('learn page shows strategy list and navigates to backtest', async ({ page }) => {
  await page.goto('/learn');

  await expect(page.getByText('策略列表')).toBeVisible({ timeout: 30000 });

  const statusBadges = page.getByText(/^(已学|学习中|未学)$/);
  await expect(statusBadges.first()).toBeVisible({ timeout: 30000 });
  expect(await statusBadges.count()).toBe(4);

  await page.getByText('RSI').first().click();
  await expect(page.getByRole('heading', { name: /RSI/ })).toBeVisible();
  await expect(page.getByText('策略原理')).toBeVisible();

  const tryButton = page.getByRole('button', { name: /试一试/ });
  await expect(tryButton).toBeVisible();
  await tryButton.click();
  await expect(page).toHaveURL(/\/backtest$/);
});
