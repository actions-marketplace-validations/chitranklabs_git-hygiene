# Contributing to git-hygiene 🌊🏗️

First off, thank you for considering contributing to `git-hygiene`! It's people like you that make it a great tool for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **Node.js**: v24.14 or higher for the complete workspace build
- **pnpm**: use the exact `packageManager` version in the root `package.json` (currently 11.25.0).

### Repository Structure

This is a monorepo managed with **pnpm workspaces** and **Turborepo**:

- `packages/core`: 🧠 The validation engine, including configuration and Git-history access. See its [README](packages/core/README.md).
- `packages/cli`: 🌊 The command-line interface. Built on top of core.
- `app`: Next.js website and documentation build.
- `docs`: Independent Monoline Docs handbook, sharing the website theme tokens.

### Local Setup

1. **Clone the repo**:

   ```bash
   git clone https://github.com/chitranklabs/git-hygiene.git
   cd git-hygiene
   ```

2. **Install dependencies**:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Build the project**:

   ```bash
   pnpm build
   ```

For website and handbook work, see the [development guide](docs/content/development.md) and [deployment guide](docs/content/deployment.md).

## Development Workflow

### Package-specific work

Run commands from the repository root:

```bash
pnpm --filter @chitrank2050/git-hygiene-core test
pnpm --filter @chitrank2050/git-hygiene test
pnpm --filter git-hygiene-app dev
```

Build first when testing the CLI so workspace dependencies and the action bundle exist. Do not launch separate `pnpm build` and `pnpm test:cov` processes concurrently in the same checkout; both can write build outputs.

### Action bundle maintenance

`action.yml` runs the tracked `dist/action.js`, not an npm download. After CLI/core source or runtime dependency changes, run `pnpm build` and include the resulting bundle changes. `pnpm build:action` alone assumes the core build is already current.

Run the CLI tests after regeneration. Review generated changes alongside their source; a source-only fix does not update the bundle consumed by a pinned action.

### 🌿 Branch Naming

We enforce strict branch naming via CI. Please use the following format:
`type/description` (e.g., `feat/add-new-validator`)

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `maintenance`.

### 🧪 Testing, Linting & Maintenance

Before pushing, please ensure your changes pass our quality checks:

```bash
# Run tests across all workspace packages
pnpm test

# Run tests with coverage reports
pnpm test:cov

# Run code style and static analysis
pnpm lint
pnpm format:check

# Clean all build outputs and caches across packages
pnpm clean
```

### 💬 Commit Messages & Changesets

- **Conventional Commits**: Format your commit messages as:
  `type(scope): description`
- **Changesets (for library changes)**:
  If your PR introduces consumer-facing fixes, features, or breaking changes to `@chitrank2050/git-hygiene` or `@chitrank2050/git-hygiene-core`, please include a changeset:

  ```bash
  pnpm changeset
  ```

  Follow the interactive CLI to choose the bump type (`patch`, `minor`, `major`) and add a concise summary. Changes solely affecting the website (`app/`), internal CI, or documentation do not need a changeset (or can use `pnpm changeset --empty`).

## Pull Request Process

1. **Link an Issue**: Every PR should ideally address an existing issue.
2. **Keep it Focused**: Small, surgical PRs are much easier to review and merge.
3. **Automated Feedback**: Our CI jobs will automatically validate your branch name, PR title, and commit history.
4. **Approval**: Once the CI passes, a maintainer will review your code.

## Release Process 🚀

Release finalization validates the tag against all package versions and the checked-out commit before publishing. npm credentials must be configured; missing credentials fail rather than silently skipping npm.

The workflow builds one release candidate, checks that the committed action bundle is current, tests packed npm tarballs in a clean consumer, and runs a type-checked JSR workspace dry run. The tarballs, action bundle, and checksum manifest receive build attestations and are uploaded as one immutable workflow artifact. npm and JSR then publish independently in parallel. The public GitHub Release is created only after both registries contain the expected version.

For local validation, run `node --test scripts/tests/release-artifacts.test.mjs`, build both packages, then run `node scripts/release-artifacts.mjs pack` with a fresh `RELEASE_ARTIFACTS` directory. Run `deno publish --dry-run --allow-slow-types` for JSR (add `--allow-dirty` only for local uncommitted work). Never remove type checking to make a release pass. Slow types remain explicitly allowed because of the existing preset API.

> [!IMPORTANT]
> Publishing across npm, JSR, and GitHub is not atomic. Use **Re-run failed jobs** for an immediate retry. For later recovery, manually dispatch **Release 2 - Finalize Tag** with the existing `vX.Y.Z` tag and select `npm`, `jsr`, or `github-release`. npm accepts an existing version only when its normalized unpacked contents match the prepared tarball. Existing JSR versions are skipped because registry versions are immutable. Tag conflicts and conflicting GitHub Release assets stop the workflow; nothing is overwritten silently.

Existing JSR versions are accepted only after their published file checksums match the tagged source. Registry lookup failures stop publishing; only a confirmed absent version permits a publish attempt. Preparation runs on main, rejects unconsumed changesets and version downgrades, and rebuilds the committed action bundle after version changes.

JSR provenance is required for normal releases. `disabled-for-recovery` is an explicit manual-only escape hatch for a confirmed upstream provenance outage; it must not be selected to bypass package validation or type checking.

We use an automated monorepo release flow powered by **Changesets** and **git-cliff**:

1. **Preparation**: Trigger the **Release 1 - Prepare PR** action on `main`. It consumes pending `.changeset/*.md` files, synchronizes package and JSR versions, and updates `CHANGELOG.md`.
2. **Review**: Review the generated release PR (`chore/release-vX.Y.Z`).
3. **Finalization**: Merging a qualifying release PR triggers **Release 2 - Finalize Tag**. The workflow builds and attests one candidate, anchors its tag, publishes npm and JSR in parallel, verifies both registries, and creates the GitHub Release. Consult the workflow before running a release; a build passing locally does not verify registry credentials or publication.

CLI and core form a fixed version group in `.changeset/config.json`; `app` is private and ignored. Each published package keeps its own README. The root README introduces the repository and action; the app README covers website development.

## Need Help?

If you have questions, feel free to open a **GitHub Discussion**!

Happy coding! 🚀✨
