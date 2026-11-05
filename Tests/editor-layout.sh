#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_DIR="$(mktemp -d /private/tmp/draft-pro-editor-test.XXXXXX)"
trap 'rm -rf "$TEST_DIR"' EXIT
xcrun clang -fobjc-arc -fblocks -mmacosx-version-min=13.0 -framework Cocoa -framework WebKit "$SCRIPT_DIR/editor-layout.m" -o "$TEST_DIR/editor-layout"
"$TEST_DIR/editor-layout" "$SCRIPT_DIR/../Resources/index.html" "$SCRIPT_DIR/editor-layout.js"
