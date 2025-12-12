const { chromium } = require('playwright');

async function diagnoseProdIssue() {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Collect network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });

  // Collect response errors
  const responseErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      responseErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('🔍 Navigating to brand profile page directly...');
    await page.goto('https://ai.epic.dm/dashboard/settings/brand-profile', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait a bit for any client-side rendering
    await page.waitForTimeout(5000);

    console.log('✅ Page loaded');

    // Take screenshot
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-brand-profile.png',
      fullPage: true
    });

    // Get page title
    const title = await page.title();
    console.log('📄 Page Title:', title);

    // Get page content
    const bodyText = await page.$eval('body', el => el.textContent).catch(() => '');

    // Check for error messages
    const hasErrorMessage = bodyText.includes('Application error') ||
                           bodyText.includes('client-side exception') ||
                           bodyText.includes('Error:');

    console.log('\n📊 DIAGNOSTIC REPORT');
    console.log('===================\n');

    console.log('🚨 Error Page Detected:', hasErrorMessage);

    if (hasErrorMessage) {
      console.log('\n📄 Page Content (first 1000 chars):');
      console.log(bodyText.substring(0, 1000));
    }

    console.log('\n📝 Console Messages:', consoleMessages.length);
    if (consoleMessages.length > 0) {
      const errors = consoleMessages.filter(m => m.type === 'error');
      const warnings = consoleMessages.filter(m => m.type === 'warning');

      console.log(`  Errors: ${errors.length}`);
      console.log(`  Warnings: ${warnings.length}`);
      console.log(`  Other: ${consoleMessages.length - errors.length - warnings.length}`);

      if (errors.length > 0) {
        console.log('\n  ❌ Console Errors:');
        errors.forEach(msg => {
          console.log(`    ${msg.text}`);
          if (msg.location && msg.location.url) {
            console.log(`      at ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
          }
        });
      }

      if (warnings.length > 0) {
        console.log('\n  ⚠️  Console Warnings:');
        warnings.forEach(msg => {
          console.log(`    ${msg.text}`);
        });
      }
    }

    console.log('\n❌ JavaScript Errors:', pageErrors.length);
    if (pageErrors.length > 0) {
      pageErrors.forEach(err => {
        console.log(`\n  Error: ${err.message}`);
        if (err.stack) {
          console.log(`  Stack:\n${err.stack}`);
        }
      });
    }

    console.log('\n🌐 Network Errors:', networkErrors.length);
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => {
        console.log(`  ${err.url}`);
        console.log(`    Reason: ${err.failure?.errorText || 'Unknown'}`);
      });
    }

    console.log('\n📡 HTTP Errors (4xx/5xx):', responseErrors.length);
    if (responseErrors.length > 0) {
      responseErrors.forEach(err => {
        console.log(`  [${err.status}] ${err.url}`);
      });
    }

    // Try to find specific React error boundaries
    const reactErrors = await page.$$eval('[class*="nextjs-error"]', elements =>
      elements.map(el => el.textContent)
    ).catch(() => []);

    if (reactErrors.length > 0) {
      console.log('\n⚛️  Next.js Error Boundary Content:');
      reactErrors.forEach(text => console.log(`  ${text}`));
    }

  } catch (error) {
    console.error('\n💥 Error during diagnosis:', error.message);
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-error.png',
      fullPage: true
    });
  }

  await browser.close();

  console.log('\n📸 Screenshot saved to:');
  console.log('  - /opt/livekit1/frontend/scripts/prod-brand-profile.png');
}

diagnoseProdIssue().catch(console.error);
