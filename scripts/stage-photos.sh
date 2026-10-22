#!/usr/bin/env bash
# Unpacks whatever you downloaded from Drive into photos-inbox/_staging/ so the
# images can be looked at and sorted into the per-achievement folders.
#
# Run from the repo root:  bash scripts/stage-photos.sh
#
# It takes the newest .zip in ~/Downloads whose name mentions linkedin or photos,
# or you can pass a path:  bash scripts/stage-photos.sh ~/Downloads/whatever.zip

set -u
REPO="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$REPO/photos-inbox/_staging"
mkdir -p "$STAGE"

ZIP="${1:-}"
if [ -z "$ZIP" ]; then
  ZIP=$(ls -t "$HOME"/Downloads/*.zip 2>/dev/null | grep -iE 'linkedin|photo' | head -1)
fi

if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then
  echo "FAIL  no zip found. Pass the path: bash scripts/stage-photos.sh ~/Downloads/<name>.zip"
  echo "      zips currently in ~/Downloads:"
  ls -t "$HOME"/Downloads/*.zip 2>/dev/null | head -5 || echo "      none"
  exit 1
fi

echo "using $ZIP"
unzip -o -j -q "$ZIP" -d "$STAGE" -x '__MACOSX/*' '*.DS_Store'
COUNT=$(ls -1 "$STAGE" | wc -l | tr -d ' ')
echo "PASS  $COUNT files in photos-inbox/_staging/"
ls -la "$STAGE" | head -40
echo
echo "next: tell Claude it is staged. Nothing is published until the images are"
echo "sorted into photos-inbox/<achievement>/ and npm run import:photos is run."
