import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approvalStatus } from '../auto-approve-status.mjs';
const success = { status: 'COMPLETED', conclusion: 'SUCCESS', name: 'CI' };
const pr = (...checks) => ({ mergeable: 'MERGEABLE', statusCheckRollup: checks });
test('pending checks defer without failure, completed failures still block', () => {
  assert.deepEqual(approvalStatus(pr(success, { name: 'Deploy', status: 'IN_PROGRESS' })), {
    ready: false,
    failed: false,
    message: 'Approval deferred while checks or mergeability are pending.',
  });
  for (const conclusion of ['FAILURE', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED'])
    assert.equal(approvalStatus(pr({ ...success, conclusion })).failed, true);
  assert.equal(approvalStatus(pr(success)).ready, true);
});
test('legacy status contexts distinguish pending, failure and success', () => {
  assert.equal(approvalStatus(pr(success, { context: 'Vercel', state: 'PENDING' })).failed, false);
  assert.equal(approvalStatus(pr(success, { context: 'Vercel', state: 'PENDING' })).ready, false);
  assert.equal(approvalStatus(pr(success, { context: 'Vercel', state: 'FAILURE' })).failed, true);
  assert.equal(approvalStatus(pr(success, { context: 'Vercel', state: 'SUCCESS' })).ready, true);
});
test('unknown mergeability and missing checks defer; conflicts fail', () => {
  assert.equal(approvalStatus({ ...pr(success), mergeable: 'UNKNOWN' }).failed, false);
  assert.equal(approvalStatus({ ...pr(success), mergeable: 'UNKNOWN' }).ready, false);
  assert.equal(approvalStatus({ ...pr(success), mergeable: 'CONFLICTING' }).failed, true);
  assert.equal(approvalStatus(pr()).ready, false);
  assert.equal(
    approvalStatus(pr(success, { name: 'Auto-Approve', status: 'IN_PROGRESS' })).ready,
    true,
  );
});

test('workflow polling approves completion, fails immediately and bounds pending waits', t => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflow = readFileSync(join(root, '.github/workflows/auto-approve.yml'), 'utf8');
  const script = workflow
    .split('      - name: Verify All Checks & Mergeability')[1]
    .split('        run: |')[1]
    .split('\n      - name:')[0]
    .split('\n')
    .map(line => line.replace(/^ {10}/, ''))
    .join('\n');
  const directory = mkdtempSync(join(tmpdir(), 'hygiene-approval-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'sleep'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  writeFileSync(
    join(directory, 'gh'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const counter = process.env.COUNTER;
const index = fs.existsSync(counter) ? Number(fs.readFileSync(counter, 'utf8')) : 0;
const states = JSON.parse(process.env.CHECK_STATES);
fs.writeFileSync(counter, String(index + 1));
console.log(JSON.stringify(states[Math.min(index, states.length - 1)]));
`,
    { mode: 0o755 },
  );
  const pending = pr({ name: 'Deploy', status: 'IN_PROGRESS' });
  for (const [states, status, count, ready] of [
    [[pending, pr(success)], 0, 2, true],
    [[pr({ ...success, conclusion: 'FAILURE' })], 1, 1, false],
    [[pending], 0, 18, false],
  ]) {
    const counter = join(directory, 'count');
    const output = join(directory, 'output');
    rmSync(counter, { force: true });
    writeFileSync(output, '');
    const result = spawnSync('bash', ['-c', script], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        GITHUB_OUTPUT: output,
        PR_NUMBER: '1',
        GITHUB_REPOSITORY: 'example/repo',
        COUNTER: counter,
        CHECK_STATES: JSON.stringify(states),
      },
    });
    assert.equal(result.status, status, result.stderr);
    assert.equal(Number(readFileSync(counter, 'utf8')), count);
    assert.equal(readFileSync(output, 'utf8').trim().split('\n').at(-1), `ready=${ready}`);
  }
});
