import { expect, test } from '@playwright/test';

test('settings page renders all key sections and controls', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeVisible();
  await expect(page.getByText('数据源配置')).toBeVisible();
  await expect(page.getByText('回测默认参数')).toBeVisible();
  await expect(page.getByText('外观设置')).toBeVisible();
  await expect(page.getByRole('button', { name: '保存设置' })).toBeVisible();
  await expect(page.getByRole('button', { name: '重置' })).toBeVisible();
});
