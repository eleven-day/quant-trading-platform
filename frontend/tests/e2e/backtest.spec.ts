import { expect, test } from '@playwright/test';

test('backtest page auto-runs and renders result panels', async ({ page }) => {
  await page.goto('/backtest');

  await expect(page.getByText('策略', { exact: true })).toBeVisible({ timeout: 30000 });

  const strategySelect = page.locator('select').first();
  await expect(strategySelect).toBeVisible();
  const optionCount = await strategySelect.locator('option').count();
  expect(optionCount).toBeGreaterThan(0);

  const runningText = page.getByText('正在运行回测...');
  try {
    await runningText.waitFor({ state: 'visible', timeout: 5000 });
    await expect(runningText).toBeHidden({ timeout: 30000 });
  } catch {
    await expect(runningText).toBeHidden({ timeout: 30000 });
  }

  await expect(page.getByText('总收益率')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('交易记录')).toBeVisible();
  await expect(page.getByText('日期')).toBeVisible();
  await expect(page.getByText('收益曲线')).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
});
