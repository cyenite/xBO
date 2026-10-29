// Fails CI when a published bundle grows past its budget (gzip bytes), so size changes are deliberate.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const budgets = [
  { file: 'packages/core/dist/index.js', maxGzip: 12_000 },
  { file: 'packages/vue/dist/index.js', maxGzip: 60_000 },
  { file: 'packages/vue/dist/style.css', maxGzip: 14_000 },
];

let hasFailed = false;

for (const { file, maxGzip } of budgets) {
  const size = gzipSync(readFileSync(file)).length;
  const status = size <= maxGzip ? 'ok' : 'over budget';

  if (size > maxGzip) hasFailed = true;

  console.log(`${file}: ${size} B gzip (budget ${maxGzip} B) ${status}`);
}

if (hasFailed) process.exit(1);
