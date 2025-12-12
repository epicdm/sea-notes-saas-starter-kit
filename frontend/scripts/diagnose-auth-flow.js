const { chromium } = require('playwright');

async function diagnoseAuthFlow() {
  const browser = await chromium.launch({
    headless: false // Run in headed mode to see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect all network requests
  const requests = [];
  const responses = [];

  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    });
  });

  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    });
  });

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  try {
    console.log('🔍 Testing Production Auth Flow...\n');

    // Test 1: Navigate to homepage
    console.log('Test 1: Homepage');
    await page.goto('https://ai.epic.dm', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    const homeTitle = await page.title();
    console.log(`  ✓ Homepage loaded: ${homeTitle}\n`);

    // Test 2: Navigate to protected route (brand-profile)
    console.log('Test 2: Protected Route (brand-profile)');
    await page.goto('https://ai.epic.dm/dashboard/settings/brand-profile', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const currentTitle = await page.title();

    console.log(`  Current URL: ${currentUrl}`);
    console.log(`  Current Title: ${currentTitle}`);

    if (currentUrl.includes('/auth/signin')) {
      console.log('  ✓ Correctly redirected to sign-in (expected behavior)');

      // Check for error messages
      const bodyText = await page.$eval('body', el => el.textContent).catch(() => '');

      if (bodyText.includes('Application error') || bodyText.includes('client-side exception')) {
        console.log('  ❌ ERROR: Client-side exception detected!');
        console.log('  Error content:', bodyText.substring(0, 500));
      } else {
        console.log('  ✓ No client-side errors - sign-in page is working correctly');
      }
    } else {
      console.log('  ⚠️  Unexpected: Not redirected to sign-in');
    }

    // Take screenshot
    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/prod-auth-flow.png',
      fullPage: true
    });

    // Test 3: Compare with localhost
    console.log('\nTest 3: Localhost Behavior');
    await page.goto('http://localhost:3000/dashboard/settings/brand-profile', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    const localUrl = page.url();
    const localTitle = await page.title();

    console.log(`  Local URL: ${localUrl}`);
    console.log(`  Local Title: ${localTitle}`);

    if (localUrl.includes('/dashboard/settings/brand-profile')) {
      console.log('  ✓ Localhost bypasses auth (expected - dev mode)');
    }

    await page.screenshot({
      path: '/opt/livekit1/frontend/scripts/local-brand-profile.png',
      fullPage: true
    });

    // Summary
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('===================');
    console.log(`Production: ${currentUrl.includes('/auth/signin') ? 'Redirects to sign-in ✓' : 'Does not redirect ⚠️'}`);
    console.log(`Localhost: ${localUrl.includes('/dashboard/settings/brand-profile') ? 'Shows brand-profile ✓' : 'Redirects ⚠️'}`);

    // Check for console errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    console.log(`\nConsole Errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach(err => {
        console.log(`  - ${err.text}`);
      });
    }

    // Check for redirects
    const redirects = responses.filter(r => r.status >= 300 && r.status < 400);
    console.log(`\nRedirects: ${redirects.length}`);
    if (redirects.length > 0) {
      redirects.forEach(r => {
        console.log(`  ${r.status}: ${r.url} → ${r.headers.location || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('\n💥 Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n📸 Screenshots saved to:');
  console.log('  - /opt/livekit1/frontend/scripts/prod-auth-flow.png');
  console.log('  - /opt/livekit1/frontend/scripts/local-brand-profile.png');
}

diagnoseAuthFlow().catch(console.error);
