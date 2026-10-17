import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleSandboxRequest,
  validateSandbox,
  InvalidSandboxInput,
} from '../src/lib/sandbox-validation.mjs';
const input = {
  commit: 'feat: hello',
  branch: 'feat/UPPER_CASE',
  types: ['feat', 'fix', 'chore'],
  ignoreBranches: ['main'],
  maxHeaderLength: 100,
  allowEmptyScope: true,
};
const request = value =>
  new Request('https://example.test/api/v1/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
test('sandbox uses shipped commitlint and branch rules', async () => {
  const result = await validateSandbox(input);
  assert.equal(result.commit.valid, true);
  assert.equal(result.branch.valid, true);
  assert.equal((await validateSandbox({ ...input, commit: 'feat: Hello.' })).commit.valid, false);
  assert.equal(
    (await validateSandbox({ ...input, commit: 'feat: hello\n\nbody' })).commit.valid,
    true,
  );
  assert.equal(
    (await validateSandbox({ ...input, commit: 'feat: hello', allowEmptyScope: false })).commit
      .valid,
    false,
  );
  assert.equal(
    (await validateSandbox({ ...input, commit: 'feat(api): hello', allowEmptyScope: false })).commit
      .valid,
    true,
  );
});
test('rejects executable settings and oversized or malformed inputs', async () => {
  for (const extra of [
    { extends: ['file:///tmp/a'] },
    { parserPreset: '/tmp/a' },
    { rules: {} },
    { commit: 'x'.repeat(4001) },
    { branch: 'x'.repeat(257) },
    { types: ['(a+)+'] },
    { types: [] },
    { maxHeaderLength: 201 },
    { allowEmptyScope: 'yes' },
  ])
    await assert.rejects(validateSandbox({ ...input, ...extra }), InvalidSandboxInput);
});
test('HTTP contract rejects wrong content type, origin, JSON and bounded streaming body', async () => {
  assert.equal((await handleSandboxRequest(request(input))).status, 200);
  assert.equal((await handleSandboxRequest(request({ ...input, rules: {} }))).status, 400);
  assert.equal(
    (
      await handleSandboxRequest(
        new Request('https://example.test/api/v1/validate', { method: 'POST', body: '{}' }),
      )
    ).status,
    415,
  );
  const crossOrigin = request(input);
  crossOrigin.headers.set('Origin', 'https://other.test');
  assert.equal((await handleSandboxRequest(crossOrigin)).status, 403);
  const malformed = request(input);
  Object.defineProperty(malformed, 'body', { value: new Blob(['{']).stream() });
  assert.equal((await handleSandboxRequest(malformed)).status, 400);
  assert.equal((await handleSandboxRequest(request('x'.repeat(17000)))).status, 413);
});

test('accepts the public Host origin behind Next internal hostname routing', async () => {
  const forwarded = new Request('http://localhost:3235/api/v1/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Host: '127.0.0.1:3235',
      Origin: 'http://127.0.0.1:3235',
    },
    body: JSON.stringify(input),
  });
  assert.equal((await handleSandboxRequest(forwarded)).status, 200);
});
