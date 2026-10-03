#!/bin/bash
# Captura la landing de producción: full page + sección de plantillas
set -e
OUT=/home/z/my-project/download
agent-browser set viewport 1440 900
agent-browser open "https://tienda.blackboxperu.com" > /dev/null
agent-browser wait --load networkidle > /dev/null || true
agent-browser wait 3500 > /dev/null
# cerrar banner de cookies si existe
agent-browser eval "document.querySelectorAll('[class*=cookie],[id*=cookie],[class*=consent]').forEach(e=>e.remove()); 'ok'" > /dev/null 2>&1 || true
agent-browser wait 500 > /dev/null
agent-browser screenshot --full "$OUT/produccion-landing-full.png" && echo "OK full"
# scroll a la sección de plantillas
agent-browser eval "const el=document.querySelector('#plantillas')||document.querySelectorAll('section')[1]; if(el){el.scrollIntoView();} 'ok'" > /dev/null 2>&1 || true
agent-browser wait 1200 > /dev/null
agent-browser screenshot "$OUT/produccion-galeria-1.png" && echo "OK galeria1"
agent-browser scroll down 900 > /dev/null
agent-browser wait 800 > /dev/null
agent-browser screenshot "$OUT/produccion-galeria-2.png" && echo "OK galeria2"
agent-browser close > /dev/null || true
echo "Listo."
