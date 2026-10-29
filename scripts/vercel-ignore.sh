#!/bin/sh
# Vercel uses exit 0 to skip deployment and exit 1 to build.
[ "${VERCEL_ENV:-}" = 'production' ] || exit 0

# Missing history must allow a build in shallow checkouts.
previous=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
git rev-parse --verify "${previous}^{commit}" >/dev/null 2>&1 || exit 1

if [ "${1:-website}" = 'docs' ]; then
  git diff --quiet "$previous" HEAD -- \
    ':(top)docs' ':(top)assets' ':(top)scripts/vercel-ignore.sh' \
    ':(top)package.json' ':(top)pnpm-lock.yaml' ':(top)pnpm-workspace.yaml' \
    ':(top)turbo.json' || exit 1
  exit 0
fi

git diff --quiet "$previous" HEAD -- \
  ':(top)app' ':(top)assets/theme-tokens.css' ':(top)packages' ':(top)scripts' \
  ':(top)cliff.toml' ':(top)package.json' ':(top)pnpm-lock.yaml' \
  ':(top)pnpm-workspace.yaml' ':(top)turbo.json' ':(top)tsconfig*.json' \
  || exit 1
