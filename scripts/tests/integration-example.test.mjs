import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('homepage action example stays within the action input contract', () => {
  const source = read('app/src/components/integration-tabs.tsx');
  const workflow = source.match(/id:\s*["']github-action["'][\s\S]*?code:\s*`([\s\S]+?)`/)?.[1];
  assert.ok(workflow);
  const action = workflow.match(
    /uses: chitranklabs\/git-hygiene@([a-f0-9]{40})\n\s+with:\n((?: {10}[^\n]+\n?)+)/,
  );
  assert.ok(action, 'use an immutable action revision with explicit inputs');
  const supported = new Set(
    [
      ...read('action.yml')
        .split('outputs:')[0]
        .matchAll(/^ {2}([\w-]+):$/gm),
    ].map(match => match[1]),
  );
  for (const [, key] of action[2].matchAll(/^ {10}([\w-]+):/gm)) assert.ok(supported.has(key), key);
  assert.match(action[2], /command: title/);
  assert.doesNotMatch(workflow, /secrets\.|continue-on-error/);
});
