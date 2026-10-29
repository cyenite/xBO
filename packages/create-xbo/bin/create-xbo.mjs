#!/usr/bin/env node
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const templateDir = fileURLToPath(new URL('../template', import.meta.url));
const args = process.argv.slice(2);
const hasTauri = args.includes('--tauri');
const target = args.find((arg) => !arg.startsWith('--')) ?? 'xbo-app';
const targetDir = resolve(process.cwd(), target);
const packageName = basename(targetDir).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'xbo-app';
const appTitle = packageName.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');

if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
  console.error(`${target} already exists and is not empty. Pick another name or remove it first.`);
  process.exit(1);
}

cpSync(templateDir, targetDir, { recursive: true });

// npm drops files named .gitignore from published packages, so the template ships it under another name.
renameSync(join(targetDir, '_gitignore'), join(targetDir, '.gitignore'));

function fill(relativePath, replacements) {
  const path = join(targetDir, relativePath);
  let text = readFileSync(path, 'utf8');

  for (const [placeholder, value] of Object.entries(replacements)) text = text.replaceAll(placeholder, value);

  writeFileSync(path, text);
}

const tauriImport = hasTauri ? "import { tauriConfig } from '@xbo-ui/tauri';\n" : '';
const tauriSetup = hasTauri ? 'const tauri = tauriConfig();\n\n' : '';
const tauriStatus = hasTauri ? '  statusItems: [...tauri.statusItems],\n  preferences: { ...tauri.preferences },\n' : '';
const tauriDependency = hasTauri ? '\n    "@xbo-ui/tauri": "^0.1.0",\n    "@tauri-apps/api": "^2.0.0",\n    "@tauri-apps/plugin-store": "^2.0.0",' : '';

fill('package.json', { '{{name}}': packageName, '{{tauriDependencies}}': tauriDependency });
fill('index.html', { '{{title}}': appTitle });
fill('src/main.ts', { '{{title}}': appTitle, '{{tauriImport}}': tauriImport, '{{tauriSetup}}': tauriSetup, '{{tauriConfig}}': tauriStatus });

console.log(`\nCreated ${appTitle} in ${targetDir}\n`);
console.log('Next:');
console.log(`  cd ${target}`);
console.log('  pnpm install');
console.log('  pnpm dev');

if (hasTauri) console.log('\nThen add the desktop wrapper with `pnpm tauri init` and register tauri-plugin-store in src-tauri.');
