import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { resolve } from 'node:path';
import test from 'node:test';

import puppeteer from 'puppeteer';

const EXTENSION_PATH = resolve('.');

function fixtureHtml() {
  return `<!doctype html>
  <html><head><meta charset="utf-8"><style>
    .ad-fixture { width: 300px; height: 250px; }
  </style></head><body>
    <main><h1>Optimizer browser fixture</h1><div id="ad-one" class="ad-fixture">fixture</div></main>
  </body></html>`;
}

async function startFixtureServer() {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(fixtureHtml());
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function waitForWorkerValue(worker, predicateSource, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await worker.evaluate(predicateSource);
    if (value) return value;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error('Timed out waiting for extension service-worker state');
}

test('loaded extension toggle controls DOM and network protection end to end', { timeout: 60_000 }, async () => {
  const { server, origin } = await startFixtureServer();
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      pipe: true,
      dumpio: true,
      enableExtensions: [EXTENSION_PATH],
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const workerTarget = await browser.waitForTarget(
      (target) => target.type() === 'service_worker' && target.url().endsWith('/src/background.js'),
      { timeout: 15_000 },
    );
    const worker = await workerTarget.worker();
    assert.ok(worker, 'extension service worker should be available');

    const page = await browser.newPage();
    await page.goto(origin, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelector('#ad-one')?.dataset.optimized === 'true');

    const initiallyEnabled = await worker.evaluate(async () => ({
      stored: (await chrome.storage.local.get(['enabled'])).enabled !== false,
      rulesets: await chrome.declarativeNetRequest.getEnabledRulesets(),
    }));
    assert.equal(initiallyEnabled.stored, true);
    assert.ok(initiallyEnabled.rulesets.includes('ruleset_1'));

    const firstPopupTarget = browser.waitForTarget(
      (target) => target.type() === 'page' && target.url().endsWith('/ui/popup.html'),
      { timeout: 10_000 },
    );
    await worker.evaluate(() => chrome.action.openPopup());
    const popup = await (await firstPopupTarget).asPage();
    assert.ok(popup, 'extension popup should open');
    await popup.waitForSelector('#toggleBtn');
    await popup.click('#toggleBtn');
    await popup.waitForFunction(() => document.querySelector('#toggleBtn')?.textContent === 'INACTIVE');

    await waitForWorkerValue(worker, async () => {
      const stored = await chrome.storage.local.get(['enabled']);
      const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
      const dynamic = await chrome.declarativeNetRequest.getDynamicRules();
      return stored.enabled === false && !rulesets.includes('ruleset_1') && dynamic.length === 0;
    });

    await page.evaluate(() => {
      const ad = document.createElement('div');
      ad.id = 'ad-two';
      ad.className = 'ad-fixture';
      ad.textContent = 'inactive fixture';
      document.body.append(ad);
    });
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 400));
    const inactiveState = await page.$eval('#ad-two', (element) => ({
      optimized: element.dataset.optimized || '',
      display: getComputedStyle(element).display,
    }));
    assert.equal(inactiveState.optimized, '');
    assert.notEqual(inactiveState.display, 'none');

    await popup.click('#toggleBtn');
    await popup.waitForFunction(() => document.querySelector('#toggleBtn')?.textContent === 'ACTIVE');
    await waitForWorkerValue(worker, async () => {
      const stored = await chrome.storage.local.get(['enabled']);
      const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
      return stored.enabled === true && rulesets.includes('ruleset_1');
    });

    await page.waitForFunction(() => document.querySelector('#ad-two')?.dataset.optimized === 'true');
    const enabledDisplay = await page.$eval('#ad-two', (element) => getComputedStyle(element).display);
    assert.equal(enabledDisplay, 'none');
  } finally {
    if (browser) await browser.close();
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
