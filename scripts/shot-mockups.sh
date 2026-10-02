#!/bin/bash
# Captura los 3 mockups de landing a PNG (full page)
set -e
DIR=/home/z/my-project/download/ejemplos-landing
agent-browser set viewport 1440 900

shot() {
  local file="$1" out="$2"
  agent-browser open "file://$DIR/$file" > /dev/null
  agent-browser wait --load networkidle > /dev/null || true
  agent-browser wait 3000 > /dev/null
  agent-browser screenshot --full "$out"
  echo "OK: $out"
}

shot "opcion-a-editorial.html" "$DIR/captura-opcion-a-editorial.png"
shot "opcion-b-pop.html"       "$DIR/captura-opcion-b-pop.png"
shot "opcion-c-dark.html"      "$DIR/captura-opcion-c-dark.png"
agent-browser close > /dev/null || true
echo "Listo."
