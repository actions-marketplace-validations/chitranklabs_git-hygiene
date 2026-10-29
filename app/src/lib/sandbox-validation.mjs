import { resolveConfig, validateCommit, validateBranch } from '@chitrank2050/git-hygiene-core';

export const maxRequestBytes = 16_384;
const fields = new Set([
  'commit',
  'branch',
  'types',
  'ignoreBranches',
  'maxHeaderLength',
  'allowEmptyScope',
]);

export class InvalidSandboxInput extends Error {}

export async function validateSandbox(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some(key => !fields.has(key))
  )
    throw new InvalidSandboxInput();
  const { commit, branch, types, ignoreBranches, maxHeaderLength, allowEmptyScope } = value;
  if (
    typeof commit !== 'string' ||
    commit.length > 4000 ||
    typeof branch !== 'string' ||
    branch.length > 256 ||
    !Array.isArray(types) ||
    types.length < 1 ||
    types.length > 30 ||
    !types.every(type => typeof type === 'string' && /^[a-z0-9_-]{1,32}$/.test(type)) ||
    !Array.isArray(ignoreBranches) ||
    ignoreBranches.length > 30 ||
    !ignoreBranches.every(
      name => typeof name === 'string' && name.length > 0 && name.length <= 100,
    ) ||
    !Number.isInteger(maxHeaderLength) ||
    maxHeaderLength < 1 ||
    maxHeaderLength > 200 ||
    typeof allowEmptyScope !== 'boolean'
  )
    throw new InvalidSandboxInput();

  // Only these primitive settings cross the boundary. Module presets and raw rules never do.
  const config = await resolveConfig({
    types,
    ignoreBranches,
    maxHeaderLength,
    allowEmptyScope,
    extends: ['@commitlint/config-conventional'],
  });
  const [commitResult, branchResult] = await Promise.all([
    validateCommit(commit, config),
    validateBranch(branch, config),
  ]);
  const header = commit.split('\n', 1)[0].match(/^([^(:!]+)(?:\(([^)]+)\))?!?:/);
  return {
    commit: {
      valid: commitResult.valid,
      errors: commitResult.errors?.map(error => error.message) ?? [],
      type: header?.[1] ?? null,
      scope: header?.[2] ?? null,
    },
    branch: {
      valid: branchResult.valid,
      errors: branchResult.valid ? [] : [branchResult.message],
      type: branch.split('/')[0],
      description: branch.split('/').slice(1).join('/'),
      isIgnoredBase: ignoreBranches.includes(branch),
    },
  };
}

export async function handleSandboxRequest(request) {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  const failure = (status, code, message) =>
    Response.json({ status: 'error', error: { code, message } }, { status, headers });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return failure(415, 'CONTENT_TYPE', 'Send a JSON request.');
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      // Next can normalize request.url to localhost, and TLS terminates at the proxy.
      // The incoming Host is the browser-facing authority; forwarded headers are not trusted.
      const originUrl = new URL(origin);
      const host = (request.headers.get('host') ?? new URL(request.url).host).toLowerCase();
      if (
        !['http:', 'https:'].includes(originUrl.protocol) ||
        originUrl.origin !== origin ||
        originUrl.host !== host
      )
        return failure(403, 'ORIGIN', 'Cross-origin requests are not supported.');
    } catch {
      return failure(403, 'ORIGIN', 'Cross-origin requests are not supported.');
    }
  }
  if (Number(request.headers.get('content-length')) > maxRequestBytes)
    return failure(413, 'SIZE', 'Request exceeds the sandbox limit.');
  const reader = request.body?.getReader();
  if (!reader) return failure(400, 'INPUT', 'Provide sandbox inputs.');
  try {
    const chunks = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxRequestBytes) {
        await reader.cancel();
        return failure(413, 'SIZE', 'Request exceeds the sandbox limit.');
      }
      chunks.push(Buffer.from(value));
    }
    const data = await validateSandbox(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    return Response.json({ status: 'success', data }, { headers });
  } catch (error) {
    if (error instanceof InvalidSandboxInput || error instanceof SyntaxError)
      return failure(400, 'INPUT', 'Check the sandbox inputs and configuration limits.');
    return failure(503, 'UNAVAILABLE', 'Validation is temporarily unavailable. Try again.');
  } finally {
    reader.releaseLock();
  }
}
