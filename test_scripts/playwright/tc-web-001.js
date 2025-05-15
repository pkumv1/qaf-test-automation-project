const { test, expect } = require('@playwright/test');

/**
 * TC-WEB-001: Verify Basic Page Navigation
 * Test basic page navigation using QAF and Playwright integration
 */
test('Verify Basic Page Navigation', async ({ page }) => {
  // Step 1: Launch browser and navigate to a sample web application
  await page.goto('https://demo.qmetry.com/bank/');
  
  // Step 2: Verify page title is correct
  const title = await page.title();
  expect(title).toBe('XYZ Bank');
  
  // Step 3: Navigate to another page using links
  await page.click('button.btn.btn-primary.btn-lg[ng-click="customer()"]');
  
  // Step 4: Verify navigation was successful
  const pageHeader = await page.locator('div.borderM > div.form-group > label').textContent();
  expect(pageHeader).toBe('Your Name :');
  
  // Additional verification
  const currentUrl = page.url();
  expect(currentUrl).toContain('/customer');
});
