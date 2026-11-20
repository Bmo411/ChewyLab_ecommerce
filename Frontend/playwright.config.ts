import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:6901', channel: 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: 'chrome' } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 6901 --strictPort',
    url: 'http://127.0.0.1:6901',
    env: { VITE_SUPABASE_URL: 'https://chewylab-test.supabase.co', VITE_SUPABASE_ANON_KEY: 'public-test-fixture', VITE_API_URL: '' },
    reuseExistingServer: false,
  },
});
