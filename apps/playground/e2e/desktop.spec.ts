import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

async function freshDesktop(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => localStorage.clear());
  await page.goto(path);
  await expect(page.getByRole('navigation', { name: 'Taskbar' })).toBeVisible();
}

function appWindow(page: Page, title: string) {
  return page.locator('section.app-window', { has: page.getByRole('heading', { name: title, exact: true }) });
}

test('opens the startup app with the menu bar and taskbar', async ({ page }) => {
  await freshDesktop(page);

  await expect(appWindow(page, 'Welcome')).toBeVisible();
  await expect(page.getByRole('menubar')).toBeVisible();
});

test('opens an app from the command palette', async ({ page }) => {
  await freshDesktop(page);

  await page.keyboard.press(`${mod}+k`);
  await page.getByRole('combobox').fill('files');
  await page.keyboard.press('Enter');

  await expect(appWindow(page, 'Files')).toBeVisible();
  await expect(page).toHaveURL(/#\/files/);
});

test('opens an app from the Start launcher', async ({ page }) => {
  await freshDesktop(page);

  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('dialog', { name: 'Start' }).getByPlaceholder(/Search apps/).fill('comp');
  await page.keyboard.press('Enter');

  await expect(appWindow(page, 'Components')).toBeVisible();
});

test('snaps the focused window with the keyboard', async ({ page }) => {
  await freshDesktop(page);

  await page.keyboard.press('Control+Alt+ArrowLeft');

  const box = await appWindow(page, 'Welcome').boundingBox();

  expect(box?.x).toBeLessThan(20);
  expect(box?.width).toBeLessThan(760);
});

test('asks before closing a window with unsaved changes', async ({ page }) => {
  await freshDesktop(page, '/#/notes');

  await page.getByRole('textbox', { name: 'Note' }).fill('Draft');
  await appWindow(page, 'Untitled note').getByRole('button', { name: /^Close/ }).click();

  const sheet = page.getByRole('alertdialog', { name: 'Discard unsaved changes?' });

  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Keep editing' }).click();
  await expect(appWindow(page, 'Untitled note')).toBeVisible();
});

test('keeps appearance settings and open windows after a reload', async ({ page }) => {
  await freshDesktop(page);

  await page.keyboard.press(`${mod}+,`);

  const settings = appWindow(page, 'Settings');

  await settings.getByRole('radio', { name: 'Dark' }).click();
  await settings.getByRole('radio', { name: 'Forest' }).click();
  await expect(page.locator('.xbo-desktop')).toHaveAttribute('data-xbo-mode', 'dark');

  await page.reload();

  await expect(page.locator('.xbo-desktop')).toHaveAttribute('data-xbo-mode', 'dark');
  await expect(appWindow(page, 'Settings')).toBeVisible();
  await expect(appWindow(page, 'Welcome')).toBeVisible();
});

test('shows a notification from a registered command', async ({ page }) => {
  await freshDesktop(page);

  await page.keyboard.press('Control+Alt+t');

  await expect(page.getByRole('region', { name: 'Notifications' }).getByText('Test notification 1')).toBeVisible();
});

for (const mode of ['light', 'dark'] as const) {
  test(`has no detectable accessibility violations in ${mode} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await freshDesktop(page, '/#/components');

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();

    expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
  });
}
