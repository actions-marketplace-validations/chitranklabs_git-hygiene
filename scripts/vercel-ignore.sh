#!/bin/sh
# Vercel uses exit 0 to skip deployment and exit 1 to build.
[ "${VERCEL_ENV:-}" = 'production' ] || exit 0

# Missing history must allow a build in shallow checkouts.
previous=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
git rev-parse --verify "${previous}^{commit}" >/dev/null 2>&1 || exit 1

git diff --quiet "$previous" HEAD -- \
  ':(top)app' ':(top)docs' ':(top)packages' ':(top)scripts' \
  ':(top)cliff.toml' ':(top)package.json' ':(top)pnpm-lock.yaml' \
  ':(top)pnpm-workspace.yaml' ':(top)turbo.json' ':(top)tsconfig*.json' \
  || exit 1
