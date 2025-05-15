const puppeteer = require('puppeteer');
const assert = require('assert');

/**
 * TC-WEB-001: Verify Basic Page Navigation
 * Test basic page navigation using QAF and Puppeteer integration
 */
async function verifyBasicPageNavigation() {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Step 1: Launch browser and navigate to a sample web application
    await page.goto('https://demo.qmetry.com/bank/', { waitUntil: 'networkidle2' });
    
    // Step 2: Verify page title is correct
    const title = await page.title();
    assert.strictEqual(title, 'XYZ Bank');
    
    // Step 3: Navigate to another page using links
    await page.click('button.btn.btn-primary.btn-lg[ng-click="customer()"]');
    
    // Wait for navigation to complete
    await page.waitForSelector('div.borderM > div.form-group > label');
    
    // Step 4: Verify navigation was successful
    const pageHeader = await page.$eval('div.borderM > div.form-group > label', el => el.textContent.trim());
    assert.strictEqual(pageHeader, 'Your Name :');
    
    // Additional verification
    const currentUrl = page.url();
    assert(currentUrl.includes('/customer'), 'URL should contain /customer');
    
    console.log('Test Passed: Verify Basic Page Navigation');
    return { status: 'passed', message: 'Basic page navigation test passed successfully' };
  } catch (error) {
    console.error('Test Failed:', error);
    return { status: 'failed', message: error.message };
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Export the test function to be used by the test runner
module.exports = { verifyBasicPageNavigation };

// If the script is run directly, execute the test
if (require.main === module) {
  verifyBasicPageNavigation().then(result => {
    console.log(`Test result: ${result.status} - ${result.message}`);
  });
}
