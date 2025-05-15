const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

/**
 * TC-WEB-001: Verify Basic Page Navigation
 * Test basic page navigation using QAF and Selenium integration
 */
async function verifyBasicPageNavigation() {
  // Initialize the WebDriver
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    // Step 1: Launch browser and navigate to a sample web application
    await driver.get('https://demo.qmetry.com/bank/');
    
    // Step 2: Verify page title is correct
    const title = await driver.getTitle();
    assert.strictEqual(title, 'XYZ Bank');
    
    // Step 3: Navigate to another page using links
    const customerLoginButton = await driver.findElement(By.css('button.btn.btn-primary.btn-lg[ng-click="customer()"]'));
    await customerLoginButton.click();
    
    // Step 4: Verify navigation was successful
    const pageHeader = await driver.wait(until.elementLocated(By.css('div.borderM > div.form-group > label')), 5000);
    const headerText = await pageHeader.getText();
    assert.strictEqual(headerText, 'Your Name :');
    
    // Additional verification
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/customer'), 'URL should contain /customer');
    
    console.log('Test Passed: Verify Basic Page Navigation');
    return { status: 'passed', message: 'Basic page navigation test passed successfully' };
  } catch (error) {
    console.error('Test Failed:', error);
    return { status: 'failed', message: error.message };
  } finally {
    // Close the browser
    await driver.quit();
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
