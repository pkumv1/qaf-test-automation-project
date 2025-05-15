const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const jsPDF = require('jspdf');

// Test runner configuration
const CONFIG = {
  frameworks: ['playwright', 'selenium', 'puppeteer'],
  testCases: ['tc-web-001'], // Add more test cases as they're implemented
  resultsDir: path.join(__dirname, '..', 'results')
};

// Results storage
const testResults = {
  playwright: {},
  selenium: {},
  puppeteer: {}
};

async function runTests() {
  console.log('Starting test execution...');
  
  // Ensure the results directory exists
  if (!fs.existsSync(CONFIG.resultsDir)) {
    fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
  }
  
  // Run tests for each framework
  for (const framework of CONFIG.frameworks) {
    console.log(`\n=== Running ${framework} tests ===`);
    
    for (const testCase of CONFIG.testCases) {
      console.log(`\nExecuting ${testCase} using ${framework}...`);
      
      const testScriptPath = path.join(__dirname, '..', 'test_scripts', framework, `${testCase}.js`);
      
      try {
        if (framework === 'playwright') {
          // For Playwright, use npx playwright test
          await runPlaywrightTest(testScriptPath, testCase);
        } else {
          // For Selenium and Puppeteer, require and run the module directly
          const testModule = require(testScriptPath);
          const result = await testModule.verifyBasicPageNavigation();
          testResults[framework][testCase] = result;
          
          console.log(`  Result: ${result.status} - ${result.message}`);
        }
      } catch (error) {
        console.error(`  Error executing ${testCase} with ${framework}:`, error);
        testResults[framework][testCase] = { status: 'error', message: error.message };
      }
    }
  }
  
  // Generate results report
  await generateResults();
}

async function runPlaywrightTest(testScriptPath, testCase) {
  return new Promise((resolve, reject) => {
    const command = `npx playwright test ${testScriptPath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        testResults.playwright[testCase] = { status: 'failed', message: stderr };
        console.error(`  ${testCase} failed:`, stderr);
        resolve();
      } else {
        testResults.playwright[testCase] = { status: 'passed', message: 'Test completed successfully' };
        console.log(`  ${testCase} passed!`);
        resolve();
      }
    });
  });
}

async function generateResults() {
  console.log('\n=== Generating Test Results ===');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(CONFIG.resultsDir, `test-results-${timestamp}.json`);
  const pdfFile = path.join(CONFIG.resultsDir, `test-results-${timestamp}.pdf`);
  
  // Save results as JSON
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  console.log(`Results saved to ${resultsFile}`);
  
  // Generate PDF report
  await generatePDF(testResults, pdfFile);
  console.log(`PDF report saved to ${pdfFile}`);
  
  // Display summary
  console.log('\n=== Test Results Summary ===');
  for (const framework of CONFIG.frameworks) {
    console.log(`\n${framework.toUpperCase()}:`);
    for (const [testCase, result] of Object.entries(testResults[framework])) {
      console.log(`  ${testCase}: ${result.status}`);
    }
  }
}

async function generatePDF(results, outputFile) {
  // Create a new PDF document
  const doc = new jsPDF();
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Generate HTML for the report
  let htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 20px; }
        .test-case { margin-bottom: 10px; }
        .passed { color: green; }
        .failed, .error { color: red; }
      </style>
    </head>
    <body>
      <h1>QAF Test Automation Results</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
  `;
  
  // Add results for each framework
  for (const framework of CONFIG.frameworks) {
    htmlContent += `<h2>${framework.toUpperCase()}</h2>`;
    
    for (const [testCase, result] of Object.entries(results[framework])) {
      htmlContent += `
        <div class="test-case">
          <strong>${testCase}:</strong> <span class="${result.status}">${result.status}</span>
          <p>${result.message || ''}</p>
        </div>
      `;
    }
  }
  
  htmlContent += `</body></html>`;
  
  // Use Puppeteer to render HTML to PDF
  await page.setContent(htmlContent);
  await page.pdf({ path: outputFile, format: 'A4' });
  
  await browser.close();
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
