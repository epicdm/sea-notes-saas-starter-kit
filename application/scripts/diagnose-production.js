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

  try {
    console.log('🔍 Navigating to production site...');
    await page.goto('https://ai.epic.dm', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Homepage loaded');

    // Take screenshot of homepage
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-homepage.png',
      fullPage: true
    });

    console.log('\n🔍 Navigating to brand profile page...');
    await page.goto('https://ai.epic.dm/dashboard/settings/brand-profile', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Brand profile page loaded');

    // Take screenshot
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-brand-profile.png',
      fullPage: true
    });

    // Get page content
    const pageContent = await page.content();

    // Check for error messages in the DOM
    const errorElements = await page.$$eval('[class*="error"]', elements =>
      elements.map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent
      }))
    );

    console.log('\n📊 DIAGNOSTIC REPORT');
    console.log('===================\n');

    console.log('📝 Console Messages:', consoleMessages.length);
    if (consoleMessages.length > 0) {
      consoleMessages.forEach(msg => {
        console.log(`  [${msg.type}] ${msg.text}`);
        if (msg.location) {
          console.log(`    at ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
        }
      });
    }

    console.log('\n❌ Page Errors:', pageErrors.length);
    if (pageErrors.length > 0) {
      pageErrors.forEach(err => {
        console.log(`  ${err.message}`);
        console.log(`  ${err.stack}`);
      });
    }

    console.log('\n🌐 Network Errors:', networkErrors.length);
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => {
        console.log(`  ${err.url}`);
        console.log(`  Reason: ${err.failure?.errorText || 'Unknown'}`);
      });
    }

    console.log('\n🔍 Error Elements Found:', errorElements.length);
    if (errorElements.length > 0) {
      errorElements.forEach(el => {
        console.log(`  <${el.tag} class="${el.class}">${el.text.substring(0, 100)}</${el.tag}>`);
      });
    }

    // Check if Next.js error page is shown
    const isErrorPage = pageContent.includes('Application error') ||
                        pageContent.includes('client-side exception');
    console.log('\n🚨 Next.js Error Page Detected:', isErrorPage);

    // Try to get the actual error message
    const errorMessage = await page.$eval('body', el => el.textContent).catch(() => '');
    if (errorMessage.includes('Application error')) {
      console.log('\n📄 Error Page Content:');
      console.log(errorMessage.substring(0, 500));
    }

  } catch (error) {
    console.error('\n💥 Navigation Error:', error.message);
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-error.png',
      fullPage: true
    });
  }

  await browser.close();

  console.log('\n📸 Screenshots saved to:');
  console.log('  - /opt/livekit1/frontend/scripts/prod-homepage.png');
  console.log('  - /opt/livekit1/frontend/scripts/prod-brand-profile.png');
}

diagnoseProdIssue().catch(console.error);
