// End-to-end del flujo jugable con Playwright.
// Recorre title -> world -> challenge (resolviendo los retos reales de
// "Bosque de la Lógica" uno a uno, escribiendo código en el editor
// CodeMirror) -> results -> world, y verifica que el progreso del jugador
// persiste en localStorage y sobrevive a un refresh.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 41732;
const BASE = `http://localhost:${PORT}`;
// En CI (y en cualquier máquina donde se haya corrido
// `playwright install chromium`) Playwright resuelve su propio binario sin
// ayuda. Algunos sandboxes de desarrollo, en cambio, traen Chromium
// preinstalado en una ruta fija fuera del registro habitual de Playwright;
// si existe, se usa explícitamente. PLAYWRIGHT_CHROMIUM_PATH permite forzar
// cualquier otra ruta.
const SANDBOX_CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const CHROMIUM_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined);

// Soluciones de referencia de los retos de "Bosque de la Lógica" (las mismas
// que valida src/lib/sandbox.test.ts). Viven aquí para el e2e, no en el
// código del juego. Se identifican por el nombre del enemigo, no por orden,
// para no depender de cómo se ordenen los retos dentro de la zona.
const LOGICA_SOLUTIONS = {
  'Golem de Piedra':
    'function calcularDaño(ataque, defensa) { return Math.max(0, ataque - defensa); }',
  'Espectro del Azar':
    'function calcularGolpe(probabilidad) { return probabilidad >= 90 ? "CRÍTICO" : "normal"; }',
  'Hechicero Elemental':
    'function hallarDebilidad(elemento) { switch (elemento) { case "fuego": return "agua"; case "agua": return "tierra"; case "tierra": return "aire"; case "aire": return "fuego"; default: return "desconocido"; } }',
};

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
  browser = await chromium.launch(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {});
  const page = await browser.newPage();

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(BASE);

  // Title -> World
  await page.waitForSelector('.title-screen');
  await page.click('.title-screen .btn-primary');
  await page.waitForSelector('.world-screen');

  // Activa y desactiva el toggle de sonido (Paso 4 del rediseño retro): el
  // AudioContext real del navegador headless debe crearse/sonar sin romper
  // el flujo, y el juego debe seguir jugable con el toggle en cualquier
  // estado al entrar a una zona.
  await page.waitForSelector('.settings-btn');
  const soundToggle = page.locator('.settings-btn', { hasText: 'Sonido' });
  await soundToggle.click();
  assert((await soundToggle.getAttribute('aria-pressed')) === 'true', 'el toggle de sonido se activa');
  await soundToggle.click();
  assert((await soundToggle.getAttribute('aria-pressed')) === 'false', 'el toggle de sonido vuelve a desactivarse');

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

  // Resuelve, uno a uno, todos los retos de la zona hasta llegar a resultados.
  const solvedEnemies = [];
  const logicaChallengeCount = Object.keys(LOGICA_SOLUTIONS).length;
  for (let i = 0; i < logicaChallengeCount; i++) {
    await page.waitForSelector('.challenge-screen');
    const enemyName = await page.textContent('.enemy-name');
    const solution = LOGICA_SOLUTIONS[enemyName.trim()];
    assert(solution, `hay solución de referencia para el enemigo "${enemyName}"`);
    solvedEnemies.push(enemyName.trim());

    // Escribe la solución real en el editor CodeMirror.
    await page.click('.cm-content');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(solution, { delay: 5 });

    // Ataca: ejecuta el código en el Web Worker y espera el resultado. El
    // feedback pasa primero por el estado "running" (mismo .feedback-box)
    // antes de asentarse en "pass", así que esperamos la clase final.
    await page.click('.action-button');
    await page.waitForSelector('.feedback-box.feedback-correct', { timeout: 5000 });
    await page.click('.feedback-box .btn-primary');
  }

  assert(solvedEnemies.includes('Golem de Piedra'), 'el Golem de Piedra se resolvió como parte de la zona');
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
