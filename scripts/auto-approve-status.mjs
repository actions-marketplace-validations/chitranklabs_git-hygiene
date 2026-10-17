import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function approvalStatus(pr) {
  const checks = pr.statusCheckRollup.filter(
    check => !/^Auto-(Approve|Merge)/.test(check.name ?? check.context ?? ''),
  );
  const failed = checks.filter(check =>
    check.__typename === 'StatusContext' || check.state
      ? ['ERROR', 'FAILURE'].includes(check.state)
      : check.status === 'COMPLETED' &&
        !['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(check.conclusion),
  );
  if (pr.mergeable === 'CONFLICTING' || failed.length)
    return {
      ready: false,
      failed: true,
      message: 'Approval blocked by conflicts or failed checks.',
    };
  const pending = checks.some(check =>
    check.__typename === 'StatusContext' || check.state
      ? check.state !== 'SUCCESS'
      : check.status !== 'COMPLETED',
  );
  if (pending || pr.mergeable !== 'MERGEABLE' || checks.length === 0)
    return {
      ready: false,
      failed: false,
      message: 'Approval deferred while checks or mergeability are pending.',
    };
  return { ready: true, failed: false, message: 'All checks passed and the PR is mergeable.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = approvalStatus(JSON.parse(readFileSync(0, 'utf8')));
  if (process.argv.includes('--state')) {
    console.error(result.message);
    console.log(result.failed ? 'failed' : result.ready ? 'ready' : 'pending');
  } else console.log(result.message);
  appendFileSync(process.env.GITHUB_OUTPUT, `ready=${result.ready}\n`);
  if (result.failed) process.exitCode = 1;
}
