#!/bin/sh
# Renders card.html to the link-preview images Next.js serves for every page.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=5000 --allow-file-access-from-files \
  --screenshot="$OUT/card.png" "file://$PWD/card.html" >/dev/null 2>&1
sips -s format jpeg -s formatOptions 60 "$OUT/card.png" --out ../../src/app/opengraph-image.jpg >/dev/null
cp ../../src/app/opengraph-image.jpg ../../src/app/twitter-image.jpg
rm -rf "$OUT"
ls -la ../../src/app/opengraph-image.jpg
