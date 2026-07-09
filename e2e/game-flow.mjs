// End-to-end del flujo jugable con Playwright.
// Recorre title -> world -> challenge -> results -> world y verifica que el
// progreso del jugador persiste en localStorage y sobrevive a un refresh.
//
// En el Paso 1 la pantalla 'challenge' aún renderiza la UI de trivia
// (MissionScreen). Cuando el Paso 2 introduzca el editor CodeMirror, este
// script se actualizará para resolver un reto de código en vez de responder
// trivia. El selector .mission-screen se renombrará entonces a .challenge-screen.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 41732;
const BASE = `http://localhost:${PORT}`;
const CHROMIUM = '/opt/pw-browsers/chromium';

function assert(condition, message) {
  if (!condition) throw new Error(`Aserción fallida: ${message}`);
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* aún no está listo */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('El servidor de preview no arrancó a tiempo');
}

const server = spawn('node_modules/.bin/vite', ['preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
});

let browser;
try {
  await waitForServer(BASE);
  browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage();

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(BASE);

  // Title -> World
  await page.waitForSelector('.title-screen');
  await page.click('.title-screen .btn-primary');
  await page.waitForSelector('.world-screen');

  // World -> Challenge
  await page.click('.zone-card');
  await page.waitForSelector('.mission-screen');

  // Completa las 3 misiones de la zona
  for (let i = 0; i < 3; i++) {
    const choices = await page.$$('.choice-btn');
    await choices[0].click();
    await page.waitForSelector('.feedback-box');
    await page.click('.feedback-box .btn-primary');
    if (i < 2) await page.waitForSelector('.mission-screen');
  }

  // Challenge -> Results -> World
  await page.waitForSelector('.results-screen');
  await page.click('.results-screen .btn-primary');
  await page.waitForSelector('.world-screen');

  // Persistencia
  const stored = await page.evaluate(() => localStorage.getItem('codequest-player-progress'));
  assert(stored && stored.includes('inventory'), 'el progreso del jugador se persiste en localStorage');

  await page.reload();
  await page.waitForSelector('.title-screen');
  const afterReload = await page.evaluate(() => localStorage.getItem('codequest-player-progress'));
  assert(afterReload && afterReload.includes('Scroll'), 'el progreso sobrevive a un refresh');

  assert(pageErrors.length === 0, `sin errores de página (${pageErrors.join('; ')})`);

  console.log('E2E OK: title -> world -> challenge -> results -> world (+persistencia)');
} finally {
  if (browser) await browser.close();
  server.kill();
}
