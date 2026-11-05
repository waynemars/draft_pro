#!/bin/bash
set -euo pipefail
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST_DIR="${1:-$(dirname "$SOURCE_DIR")}"
BUILD_DIR="${SHIYE_BUILD_DIR:-$SOURCE_DIR/.build}"
DEST_APP="$DEST_DIR/拾页.app"
STAGING_DIR="$(mktemp -d /private/tmp/shiye-build.XXXXXX)"
trap 'rm -rf "$STAGING_DIR"' EXIT
APP_PATH="$STAGING_DIR/拾页.app"
mkdir -p "$BUILD_DIR" "$APP_PATH/Contents/MacOS" "$APP_PATH/Contents/Resources"
xcrun clang -fobjc-arc -fblocks -O2 -mmacosx-version-min=13.0 -Wno-incompatible-pointer-types -framework Cocoa -framework WebKit -framework Security -lsqlite3 "$SOURCE_DIR"/Native/*.m -o "$APP_PATH/Contents/MacOS/Shiye"
cp "$SOURCE_DIR"/Resources/* "$APP_PATH/Contents/Resources/"
cat > "$APP_PATH/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>拾页</string>
<key>CFBundleDisplayName</key><string>拾页</string>
<key>CFBundleIdentifier</key><string>local.shiye.mac</string>
<key>CFBundleExecutable</key><string>Shiye</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>CFBundleShortVersionString</key><string>1.1.3</string>
<key>CFBundleVersion</key><string>8</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>13.0</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSAppTransportSecurity</key><dict><key>NSAllowsLocalNetworking</key><true/></dict>
<key>NSHumanReadableCopyright</key><string>拾页 Shiye · 本地优先的 AI 草稿本</string>
<key>CFBundleDocumentTypes</key><array><dict><key>CFBundleTypeName</key><string>文本草稿</string><key>CFBundleTypeRole</key><string>Editor</string><key>LSHandlerRank</key><string>Alternate</string><key>LSItemContentTypes</key><array><string>public.plain-text</string><string>public.json</string><string>net.daringfireball.markdown</string></array></dict></array>
</dict></plist>
PLIST
if [ -f "$SOURCE_DIR/Resources/AppIcon.icns" ]; then
    cp "$SOURCE_DIR/Resources/AppIcon.icns" "$APP_PATH/Contents/Resources/AppIcon.icns"
fi
xattr -d com.apple.FinderInfo "$APP_PATH" 2>/dev/null || true
codesign --force --deep --sign - "$APP_PATH"
codesign --verify --deep --strict "$APP_PATH"
ditto --norsrc "$APP_PATH" "$DEST_APP"
printf '构建完成：%s\n' "$DEST_APP"
