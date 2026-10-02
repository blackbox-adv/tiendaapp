#!/bin/bash
# Captura páginas de referencia reales (Venngage, Canva, Squarespace)
set -e
DIR=/home/z/my-project/download/ejemplos-landing/referencias
agent-browser set viewport 1440 900

cap() {
  local url="$1" out="$2"
  agent-browser open "$url" > /dev/null 2>&1 || true
  agent-browser wait --load networkidle > /dev/null 2>&1 || true
  agent-browser wait 3500 > /dev/null
  # intenta cerrar banners de cookies comunes
  agent-browser eval "document.querySelectorAll('[class*=cookie],[id*=cookie],[class*=consent],[id*=consent],[class*=Cookie],[aria-label*=cookie]').forEach(e=>e.remove()); 'ok'" > /dev/null 2>&1 || true
  agent-browser wait 800 > /dev/null
  agent-browser screenshot "$out" && echo "OK: $out" || echo "FALLO: $out"
}

cap "https://es.venngage.com/ai-tools/catalog-generator" "$DIR/ref-venngage.png"
cap "https://www.canva.com/es_es/" "$DIR/ref-canva.png"
cap "https://www.squarespace.com/templates" "$DIR/ref-squarespace.png"
agent-browser close > /dev/null || true
echo "Listo referencias."
