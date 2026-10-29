// Packs the libraries, scaffolds an app with create-xbo, installs the packed tarballs and builds it, the way a user
// would after `pnpm create xbo`. Catches packaging mistakes that workspace links hide (missing files, lost CSS).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const work = mkdtempSync(join(tmpdir(), 'xbo-smoke-'));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: '1' } });

try {
  for (const name of ['core', 'vue']) run('pnpm', ['pack', '--pack-destination', work], join(root, 'packages', name));

  run(process.execPath, [join(root, 'packages/create-xbo/bin/create-xbo.mjs'), 'smoke-app'], work);

  const app = join(work, 'smoke-app');
  const tarball = (prefix) => join(work, readdirSync(work).find((file) => file.startsWith(prefix) && file.endsWith('.tgz')));
  const manifest = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));

  manifest.dependencies['@xbo-ui/vue'] = `file:${tarball('xbo-ui-vue-')}`;
  manifest.pnpm = { overrides: { '@xbo-ui/core': `file:${tarball('xbo-ui-core-')}` } };
  writeFileSync(join(app, 'package.json'), JSON.stringify(manifest, null, 2));

  run('pnpm', ['install', '--ignore-workspace', '--reporter=append-only'], app);
  run('pnpm', ['build'], app);

  const assets = join(app, 'dist/assets');
  const cssBytes = readdirSync(assets).filter((file) => file.endsWith('.css')).reduce((sum, file) => sum + statSync(join(assets, file)).size, 0);

  if (cssBytes < 20_000) throw new Error(`The scaffolded app's CSS is only ${cssBytes} bytes: the library stylesheet did not reach it.`);

  console.log(`\nScaffold smoke test passed (${cssBytes} bytes of CSS).`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
