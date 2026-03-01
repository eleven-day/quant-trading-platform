import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Tests share real backend state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Sequential - real API calls
  reporter: 'html',
  timeout: 60000, // Pages make real API calls to EastMoney
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // NOTE: Do NOT include webServer - backend must be started manually.
  // The Rust backend (cargo run on port 3001) must be running before tests.
  // The Next.js dev server (npm run dev on port 3000) must also be running.
});
