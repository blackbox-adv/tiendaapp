#!/bin/bash
# Task 34: regenera previews de plantillas nuevas/rediseñadas desde producción
# (mesa, sushi, cafe, bar, pop nuevas + bodega y sabor rediseñadas)
# SIN la barra fija de demo. Salida al REPO: tiendaapp/public/templates/
set -e
OUT=/home/z/my-project/tiendaapp/public/templates
agent-browser set viewport 900 1200

for id in mesa sushi cafe bar pop bodega sabor; do
  agent-browser open "https://tienda.blackboxperu.com/demo/$id" > /dev/null
  agent-browser wait --load networkidle > /dev/null || true
  agent-browser wait 3000 > /dev/null
  # aceptar cookies si aparece
  agent-browser eval "var b=document.querySelectorAll('button');for(var i=0;i<b.length;i++){if(/Aceptar todas/i.test(b[i].textContent||'')){b[i].click();break}}'ok'" > /dev/null 2>&1 || true
  agent-browser wait 500 > /dev/null
  # quitar barra fija de demo + spacers
  agent-browser eval "document.querySelectorAll('div.fixed.top-0').forEach(function(e){e.remove()});document.querySelectorAll('div').forEach(function(e){var c=String(e.className||'');if(c.indexOf('h-[76px]')>-1||c.indexOf('h-[40px]')>-1){e.remove()}});'ok'" > /dev/null 2>&1 || true
  agent-browser wait 800 > /dev/null
  agent-browser screenshot "$OUT/$id-preview.png" && echo "OK $id"
done
agent-browser close > /dev/null || true
echo "Previews Task 34 regenerados."
