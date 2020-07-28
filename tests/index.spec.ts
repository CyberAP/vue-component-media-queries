const path = require('path');

const baseUrl = `file://${path.resolve(__dirname, './index.html')}`

describe('e2e: Client Side Rendering', () => {
  it('supports media queries', async () => {
    await page.goto(baseUrl);
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 1,
    });

    await page.waitFor('[data-test-csr]');
    expect(await page.$eval('[data-test-csr]', el => el.textContent)).toBe('isMobile');

    await page.setViewport({
      width: 1040,
      height: 480,
      deviceScaleFactor: 1,
    });
    await page.waitFor(100);
    expect(await page.$eval('[data-test-csr]', el => el.textContent)).toBe('isDesktop');
  });
});

describe('e2e: Server Side Rendering', () => {
  it('does not produce hydration errors', async () => {
    const messages: any[] = [];

    page.on('console', (message) => {
      messages.push(message)
    });

    await page.goto(baseUrl);
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 1,
    });

    await page.waitFor('[data-test-ssr-mobile]');
    await page.waitFor('[data-test-ssr-desktop]');
    expect(await page.$eval('[data-test-ssr-mobile]', el => el.textContent)).toBe('isMobile');
    expect(await page.$eval('[data-test-ssr-desktop]', el => el.textContent)).toBe('isMobile');

    expect(messages).toMatchObject([]);
  });
});
