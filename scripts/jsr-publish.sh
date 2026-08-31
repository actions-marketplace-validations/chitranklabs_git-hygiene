#!/bin/bash
set -euo pipefail

# =============================================================
# JSR Local Test Publish Script 🦖
#
# Use this to verify your JSR configuration and "Fast Check"
# before pushing to GitHub.
#
# Usage:
#   chmod +x scripts/jsr-publish.sh
#   ./scripts/jsr-publish.sh <version> [--dry-run]
# =============================================================

VERSION=$1
DRY_RUN_FLAG="${2:-}"

if [ -z "$VERSION" ]; then
  echo "❌ Error: Version is required (e.g. 0.4.0)"
  echo "Usage: ./scripts/jsr-publish.sh <version> [--dry-run]"
  exit 1
fi

# Ensure we are in the root
cd "$(dirname "$0")/.." || exit

echo "🧐 Testing JSR publication for version $VERSION..."

# Clean version (remove 'v' prefix if present)
CLEAN_VERSION=$(echo "$VERSION" | sed 's/^v//')

# Define order: core must come before cli
PACKAGES=("packages/core" "packages/cli")

for pkg in "${PACKAGES[@]}"; do
  if [ -d "$pkg" ] && [ -f "$pkg/jsr.json" ]; then
    echo ""
    echo "--------------------------------------------------------"
    echo "📦 Preparing $pkg..."
    echo "--------------------------------------------------------"

    # 1. Update version in jsr.json
    echo "   Updating $pkg/jsr.json to $CLEAN_VERSION"
    jq ".version = \"$CLEAN_VERSION\"" "$pkg/jsr.json" > "$pkg/jsr.json.tmp" && mv "$pkg/jsr.json.tmp" "$pkg/jsr.json"

    # 2. Clean package.json (Keep only name, version, and dependencies)
    if [ -f "$pkg/package.json" ]; then
      echo "   Cleaning $pkg/package.json for JSR compatibility..."

      # Backup original package.json
      cp "$pkg/package.json" "$pkg/package.json.bak"

      if [ "$pkg" == "packages/cli" ]; then
        # Remove JSR dependencies from package.json as they are handled in jsr.json imports
        jq "{name, version, dependencies} | del(.dependencies[\"@chitrank2050/git-hygiene-core\"])" "$pkg/package.json" > "$pkg/package.json.tmp" && mv "$pkg/package.json.tmp" "$pkg/package.json"
        # Sync JSR imports
        jq ".imports[\"@chitrank2050/git-hygiene-core\"] = \"jsr:@chitrank2050/git-hygiene-core@^$CLEAN_VERSION\"" "$pkg/jsr.json" > "$pkg/jsr.json.tmp" && mv "$pkg/jsr.json.tmp" "$pkg/jsr.json"
      else
        jq "{name, version, dependencies}" "$pkg/package.json" > "$pkg/package.json.tmp" && mv "$pkg/package.json.tmp" "$pkg/package.json"
      fi
    fi

    # 3. Run publish command
    echo "   🚀 Running publish command..."
    
    # Check if deno is available, otherwise fallback to npx jsr
    if command -v deno >/dev/null 2>&1; then
      CMD_BASE=("deno" "publish")
    else
      echo "   (Deno not found, falling back to npx jsr)"
      CMD_BASE=("npx" "jsr" "publish")
    fi

    PUBLISH_CMD=("${CMD_BASE[@]}" --unstable-bare-node-builtins --no-check --allow-slow-types --allow-dirty --no-provenance)

    if [ "$DRY_RUN_FLAG" == "--dry-run" ]; then
      echo "   (Dry run mode enabled)"
      (cd "$pkg" && "${PUBLISH_CMD[@]}" --dry-run)
    else
      (cd "$pkg" && "${PUBLISH_CMD[@]}")
    fi

    # 4. Restore original package.json
    if [ -f "$pkg/package.json.bak" ]; then
      echo "   Restoring original $pkg/package.json..."
      mv "$pkg/package.json.bak" "$pkg/package.json"
    fi
  fi
done

echo ""
echo "✅ Finished testing packages."
