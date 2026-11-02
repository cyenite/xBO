// Regenerates the README screenshots and GIFs in docs/media from the running playground:
//   pnpm dev
//   pnpm --filter @xbo-ui/playground media
// MEDIA_ONLY=hero,palette limits the run to some captures. The GIFs need ffmpeg on PATH.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const base = process.env.MEDIA_URL ?? 'http://localhost:5190';
const out = resolve(import.meta.dirname, '../../../docs/media');
const only = process.env.MEDIA_ONLY?.split(',');
const size = { width: 1280, height: 800 };
const dusk = { kind: 'gradient', value: 'linear-gradient(160deg, oklch(0.55 0.08 260), oklch(0.72 0.09 40))' };
const lagoon = { kind: 'gradient', value: 'linear-gradient(150deg, oklch(0.5 0.08 200), oklch(0.8 0.07 170))' };

// Headless Chromium draws no pointer, so the GIFs would show windows moving on their own.
const cursorScript = `
  addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);background:url("data:image/svg+xml,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M3 2l15 9-6.5 1.5L8.5 19z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>') +
      '") no-repeat';
    document.body.append(cursor);
    addEventListener('mousemove', (event) => { cursor.style.transform = 'translate(' + (event.clientX - 3) + 'px,' + (event.clientY - 2) + 'px)'; }, true);
  });
`;

const browser = await chromium.launch();
const captures = [];

mkdirSync(out, { recursive: true });

function capture(name, run) {
  if (!only || only.includes(name)) captures.push([name, run]);
}

async function desktop({ mode = 'light', preferences = {}, path = '/', isRecorded = false } = {}) {
  const videoDir = isRecorded ? mkdtempSync(join(tmpdir(), 'xbo-media-')) : undefined;
  const context = await browser.newContext({
    viewport: size,
    colorScheme: mode,
    deviceScaleFactor: isRecorded ? 1 : 2,
    recordVideo: videoDir ? { dir: videoDir, size } : undefined,
  });

  await context.addInitScript(
    (seeded) => {
      if (sessionStorage.getItem('seeded')) return;

      localStorage.clear();
      localStorage.setItem('xbo-playground.preferences', JSON.stringify(seeded));
      sessionStorage.setItem('seeded', '1');
    },
    { appearance: mode, isSessionRestored: false, isBoundsMemoryOn: false, ...preferences },
  );

  if (isRecorded) await context.addInitScript({ content: cursorScript });

  const page = await context.newPage();
  const openedAt = Date.now();

  await page.goto(base + path);
  await page.getByRole('navigation', { name: 'Taskbar' }).waitFor();
  await page.waitForTimeout(600);

  return { page, context, videoDir, openedAt, trim: 0 };
}

function appWindow(page, title) {
  return page.locator('section.app-window', { has: page.getByRole('heading', { name: title, exact: true }) });
}

function taskbarButton(page, label) {
  return page.getByRole('navigation', { name: 'Taskbar' }).getByRole('button', { name: label, exact: true });
}

// Every capture starts from a desktop with only Welcome open; this hides it but keeps it mounted,
// because its window registers the "Send a test notification" command.
async function clearDesktop(session) {
  await session.page.keyboard.press('Control+Alt+ArrowDown');
  await session.page.waitForTimeout(500);
  session.trim = (Date.now() - session.openedAt) / 1000;
}

async function shot(page, name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${name}.png`) });
}

async function moveWindow(page, title, to, steps = 30) {
  const bar = await appWindow(page, title).getByRole('heading', { name: title, exact: true }).boundingBox();

  await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2, { steps: 12 });
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
  await page.mouse.up();
}

async function placeWindow(page, title, at, resizeTo) {
  const frame = appWindow(page, title);

  if (resizeTo) {
    const box = await frame.boundingBox();
    const corner = await frame.locator('.resize-se').boundingBox();

    await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + resizeTo.width, box.y + resizeTo.height, { steps: 5 });
    await page.mouse.up();
  }

  const box = await frame.boundingBox();
  const bar = await frame.getByRole('heading', { name: title, exact: true }).boundingBox();

  await page.mouse.move(bar.x + 4, bar.y + 4);
  await page.mouse.down();
  await page.mouse.move(at.x + bar.x + 4 - box.x, at.y + bar.y + 4 - box.y, { steps: 5 });
  await page.mouse.up();
}

async function glide(page, locator) {
  await locator.scrollIntoViewIfNeeded();

  const box = await locator.boundingBox();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
  await page.waitForTimeout(150);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function gif({ context, videoDir, trim }, name, { width = 880, fps = 12 } = {}) {
  await context.close();

  const [video] = readdirSync(videoDir);
  const filters = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`;

  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', trim.toFixed(2), '-i', join(videoDir, video), '-vf', filters, '-loop', '0', join(out, `${name}.gif`)]);
  rmSync(videoDir, { recursive: true, force: true });
}

for (const mode of ['light', 'dark']) {
  capture(`hero-${mode}`, async () => {
    const session = await desktop({ mode, preferences: { wallpaper: dusk } });
    const { page } = session;

    await clearDesktop(session);
    await taskbarButton(page, 'Files').click();
    await placeWindow(page, 'Files', { x: 28, y: 52 });
    await taskbarButton(page, 'Components').click();
    await page.getByRole('navigation', { name: 'Component groups' }).getByText('Inputs', { exact: true }).click();
    await placeWindow(page, 'Components', { x: 572, y: 200 }, { width: 680, height: 520 });
    await page.keyboard.press('Control+Alt+t');
    await shot(page, `hero-${mode}`);
    await session.context.close();
  });
}

capture('palette', async () => {
  const session = await desktop({ mode: 'dark', preferences: { wallpaper: dusk } });
  const { page } = session;

  await clearDesktop(session);
  await taskbarButton(page, 'Files').click();
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').pressSequentially('se', { delay: 60 });
  await shot(page, 'palette');
  await session.context.close();
});

capture('launcher', async () => {
  const session = await desktop({ mode: 'light', preferences: { wallpaper: lagoon } });
  const { page } = session;

  await clearDesktop(session);
  await page.getByRole('button', { name: 'Start' }).click();
  await shot(page, 'launcher');
  await session.context.close();
});

capture('settings', async () => {
  const session = await desktop({ mode: 'light', preferences: { accent: 'violet' } });
  const { page } = session;

  await clearDesktop(session);
  await page.keyboard.press('Control+,');
  await appWindow(page, 'Settings').waitFor();
  await shot(page, 'settings');
  await session.context.close();
});

capture('components', async () => {
  const session = await desktop({ mode: 'dark', preferences: { wallpaper: lagoon, accent: 'ocean' } });
  const { page } = session;

  await clearDesktop(session);
  await taskbarButton(page, 'Components').click();
  await page.getByRole('navigation', { name: 'Component groups' }).getByText('Data', { exact: true }).click();
  await shot(page, 'components');
  await session.context.close();
});

capture('windows', async () => {
  const session = await desktop({ mode: 'light', isRecorded: true, preferences: { wallpaper: dusk } });
  const { page } = session;

  await clearDesktop(session);
  await page.mouse.move(640, 420);
  await glide(page, taskbarButton(page, 'Files'));
  await page.waitForTimeout(500);
  await moveWindow(page, 'Files', { x: 4, y: 420 });
  await page.waitForTimeout(700);
  await glide(page, taskbarButton(page, 'Components'));
  await page.waitForTimeout(500);
  await moveWindow(page, 'Components', { x: size.width - 4, y: 420 });
  await page.waitForTimeout(900);
  await moveWindow(page, 'Components', { x: 640, y: 3 });
  await page.waitForTimeout(900);
  await page.keyboard.press('Control+Alt+ArrowDown');
  await page.waitForTimeout(700);
  await page.keyboard.press('Control+Alt+ArrowRight');
  await page.waitForTimeout(1300);

  await gif(session, 'windows');
});

capture('palette-demo', async () => {
  const session = await desktop({ mode: 'dark', isRecorded: true, preferences: { wallpaper: dusk } });
  const { page } = session;

  await clearDesktop(session);
  await page.mouse.move(1100, 650);
  await page.waitForTimeout(400);
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(400);
  await page.getByRole('combobox').pressSequentially('files', { delay: 130 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);
  await page.getByRole('combobox').pressSequentially('notif', { delay: 130 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);

  await gif(session, 'palette');
});

capture('theming', async () => {
  const session = await desktop({ mode: 'light', isRecorded: true });
  const { page } = session;

  await clearDesktop(session);
  await page.keyboard.press('Control+,');

  const settings = appWindow(page, 'Settings');

  await settings.waitFor();
  await page.mouse.move(640, 400);
  await page.waitForTimeout(500);

  for (const name of ['Ocean', 'Rose', 'Forest']) {
    await glide(page, settings.getByRole('radio', { name, exact: true }));
    await page.waitForTimeout(600);
  }

  await glide(page, settings.getByRole('radio', { name: 'Dark', exact: true }));
  await page.waitForTimeout(700);

  for (const name of ['Violet', 'Ember']) {
    await glide(page, settings.getByRole('radio', { name, exact: true }));
    await page.waitForTimeout(600);
  }

  await glide(page, settings.getByRole('radio', { name: 'Dusk', exact: true }));
  await page.waitForTimeout(1200);

  await gif(session, 'theming');
});

console.log(`Capturing into ${out}`);

for (const [name, run] of captures) {
  await run();
  console.log(`  ${name}`);
}

await browser.close();
