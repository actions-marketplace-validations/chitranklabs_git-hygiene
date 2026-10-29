# Changelog

All notable changes to this project will be documented in this file.

## [0.5.1] - 2026-09-10

### Bug Fixes

- **security:** Harden workflow permissions and release changelog ([d889eb2](https://github.com/chitranklabs/git-hygiene/commit/d889eb228c8b13dfec9d7bc177f9c5f2bfb4fcaa))

### Refactor

- Modernize action execution, improve release workflow, and enhance artifact handling ([c65bffd](https://github.com/chitranklabs/git-hygiene/commit/c65bffd0e1ac9531527a3db4523103f3eb579529))

## [0.5.0] - 2026-09-08

### Features

- Standalone bundle action and added changeset for better version management ([4daf031](https://github.com/chitranklabs/git-hygiene/commit/4daf031b302a39fa8dd64df07d8c800012226533))
- Add Deno setup to release-prepare workflow ([644a57c](https://github.com/chitranklabs/git-hygiene/commit/644a57c3a0335988424a3d787e201ca5841e5190))

### Bug Fixes

- **deps:** Update commitlint monorepo to v21 ([65f0bda](https://github.com/chitranklabs/git-hygiene/commit/65f0bdae6d6502154b2cb59d991cafba33eba287))
- **core:** Correct breaking change with scope regex order ([8e09e10](https://github.com/chitranklabs/git-hygiene/commit/8e09e1063bdb554e0354902a0f8a5311014d72ac))
- **core:** Use nullish coalescing to respect explicit zero values ([444a0ef](https://github.com/chitranklabs/git-hygiene/commit/444a0ef08d5ca6bbc9bc320812bf633107cc6df9))
- **core:** Escape regex special characters in user-supplied types and branches ([1286ad4](https://github.com/chitranklabs/git-hygiene/commit/1286ad46c9da26a9b3bac1fec72f2ddddd34e4c6))
- **core:** Null-guard report.errors and wrap preset load errors ([8a16df6](https://github.com/chitranklabs/git-hygiene/commit/8a16df64276574a86825fa8859e7cf01d0bcca70))
- **build:** Remove wrong entry from root tsup config and correct target ([795658f](https://github.com/chitranklabs/git-hygiene/commit/795658f5b767aed3c6023783b18f25a4ab8efaa1))
- **turbo:** Add inputs to lint/format tasks and globalDependencies for root configs ([2f317e3](https://github.com/chitranklabs/git-hygiene/commit/2f317e3907f2c4f0f0f17cc9dfa028244d87ee4f))
- **hooks:** Make gitleaks hook optional like zizmor ([d5d50e6](https://github.com/chitranklabs/git-hygiene/commit/d5d50e66cf0c21d1c0b030cfe3c04bc5ffc36632))
- **scripts:** Set -euo pipefail, fix unquoted command array, remove hardcoded username ([10992fe](https://github.com/chitranklabs/git-hygiene/commit/10992fed10b73e06b430c0bbdec432c7ba6b0afa))
- **deps:** Update dependency conventional-changelog-preset-loader to v6 ([36307ee](https://github.com/chitranklabs/git-hygiene/commit/36307ee80a96132385ecc21dfc86adad20598e48))
- **deps:** Update dependency conventional-recommended-bump to v12 ([cbc5706](https://github.com/chitranklabs/git-hygiene/commit/cbc57068b75c81af5c81717dcd3900c89cc29c04))
- **deps:** Update dependency conventional-changelog-conventionalcommits to v10 ([603bf1f](https://github.com/chitranklabs/git-hygiene/commit/603bf1fd525ff4dce6602db2fe4dd990b3f68516))
- **ci:** Build core before creating release commit ([386980d](https://github.com/chitranklabs/git-hygiene/commit/386980d2081aee603ed952b6677b2be4aec351f2))
- **pipeline:** Update publishing pipeline and published artifacts ([ffbaf4a](https://github.com/chitranklabs/git-hygiene/commit/ffbaf4a3c2d8fbf77006f79df5bb8a21fc404d75))

### Refactor

- Move pnpm dependency overrides from package.json to pnpm-workspace.yaml ([7dbc54c](https://github.com/chitranklabs/git-hygiene/commit/7dbc54cd500d0beff77ab33f4edbd5e180701c9b))

### Documentation

- Fix punctuation in README release documentation ([e9f916c](https://github.com/chitranklabs/git-hygiene/commit/e9f916c7cea867deae32f0a971e39c562f7e239d))
- Overhaul documentation ([c416e23](https://github.com/chitranklabs/git-hygiene/commit/c416e2329d50361464bd3c8fca478c7bb25ef946))

### Maintenance

- Update Readme.md ([ac35b61](https://github.com/chitranklabs/git-hygiene/commit/ac35b61a250e3b8804c8fe58d38b35528afb8ae3))
- Update renovate schedule and add vulnerability alert configuration ([8b6fd3d](https://github.com/chitranklabs/git-hygiene/commit/8b6fd3db2aea73a5c51a9095a5924c3d72baa5ea))
- Update scorecard workflow to fetch full history and add repository token ([01a3bbe](https://github.com/chitranklabs/git-hygiene/commit/01a3bbe061ebc6700692ed83e3084e9b284b4b2b))
- Update dependencies in package.json and pnpm-lock.yaml ([b8e9f48](https://github.com/chitranklabs/git-hygiene/commit/b8e9f48742e217e04cbcea6fa801e725c3071ac3))
- Update pnpm version to 11.9.0 and migrate to allowBuilds configuration ([5939521](https://github.com/chitranklabs/git-hygiene/commit/5939521792213f69de4cf32cdb575ab6342fbe78))
- Migrate RELEASE_ARTIFACTS environment variable definition to dynamic step configuration ([a6c45aa](https://github.com/chitranklabs/git-hygiene/commit/a6c45aa71e022039b6231c4987f8cfbc5d8d8589))

## [0.4.12] - 2026-04-28

### Features

- Update project documentation and expand build artifact attestation scope ([f0c9969](https://github.com/chitranklabs/git-hygiene/commit/f0c99694b432520ba067dbad9db4808549920bc6))
- Default to conventionalcommits preset when no configuration is provided ([6a2143f](https://github.com/chitranklabs/git-hygiene/commit/6a2143f793f53dc74f9f5984b092c59dce391dc4))

### Refactor

- Remove redundant deps installation & build steps from release workflow & update CI header ([78ec8a7](https://github.com/chitranklabs/git-hygiene/commit/78ec8a74b995774dce979188c178c3716ea76a25))

## [0.4.11] - 2026-04-27

### Documentation

- Update project READMEs with ecosystem tables and support links ([11199ec](https://github.com/chitranklabs/git-hygiene/commit/11199ecf00f1c6316093d24675701ebead64d5d5))
- Clean up spacing and remove redundant package badges in README files ([e32729b](https://github.com/chitranklabs/git-hygiene/commit/e32729b95193cd70ea3dd51507dc006fdbb1248d))

### Maintenance

- Update Ko-fi support links to use visual badges across README files ([38b975d](https://github.com/chitranklabs/git-hygiene/commit/38b975df2181d39a4ad7feca2838ab568c25459b))

## [0.4.10] - 2026-04-27

### Documentation

- Update supported version range and add workflow auditing to security practices ([e993cc0](https://github.com/chitranklabs/git-hygiene/commit/e993cc037181e1ce7ce6df3f14f303ed3519c65e))

### Maintenance

- Update documentation, JSR integration, and dependency requirements for Node.js 24 and pnpm 10 ([58c62db](https://github.com/chitranklabs/git-hygiene/commit/58c62db79a08b3776fb8dfc069be3baa69631cb5))
- Add MIT license files and update relative documentation links in packages ([02927ca](https://github.com/chitranklabs/git-hygiene/commit/02927caab4edcdeb401bf09a13179df0f2b15cbf))
- Move NPM publish step before JSR publish in release workflow ([b961e37](https://github.com/chitranklabs/git-hygiene/commit/b961e3730cf4edfdea81adcd53929db87e6ea2b5))

## [0.4.9] - 2026-04-27

### Refactor

- Remove core pkg dep from package.json in favor of jsr.json imports during release/publish ([12b65d9](https://github.com/chitranklabs/git-hygiene/commit/12b65d9a6d40040bb26e2d336443a242b6a4b75f))

## [0.4.8] - 2026-04-27

### Maintenance

- Bump version to 0.4.6 and enable auto nodeModulesDir in JSR configuration ([cc56132](https://github.com/chitranklabs/git-hygiene/commit/cc561324e45304d16c74e9c043e89b8ff5158550))

## [0.4.6] - 2026-04-27

### Features

- Add commitlint dependencies to core and introduce JSR local publication script ([0611eba](https://github.com/chitranklabs/git-hygiene/commit/0611eba3c6cd236d2e18e0ce27e20a8f737931ec))

### Refactor

- Remove unnecessary unstable deno publish flags from workflow and script ([c082717](https://github.com/chitranklabs/git-hygiene/commit/c0827170905eeb81b2b840b81ac97a7eee570078))

## [0.4.4] - 2026-04-27

### Features

- Sync CLI imports to JSR registry in release workflow ([ee76e83](https://github.com/chitranklabs/git-hygiene/commit/ee76e83cc1d4fe7f938a3370e6fba131ccb2248b))

## [0.4.3] - 2026-04-27

### Maintenance

- Fix jsr publish flags and metadata ([b86fdcc](https://github.com/chitranklabs/git-hygiene/commit/b86fdcca99138e764ee3a94a5299fb3867eca54f))

## [0.4.0] - 2026-04-27

### Features

- Update jsr.json version and add dry-run step to release workflow ([60311e6](https://github.com/chitranklabs/git-hygiene/commit/60311e6fb4247a8586ba7868ae9adc59668d183c))
- Add scoped binary name to cli and reformat jsr exclude lists ([d60a1d8](https://github.com/chitranklabs/git-hygiene/commit/d60a1d858523a07e0a26392f39de710ac82974a1))
- Update package exclusion rules ([f644133](https://github.com/chitranklabs/git-hygiene/commit/f644133934d51e09b171c9da5298520b8075b70f))

### Bug Fixes

- Implement fallback authentication mechanism for tag pushing in release workflow ([0641d3e](https://github.com/chitranklabs/git-hygiene/commit/0641d3e2a5200a8daf171cb8e211e18e087c29c9))

### Refactor

- Optimize JSR compatibility by isolating dynamic imports & streamlining CI/publish scripts ([67da4c8](https://github.com/chitranklabs/git-hygiene/commit/67da4c861783d4f5605ff3cbc2e1154d2077ee01))

### Maintenance

- Migrate JSR release process from npx to Deno CLI ([72f60f7](https://github.com/chitranklabs/git-hygiene/commit/72f60f7c23caf5c188b7adbd2d9aba694fb88ce8))
- Update JSR config with refined publish excludes & explicit package paths for release workflow ([2fd9650](https://github.com/chitranklabs/git-hygiene/commit/2fd9650fa52289074afb0a8c727b369fd0baa0ea))

## [0.3.1] - 2026-04-27

### Documentation

- Add security badges and update action usage examples with latest release SHA ([362c615](https://github.com/chitranklabs/git-hygiene/commit/362c61509fcf38d74ae13c2cdeb8c22d9ab7e652))
- Update package descriptions to clarify ESM support, runtime requirements and dependency status ([599ae6b](https://github.com/chitranklabs/git-hygiene/commit/599ae6b820dd681e10789afa7691ba37268efce0))

## [0.2.0] - 2026-04-27

### Features

- Added support for extends and custom rules configuration ([47b5c78](https://github.com/chitranklabs/git-hygiene/commit/47b5c78065acbbd5231945c0d0ef81d832a07eef))
- Implement configuration extensibility and commitlint parser preset support ([bc57c75](https://github.com/chitranklabs/git-hygiene/commit/bc57c75916a80f40d0d8eeeaa4b43ffeca16aded))
- Add support for extends and custom rules configuration in documentation ([e2ef5cf](https://github.com/chitranklabs/git-hygiene/commit/e2ef5cf40d236bca4a66f65f8467625b9ed2629c))
- Add bump command to suggest semantic versioning based on commit history ([21413ae](https://github.com/chitranklabs/git-hygiene/commit/21413aebff1f90ae0b4e082b88edb2aea5c5dc56))
- Add --json CLI flag and support for configuration validation ([f1567b3](https://github.com/chitranklabs/git-hygiene/commit/f1567b3388370e3e6726fa7f16bebbea7f3f8285))
- Integrate version bumping into release flow and add commit linting script ([e6c99db](https://github.com/chitranklabs/git-hygiene/commit/e6c99db280d0c015c01c5714ee6c5d0b455ed71d))
- Introduce zero-config Omni-Mode to auto validate PR metadata & calculate version bumps ([1dd140c](https://github.com/chitranklabs/git-hygiene/commit/1dd140c24493105aaf4172a85827697774ff638e))
- Granularize CI checks and automate release versioning using git-hygiene recommendations ([736402f](https://github.com/chitranklabs/git-hygiene/commit/736402f10418e57b33c3ca22d58902439894c2b6))
- Integrate Gitleaks installation into release preparation workflow and configure in lefthook ([31cb24f](https://github.com/chitranklabs/git-hygiene/commit/31cb24f9120ab7a57cfdf04778d85cf50ff41dd9))
- Export releaseType and reason as action outputs ([b1af537](https://github.com/chitranklabs/git-hygiene/commit/b1af537a72d221181f31f6f4fa19ce54bd5a2017))

### Bug Fixes

- Restrict package.json to essential fields before JSR publication to prevent parser errors ([9bb73cf](https://github.com/chitranklabs/git-hygiene/commit/9bb73cfb94ea79c621a9641d6a9565aeaf5ec3f9))

### Refactor

- Make config loading and validation async to support dynamic preset resolution ([84ca6bf](https://github.com/chitranklabs/git-hygiene/commit/84ca6bf6bca724ec3a59c1947fe07a29de527afc))
- Improve type safety, add support for function-based parser presets & update documentation ([8df2e95](https://github.com/chitranklabs/git-hygiene/commit/8df2e95115e192aae091fdec2b1995d754a397e6))
- Improve tag extraction logic to support both workflow inputs and branch naming conventions ([ca57cab](https://github.com/chitranklabs/git-hygiene/commit/ca57cab37cefa39f9546cd9159c9f1a45da9c756))
- Migrate from CommonJS require to ESM dynamic imports & refine JSR package publishing logic ([100b8a5](https://github.com/chitranklabs/git-hygiene/commit/100b8a5095b520ecb74235ac4ee0dff02398e3f6))

### Documentation

- Add GitHub Marketplace action badge and registry link to README ([2555faa](https://github.com/chitranklabs/git-hygiene/commit/2555faa0a9512380c5516faf804073d0b71596a4))
- Update documentation for JSON output support and programmatic configuration usage ([221177a](https://github.com/chitranklabs/git-hygiene/commit/221177aa434cfd29528a9bdcbe22f4fe1d495f4d))
- Add automated release process documentation to CONTRIBUTING.md and README.md ([c3e2549](https://github.com/chitranklabs/git-hygiene/commit/c3e254945ebc927158f4d6401550c0eab5836edd))

### Maintenance

- Update lefthook configuration to improve git hook execution ([5c0f4ad](https://github.com/chitranklabs/git-hygiene/commit/5c0f4adc48f44c8156f628fe6acdcc796c0bb03a))
- Strip scripts and update core dependency version in package.json before JSR publication ([bc2e9d5](https://github.com/chitranklabs/git-hygiene/commit/bc2e9d5202c6abd1594758810dbdb382dbed6c7c))
- Reorder NPM publish step after JSR publish in release workflow ([e5d52dc](https://github.com/chitranklabs/git-hygiene/commit/e5d52dcd16d45f7369cddc4365320308bcf1f363))

## [0.1.6] - 2026-04-26

### Features

- Add branding icon and color to action metadata ([5c2582d](https://github.com/chitranklabs/git-hygiene/commit/5c2582de363071757b34738875df170864f863ea))

### Maintenance

- Update permissions and add strict error handling to auto-approve workflow scripts ([34b2359](https://github.com/chitranklabs/git-hygiene/commit/34b2359d7a73290f7b484af8443312a283c4ae1a))

## [0.1.5] - 2026-04-26

### Refactor

- Remove dedicated action package and consolidate logic into the repository root ([892a890](https://github.com/chitranklabs/git-hygiene/commit/892a89054d563ee5537109f645e0a3fd31284a55))
- Consolidate PR validation logic and enable automated approval for bot-managed workflows ([5dc3bd1](https://github.com/chitranklabs/git-hygiene/commit/5dc3bd150beafaf3d91b41a5b3ffc1da8ae043e2))

### Documentation

- Reorder license section to appear at the end of README ([8ce3632](https://github.com/chitranklabs/git-hygiene/commit/8ce3632966c4496d23420c05f824adc66b379b33))
- Update badge layout and add registry comparison table to README ([9f394b4](https://github.com/chitranklabs/git-hygiene/commit/9f394b47372a102e7bfb5ce2f3a853748d5981d4))

### Maintenance

- Trim commit messages in changelog template ([54cf3de](https://github.com/chitranklabs/git-hygiene/commit/54cf3deb1fddb9773b298adbb2822a6c79daacba))
- Update changelog with v0.1.4 release and clean up formatting ([0e9a240](https://github.com/chitranklabs/git-hygiene/commit/0e9a240a308e93fda4580611b835473a65a3f13a))
- Update workflow trigger name and document GitHub Action usage in README ([d7e6038](https://github.com/chitranklabs/git-hygiene/commit/d7e60380ddbcd6728ea003c0df759b328b4999b8))

## [0.1.4] - 2026-04-26

### Maintenance

- Update JSR metadata with descriptions and publication filters ([cd4076e](https://github.com/chitranklabs/git-hygiene/commit/cd4076ec433a7d7188244575145a2674fa599cd0))
- Update JSR metadata and bump version to v0.1.3 ([8a45c23](https://github.com/chitranklabs/git-hygiene/commit/8a45c2397754d93bfc12f7f3e15bb1476f7194f7))
- Update tag pattern and standardize version formatting in release workflow ([8e8787d](https://github.com/chitranklabs/git-hygiene/commit/8e8787d76f93eb11cc5375ae39a91771acfe6db8))

## [0.1.3] - 2026-04-26

### Maintenance

- Dynamically update core package dependency versions during JSR publication ([7f44522](https://github.com/chitranklabs/git-hygiene/commit/7f44522ce8c09f6d99885ef8a9e062b6b2bb691c))

## [0.1.2] - 2026-04-26

### Features

- Add configuration for allowed commit types to package manifest files ([78e8a93](https://github.com/chitranklabs/git-hygiene/commit/78e8a931d9ad67ef50621598918156b22571e3eb))

### Refactor

- Improve PR authorization logic and add draft status validation to auto-approve workflow ([900a8f9](https://github.com/chitranklabs/git-hygiene/commit/900a8f90300bc27763e67b4d68eac16f6d2f3f1a))
- Streamline auto-approve workflow authorization, permissions, and status checks ([77ef074](https://github.com/chitranklabs/git-hygiene/commit/77ef074dd5886282059102e9fcc41e8ce48e5430))
- Replace auto-approval flow with direct auto-merge enablement in CI workflow ([4017b05](https://github.com/chitranklabs/git-hygiene/commit/4017b05832f246ba2b8b7d4e61e753d7b0ff633d))
- Replace auto-approve logic with direct auto-merge enablement in CI workflow ([874bd13](https://github.com/chitranklabs/git-hygiene/commit/874bd1300ff40e152e989d0d43c6785ce79db64b))

### Maintenance

- Add MIT license field to jsr.json files in core and cli packages ([f385a7e](https://github.com/chitranklabs/git-hygiene/commit/f385a7e6442d18f24be9a473f8e2eadaa669062a))
- Renovate config to include merge confidence, refine matching rules & group actions deps ([feab45a](https://github.com/chitranklabs/git-hygiene/commit/feab45af018de9e9e07edfbdf1b88620ead6aa36))
- Update contents permission to write in auto-approve workflow ([b0a44cc](https://github.com/chitranklabs/git-hygiene/commit/b0a44cc2d5a8f5edd848516f169ca37909aded1d))
- Update gitignore and allow dirty state in jsr publish workflow ([72d661c](https://github.com/chitranklabs/git-hygiene/commit/72d661c31a90933ff7c0b2f992dbe5f6af706b7b))
- Update maxHeaderLength to 100 in constants and remove redundant config from package.json ([b1a838a](https://github.com/chitranklabs/git-hygiene/commit/b1a838ae59c30d46bd8316d5bf1baf2eb693e791))
- Increase default maxHeaderLength from 72 to 100 across documentation and config ([ae99ac9](https://github.com/chitranklabs/git-hygiene/commit/ae99ac9d9b6306a723e14c8beb25350d5ba4ac24))
- Update release workflow to sync versioning for both NPM and JSR packages ([047f4d8](https://github.com/chitranklabs/git-hygiene/commit/047f4d8ae50751d6ff36b1867e65b9713056f51e))

## [0.1.1] - 2026-04-26

### Features

- Expose detailed validation errors in engine & update docs with configuration references ([98c776b](https://github.com/chitranklabs/git-hygiene/commit/98c776bf0e5606ae1cd78d4aaddadd21bc6e7fae))

### Documentation

- Add OpenSSF Scorecard badge to README ([d9b342e](https://github.com/chitranklabs/git-hygiene/commit/d9b342e9181c9d1fb33bc28300d602e397cae16b))
- Enhance project doc with badges & improved formatting while setting action pkg to private ([acd0a25](https://github.com/chitranklabs/git-hygiene/commit/acd0a2521b73cce60c2269adbfc6855f41e28522))
- Add repository structure to CONTRIBUTING.md and clean up redundant engine test assertion ([a40917f](https://github.com/chitranklabs/git-hygiene/commit/a40917fb98bb2e8eceed9d7f5a1ecc58e56f2a24))
- Add input table to README and migrate Gitleaks scan to official GitHub Action ([858f6c4](https://github.com/chitranklabs/git-hygiene/commit/858f6c41df7f11b062ed7b61e4e3514726b38601))

## [0.1.0] - 2026-04-26

### Features

- Initialize git-hygiene project with configuration and tooling ([9c773c6](https://github.com/chitranklabs/git-hygiene/commit/9c773c651c5497b58c6173d71da4fd57dec618b1))
- Configure Lefthook git hooks and enable experimental TypeScript execution for tests and CLI commands ([67f0607](https://github.com/chitranklabs/git-hygiene/commit/67f0607d2985166c10beb72acfdbdea5b6856143))
- Implement configurable project settings with dynamic validation rules ([5333e5a](https://github.com/chitranklabs/git-hygiene/commit/5333e5a888e218c48fcfabfc9228ad9b9c85ec83))
- Add configurable commit linting rules for length, casing, scope, and subject punctuation ([384034f](https://github.com/chitranklabs/git-hygiene/commit/384034fb6789fec1673773b4d66a65cb4e67423b))
- Implement automated PR labeler with custom bot token setup action ([807ee66](https://github.com/chitranklabs/git-hygiene/commit/807ee664ba986816726d92f00ceecac39080938a))
- Add stale issue management and workflow security linting automation ([b50dbe3](https://github.com/chitranklabs/git-hygiene/commit/b50dbe37ea51f6e514b5ec93529464455c7c74cd))
- Add OpenSSF Scorecard workflow for security health analysis ([f62c301](https://github.com/chitranklabs/git-hygiene/commit/f62c3011380f2df5d53c758fc14c77b2f42d987f))
- Configure smart exemption rules for stale issues and pull requests ([fe255a3](https://github.com/chitranklabs/git-hygiene/commit/fe255a3449f2d1ec291b590df73fea2b4c8a1104))
- Add CI and automated PR approval workflows ([e133d57](https://github.com/chitranklabs/git-hygiene/commit/e133d57482ad6956e1717abb6ee516212ae50c84))
- Add automated release scripts for changelog gen & version tag with shared logging utility ([6a30972](https://github.com/chitranklabs/git-hygiene/commit/6a309724ada551e5381d67b497a09fcdb4e13998))
- Add auto PR desc gen and optimize CI workflows with path filtering & concurrent job exec ([40b4b1b](https://github.com/chitranklabs/git-hygiene/commit/40b4b1bad8bb14760d22dc2af64e400923751e7f))
- Add weekly workflow to prune redundant pnpm dependency overrides ([859ba86](https://github.com/chitranklabs/git-hygiene/commit/859ba86e28ed7945aa23c0c720544411445fb89e))
- Add automated release preparation and finalization workflows ([9a2f11c](https://github.com/chitranklabs/git-hygiene/commit/9a2f11c24bc212832b7e2d51345a4a5466ec5273))
- Add PR hygiene workflow and update JSR publishing to use OIDC authentication ([ff57d6b](https://github.com/chitranklabs/git-hygiene/commit/ff57d6bd5cd6ffb9ebbf0797c50f603678ebc6d4))
- Enhance CI/CD security by adding gitleaks & zizmor lint to lefthook and updating action deps ([3239d1b](https://github.com/chitranklabs/git-hygiene/commit/3239d1b089780eaf704127a6064eebd35110ce07))
- Branch validation for specific args & improve cov report generation by ensuring dir existence ([0e45da4](https://github.com/chitranklabs/git-hygiene/commit/0e45da4aabf2fdba1f9752d6c8b6bc3667546f6d))
- Add workflow_dispatch trigger to release-finalize & optimize dep install with --prefer-offline ([4719c57](https://github.com/chitranklabs/git-hygiene/commit/4719c571805c1fb15f642e5d14835d024bbb927b))

### Bug Fixes

- Correct Gitleaks GITHUB_TOKEN environment variable configuration ([1b9bef6](https://github.com/chitranklabs/git-hygiene/commit/1b9bef6100d023909b67cf86d95680dc4d8766b8))
- Remove environment variables from Scorecard workflow to comply with security restrictions ([406f55d](https://github.com/chitranklabs/git-hygiene/commit/406f55debe2d2314dccdc971c2df064f4ca70731))
- Allow optional 'v' prefix in branch names and normalize tag format in release workflow ([f72234e](https://github.com/chitranklabs/git-hygiene/commit/f72234e0a41ad5dcbb67caf9d3ee60eac3efc7f4))

### Refactor

- Migrate to monorepo structure with turbo, adding core engine, cli, and github action packages ([af1219a](https://github.com/chitranklabs/git-hygiene/commit/af1219a726fea1408a5b8fec947fd3dd6969d21f))
- Update CI pipeline to use granular file filtering and conditional job execution ([8f70154](https://github.com/chitranklabs/git-hygiene/commit/8f70154dd5c4ba5a8ad5f0084a0131885aa69565))
- Enforce granular workflow permissions and add timeout limits across all CI actions ([4cb11a3](https://github.com/chitranklabs/git-hygiene/commit/4cb11a3c072608f6ad8fcd6e34504d5741eb6500))
- Remove build configuration and dependencies from action package ([c3c26a4](https://github.com/chitranklabs/git-hygiene/commit/c3c26a43461648ca33f99bd4b1bf195b9219f884))

### Documentation

- Overhaul README with updated features, installation instructions, and project architecture details ([6358d3c](https://github.com/chitranklabs/git-hygiene/commit/6358d3cfad10661569fde87592a6bb6c743b7f68))
- Overhaul README with enhanced feat list, installation examples & architectural documentation ([8d09a18](https://github.com/chitranklabs/git-hygiene/commit/8d09a189de3e29f242038b4539c26af036e67428))
- Update security policy with disclosure process, add assets, and refresh README header branding ([9ace73a](https://github.com/chitranklabs/git-hygiene/commit/9ace73a5c414c95f0052759a348d8bfd60a7399a))

### Maintenance

- Add jsr.json configuration files to packages and update lockfile ([b3b07bd](https://github.com/chitranklabs/git-hygiene/commit/b3b07bd8b057a91133820f05117d98bb1e204e91))
- Update dependencies and bump node types to 25.6.0 ([14e84b1](https://github.com/chitranklabs/git-hygiene/commit/14e84b13e0c6804cf2e2a3bbdb3a94db11211919))
- Ignore .turbo directory, update lockfile, and fix engine import extension ([dcfcced](https://github.com/chitranklabs/git-hygiene/commit/dcfccedca8265ade39c9b1fa8cc67f0c44a902e5))
- Update turbo cache artifacts and build metadata ([e058900](https://github.com/chitranklabs/git-hygiene/commit/e0589006e663df930d42ba1a71d9b17e1a9b306c))
- Upgrade linting stack, refine types, and update git hooks and tooling scripts ([158bb1f](https://github.com/chitranklabs/git-hygiene/commit/158bb1f4f3f618721278448750d42f174368525b))
- Add lefthook install script and update development dependencies ([e002f7e](https://github.com/chitranklabs/git-hygiene/commit/e002f7ec8324f415849747ccea57ec8a30da2194))
- Git-cliff for automated changelog gen & update lefthook config ([d6f2cd8](https://github.com/chitranklabs/git-hygiene/commit/d6f2cd85f64504a3098373ae406e1b8ee62e77a4))
- Remove explicit pnpm version from ci workflow ([5543a9b](https://github.com/chitranklabs/git-hygiene/commit/5543a9baabd07e6182b81b2b45e3452490f60366))
- Remove git-cliff dependency from package.json and lockfile ([c200eb7](https://github.com/chitranklabs/git-hygiene/commit/c200eb7774b28bccea79da33827f1e5c15ffa987))
- Scope migration to @chitrank2050 and standardize package configurations ([866fc96](https://github.com/chitranklabs/git-hygiene/commit/866fc9637ea3ab9558f39de92073063714a0fc0c))
- Pin checkout and labeler actions to specific commit hashes ([e4a13cd](https://github.com/chitranklabs/git-hygiene/commit/e4a13cd2165ab670932e157c1e398f6525ff3318))
- Upgrade pnpm setup action and migrate package scope to @chitrank2050 ([bf0b9cb](https://github.com/chitranklabs/git-hygiene/commit/bf0b9cbb6d7454b636d3328c9821e0f4f738030f))
- Integrate markdownlint, refactor CI scripts, and update Gitleaks action ([8c58511](https://github.com/chitranklabs/git-hygiene/commit/8c5851128220d49198dc40a9f3b333138403cae5))
- Update lefthook configuration hooks ([6ec27a8](https://github.com/chitranklabs/git-hygiene/commit/6ec27a85ac69aec4aa516703c90f81cebfe84672))
- Upgrade markdownlint-cli to v0.48.0 ([0c02a89](https://github.com/chitranklabs/git-hygiene/commit/0c02a8986d2ce5aadb7cb27f2600623f3782fb81))
- Update Scorecard workflow configuration and add security policy document ([13a7e2b](https://github.com/chitranklabs/git-hygiene/commit/13a7e2bc9a734dad0e9330a63214c5446a2435fa))
- Replace gitleaks-action with direct binary installation in CI workflow ([a2594e4](https://github.com/chitranklabs/git-hygiene/commit/a2594e4ed8b5a14d97bc7b23b830ef69de904084))
- Update pkg naming, add README documentation & enable platform automerge in Renovate config ([4731fcb](https://github.com/chitranklabs/git-hygiene/commit/4731fcb33cf71234750ac8efc2bd2745dbb06833))
- Add project governance, community documentation, issue templates, and test coverage scripts ([8ccc044](https://github.com/chitranklabs/git-hygiene/commit/8ccc044ef5ab4219c907c882bfdd119cc7367955))
- Update release workflow permissions and add version field to package.json ([dfcf099](https://github.com/chitranklabs/git-hygiene/commit/dfcf099ff1ba9f2dcaa48a4fd16d243234cc349b))
- Update release PR title format and optimize CI coverage upload condition ([1f02eb8](https://github.com/chitranklabs/git-hygiene/commit/1f02eb8259671b8c01ab0d5063e8e8d77700b026))
- Add rocket emoji to release pull request title ([fef1a64](https://github.com/chitranklabs/git-hygiene/commit/fef1a64af80b3411483b96de290c7a338d16144d))
- Update changelog template to link github users and add remote repository configuration ([ef71397](https://github.com/chitranklabs/git-hygiene/commit/ef713972906a0a6c47add22d721653cc17de719e))

<!-- generated by git-cliff -->
