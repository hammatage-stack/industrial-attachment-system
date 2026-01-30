import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const API_BASE = 'http://localhost:5000/api';

test('UI flow: login -> upload profile picture -> change password -> logout', async ({ page, request }) => {
  // Login via UI
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', 'ui.test+1@gmail.com');
  await page.fill('input[name="password"]', 'Password123!');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForURL('**/dashboard', { timeout: 5000 })
  ]);

  // Extract token from localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();

  // Upload profile picture via API using Playwright request
  const avatarPath = path.resolve(__dirname, 'fixtures', 'avatar.png');
  const fileBuffer = fs.readFileSync(avatarPath);

  const uploadRes = await request.post(`${API_BASE}/search/profile/picture`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    multipart: {
      file: {
        name: 'file',
        mimeType: 'image/png',
        buffer: fileBuffer
      }
    }
  });

  expect(uploadRes.ok()).toBeTruthy();
  const uploadJson = await uploadRes.json();
  expect(uploadJson.success).toBe(true);

  // Change password via API
  const changeRes = await request.post(`${API_BASE}/search/profile/change-password`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      currentPassword: 'Password123!',
      newPassword: 'Password1234!'
    }
  });

  expect(changeRes.ok()).toBeTruthy();
  const changeJson = await changeRes.json();
  expect(changeJson.success).toBe(true);

  // Logout via UI
  await page.click('[title="Logout"]');
  await page.waitForURL('**/', { timeout: 5000 });

  // Try logging in with new password to confirm change
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', 'ui.test+1@gmail.com');
  await page.fill('input[name="password"]', 'Password1234!');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForURL('**/dashboard', { timeout: 5000 })
  ]);

  // revert password back via API for cleanup
  const token2 = await page.evaluate(() => localStorage.getItem('token'));
  await request.post(`${API_BASE}/search/profile/change-password`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`
    },
    data: {
      currentPassword: 'Password1234!',
      newPassword: 'Password123!'
    }
  });

});
