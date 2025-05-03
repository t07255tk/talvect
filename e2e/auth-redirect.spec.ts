import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard')
  await expect(page).toHaveURL('http://localhost:3000/')
})
