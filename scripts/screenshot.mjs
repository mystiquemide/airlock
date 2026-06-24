import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createConnection } from 'node:net';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve('docs/assets');
const BASE = 'http://localhost:3000';

mkdirSync(OUT_DIR, { recursive: true });

const pages = [
  { name: 'landing',   url: `${BASE}/`,          auth: false },
  { name: 'login',     url: `${BASE}/login`,      auth: false },
  { name: 'dashboard', url: `${BASE}/dashboard`,  auth: true  },
  { name: 'ledger',    url: `${BASE}/ledger`,     auth: true  },
  { name: 'agents',    url: `${BASE}/agents`,     auth: true  },
  { name: 'policy',    url: `${BASE}/policy`,     auth: true  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function cdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function waitForLoad(ws) {
  return new Promise((resolve) => {
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', handler);
          resolve();
        }
      } catch {}
    };
    ws.addEventListener('message', handler);
  });
}

async function run() {
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
  ], { stdio: 'ignore' });

  await sleep(2000);

  const res = await fetch('http://localhost:9222/json');
  const tabs = await res.json();
  const wsUrl = tabs[0].webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r));

  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 2, mobile: false
  });

  // Set auth cookie so protected routes work
  await cdp(ws, 'Network.enable');
  await cdp(ws, 'Network.setCookie', {
    url: BASE,
    name: 'airlock_session',
    value: 'demo_user',
    path: '/',
  });

  for (const page of pages) {
    console.log(`Capturing ${page.name}...`);
    const loadPromise = waitForLoad(ws);
    await cdp(ws, 'Page.navigate', { url: page.url });
    await loadPromise;
    await sleep(1800); // let animations settle

    const { data } = await cdp(ws, 'Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    const outPath = path.join(OUT_DIR, `${page.name}.png`);
    writeFileSync(outPath, Buffer.from(data, 'base64'));
    console.log(`  saved -> ${outPath}`);
  }

  ws.close();
  chrome.kill();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
