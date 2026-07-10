// End-to-end del flujo jugable con Playwright.
// Recorre title -> world -> challenge (resolviendo el reto del Golem de
// verdad, escribiendo código en el editor CodeMirror) -> results -> world,
// y verifica que el progreso del jugador persiste en localStorage y
// sobrevive a un refresh.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 41732;
const BASE = `http://localhost:${PORT}`;
const CHROMIUM = '/opt/pw-browsers/chromium';

// Solución de referencia del reto "golem-de-piedra" (el mismo que valida
// src/lib/sandbox.test.ts). Vive aquí para el e2e, no en el código del juego.
const GOLEM_SOLUTION =
  'function calcularDaño(ataque, defensa) { return Math.max(0, ataque - defensa); }';

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

  // World -> Challenge: entra a "Bosque de la Lógica" (un solo enemigo, el
  // Golem) por nombre, no por posición — el orden de zonas puede cambiar
  // según crezca el contenido.
  const zoneCards = await page.$$('.zone-card');
  let enteredLogica = false;
  for (const card of zoneCards) {
    const name = await card.$eval('.zone-name', (el) => el.textContent);
    if (name.includes('Bosque de la Lógica')) {
      await card.click();
      enteredLogica = true;
      break;
    }
  }
  assert(enteredLogica, 'la zona "Bosque de la Lógica" existe en el mapa');
  await page.waitForSelector('.challenge-screen');

  const enemyName = await page.textContent('.enemy-name');
  assert(enemyName.includes('Golem'), `el enemigo de "Bosque de la Lógica" es el Golem de Piedra (fue "${enemyName}")`);

  // Escribe la solución real en el editor CodeMirror.
  await page.click('.cm-content');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(GOLEM_SOLUTION, { delay: 5 });

  // Ataca: ejecuta el código en el Web Worker y espera el resultado.
  await page.click('.action-button');
  await page.waitForSelector('.feedback-box', { timeout: 5000 });
  const feedbackClass = await page.getAttribute('.feedback-box', 'class');
  assert(feedbackClass.includes('feedback-correct'), `el reto se resuelve (pass), no "${feedbackClass}"`);

  // Único reto de la zona -> el botón de feedback lleva a resultados.
  await page.click('.feedback-box .btn-primary');
  await page.waitForSelector('.results-screen');

  // Results -> World
  await page.click('.results-screen .btn-primary');
  await page.waitForSelector('.world-screen');

  // Persistencia
  const stored = await page.evaluate(() => localStorage.getItem('codequest-player-progress'));
  assert(stored && stored.includes('inventory'), 'el progreso del jugador se persiste en localStorage');
  assert(stored.includes('Scroll'), 'el loot de la zona completada está en el inventario persistido');

  await page.reload();
  await page.waitForSelector('.title-screen');
  const afterReload = await page.evaluate(() => localStorage.getItem('codequest-player-progress'));
  assert(afterReload && afterReload.includes('Scroll'), 'el progreso sobrevive a un refresh');

  assert(pageErrors.length === 0, `sin errores de página (${pageErrors.join('; ')})`);

  console.log('E2E OK: title -> world -> challenge (pass real) -> results -> world (+persistencia)');
} finally {
  if (browser) await browser.close();
  server.kill();
}
