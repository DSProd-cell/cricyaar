#!/bin/bash
# Build and run CricYaar on iPhone 18 Pro simulator
# Requires: Vite dev server running at localhost:3092 (npm run dev)

set -e

SIMULATOR_ID="394439E8-1C07-4E31-BFA0-DD5CB5053252"
BUNDLE_ID="com.cricyaar.app"
DERIVED_DATA="/Users/debasish/cricmate-v0/ios/DerivedData/$SIMULATOR_ID"

cd "$(dirname "$0")/ios/App"

echo "Building..."
xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination "id=$SIMULATOR_ID" \
  -derivedDataPath "$DERIVED_DATA" \
  ENABLE_USER_SCRIPT_SANDBOXING=NO \
  2>&1 | grep -E "error:|BUILD SUCCEEDED|BUILD FAILED" | grep -v "warning"

APP_PATH=$(find "$DERIVED_DATA/Build/Products/Debug-iphonesimulator" -name "App.app" -maxdepth 1)

echo "Installing and launching..."
xcrun simctl terminate "$SIMULATOR_ID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl uninstall "$SIMULATOR_ID" "$BUNDLE_ID" 2>/dev/null || true
sleep 1
xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"
xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID"
echo "Done! App launched on simulator."
