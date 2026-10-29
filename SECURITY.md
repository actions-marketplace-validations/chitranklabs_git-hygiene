# Security Policy

## Supported Versions

We only support the latest version of `git-hygiene`. Please ensure you are always running the latest version from NPM or JSR.

| Version | Supported          |
| ------- | ------------------ |
| v0.5.x  | :white_check_mark: |
| < v0.5  | :x:                |

## Reporting a Vulnerability

If you find a security vulnerability, please **do not** open a public issue. Instead, please report it to us via the following methods:

1. **GitHub Private Vulnerability Reporting**: Use the "Report a vulnerability" button in the Security tab of this repository.
2. **Email**: Contact the maintainer at `chitrank2050@gmail.com`.

### Our Process

1. **Acknowledgment**: We will acknowledge your report within 48 hours.
2. **Investigation**: We will investigate the issue and determine its severity.
3. **Disclosure**: Once a fix is ready, we will coordinate a public disclosure date with you.
4. **Credit**: We are happy to credit you for your discovery in our security advisories and changelogs.

## Security Practices

`git-hygiene` is built with a **Security-First** mindset:

- **Egress Lockdown**: CI/CD runners are restricted to known endpoints.
- **Dependency Auditing**: Automated OSV scanning on every PR.
- **Secret Scanning**: Gitleaks integrated into local hooks and CI.
- **Workflow Auditing**: Zizmor static analysis for GitHub Action security.
- **Minimal Surface**: We use the principle of least privilege for all cloud and CI tokens.
- **SHA Pinning**: All GitHub Actions are pinned to full commit SHAs.

Thank you for helping keep `git-hygiene` secure! 🛡️✨
