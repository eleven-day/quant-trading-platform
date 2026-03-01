import { expect, test } from '@playwright/test';

test('dashboard visual snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText(/上证|深证|创业板/).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('自选股')).toBeVisible({ timeout: 30000 });

  await expect(page).toHaveScreenshot('dashboard.png', {
    animations: 'disabled',
    fullPage: true,
    mask: [
      page.locator('main'),
      page.getByText(/^[+-]?\d[\d,.]*\.\d{2}%?$/),
      page.getByText(/^[+-]?\d+\.\d{2}\s\([+-]?\d+\.\d{2}%\)$/),
      page.locator('canvas'),
    ],
  });
});

test('backtest visual snapshot', async ({ page }) => {
  await page.goto('/backtest');
  await expect(page.getByText('策略', { exact: true })).toBeVisible({ timeout: 30000 });

  const runningText = page.getByText('正在运行回测...');
  await runningText.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => undefined);

  await expect(page.getByText('总收益率')).toBeVisible({ timeout: 30000 });

  await expect(page).toHaveScreenshot('backtest.png', {
    animations: 'disabled',
    fullPage: true,
    mask: [
      page.locator('canvas'),
      page.getByText(/^\d{4}-\d{2}-\d{2}$/),
      page.getByText(/^[+-]?\d[\d,.]*\.\d{1,2}%?$/),
      page.getByText(/^[+-]?\d[\d,.]*$/),
    ],
  });
});

test('learn visual snapshot', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByText('策略列表')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('策略原理')).toBeVisible({ timeout: 30000 });

  await expect(page).toHaveScreenshot('learn.png', {
    animations: 'disabled',
    fullPage: true,
  });
});

test('settings visual snapshot', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('数据源配置')).toBeVisible();

  await expect(page).toHaveScreenshot('settings.png', {
    animations: 'disabled',
    fullPage: true,
  });
});
