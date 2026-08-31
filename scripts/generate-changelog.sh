#!/bin/bash
set -euo pipefail

# Source the logger utility
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/logger.sh"

log_header "📖 Generating Project Changelog"

# Verify git-cliff is installed
if ! command -v git-cliff &> /dev/null; then
    log_error "git-cliff is not installed. Please install it via 'brew install git-cliff'."
    exit 1
fi

log_wait "Executing git-cliff..."

# Run git-cliff with our config
if git-cliff -o CHANGELOG.md; then
    log_success "CHANGELOG.md has been successfully updated."
else
    log_error "Failed to generate changelog."
    exit 1
fi

log_header "✅ Changelog Updated Successfully"
