import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const bin = fileURLToPath(new URL('../bin/create-xbo.mjs', import.meta.url));
const created: string[] = [];

function scaffold(...args: string[]): string {
  const parent = mkdtempSync(join(tmpdir(), 'create-xbo-'));

  created.push(parent);
  execFileSync(process.execPath, [bin, ...args], { cwd: parent, stdio: 'pipe' });

  return parent;
}

afterEach(() => {
  for (const path of created.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe('create-xbo', () => {
  it('creates a project with the name filled in and no placeholders left', () => {
    const app = join(scaffold('My Desk'), 'My Desk');
    const packageJson = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
    const main = readFileSync(join(app, 'src/main.ts'), 'utf8');

    expect(packageJson.name).toBe('my-desk');
    expect(packageJson.dependencies['@xbo-ui/vue']).toBeDefined();
    expect(main).toContain("name: 'My Desk'");
    expect(main).not.toMatch(/\{\{\w+\}\}/);
    expect(existsSync(join(app, '.gitignore'))).toBe(true);
    expect(main).not.toContain('tauri');
  });

  it('adds the Tauri integration on request', () => {
    const app = join(scaffold('desk', '--tauri'), 'desk');
    const packageJson = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
    const main = readFileSync(join(app, 'src/main.ts'), 'utf8');

    expect(packageJson.dependencies['@xbo-ui/tauri']).toBeDefined();
    expect(main).toContain('tauriConfig()');
    expect(main).toContain('...tauri.statusItems');
  });

  it('refuses to overwrite a folder that is not empty', () => {
    const parent = mkdtempSync(join(tmpdir(), 'create-xbo-'));

    created.push(parent);
    mkdirSync(join(parent, 'taken'));
    writeFileSync(join(parent, 'taken', 'file.txt'), 'x');

    expect(() => execFileSync(process.execPath, [bin, 'taken'], { cwd: parent, stdio: 'pipe' })).toThrow();
  });
});
