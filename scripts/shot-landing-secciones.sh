#!/bin/bash
# Recorre la landing sección por sección (activa animaciones de scroll) y captura
agent-browser set viewport 1440 900
agent-browser open "https://tienda.blackboxperu.com" > /dev/null
agent-browser wait --load networkidle > /dev/null || true
agent-browser wait 3000 > /dev/null
# quitar SOLO el banner de cookies (botón aceptar, no removiendo wrappers)
agent-browser eval "const b=[...document.querySelectorAll('button')].find(x=>/Aceptar todas/i.test(x.textContent||'')); if(b)b.click(); 'ok'" > /dev/null || true
agent-browser wait 600 > /dev/null
# localizar la sección de plantillas y su posición
echo "=== Posición de secciones con posible galería:"
agent-browser eval "Array.from(document.querySelectorAll('section')).map((s,i)=>{const t=(s.innerText||'').slice(0,60).replace(/\n/g,' ');return i+': y='+Math.round(s.getBoundingClientRect().top+scrollY)+' | '+t}).join('\n')"
echo ""
# scroll progresivo hasta la galería: bajar por bloques para activar reveals
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  agent-browser eval "scrollBy(0,850); 'ok'" > /dev/null
  agent-browser wait 650 > /dev/null
done
agent-browser screenshot /home/z/my-project/download/prod-seccion-A.png && echo "OK A"
agent-browser eval "scrollBy(0,850); 'ok'" > /dev/null; agent-browser wait 650 > /dev/null
agent-browser screenshot /home/z/my-project/download/prod-seccion-B.png && echo "OK B"
agent-browser eval "scrollBy(0,850); 'ok'" > /dev/null; agent-browser wait 650 > /dev/null
agent-browser screenshot /home/z/my-project/download/prod-seccion-C.png && echo "OK C"
agent-browser eval "scrollBy(0,850); 'ok'" > /dev/null; agent-browser wait 650 > /dev/null
agent-browser screenshot /home/z/my-project/download/prod-seccion-D.png && echo "OK D"
agent-browser close > /dev/null || true
echo "Listo."
