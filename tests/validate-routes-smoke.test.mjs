import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// scripts/validate-routes.mjs is a side-effecting top-level script, not a
// library of exported functions, so this gives it automated regression
// coverage (per PF-012's "where practical") without an unwarranted refactor
// into a CLI/library split. Reads the real, current repo state only —
// never mutates anything, no network access.
test('scripts/validate-routes.mjs exits 0 against the current repository', () => {
  const scriptPath = fileURLToPath(
    new URL('../scripts/validate-routes.mjs', import.meta.url),
  );
  const output = execFileSync(process.execPath, [scriptPath], {
    encoding: 'utf8',
  });
  assert.match(output, /all \d+ routes valid\./);
});
