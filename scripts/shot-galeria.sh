#!/bin/bash
# Captura específicamente la GALERÍA DE DISEÑOS (y=1899..4965)
agent-browser set viewport 1440 900
agent-browser open "https://tienda.blackboxperu.com" > /dev/null
agent-browser wait --load networkidle > /dev/null || true
agent-browser wait 3000 > /dev/null
agent-browser eval "const b=[...document.querySelectorAll('button')].find(x=>/Aceptar todas/i.test(x.textContent||'')); if(b)b.click(); 'ok'" > /dev/null || true
agent-browser wait 600 > /dev/null
for y in 1900 2750 3600 4450; do
  agent-browser eval "scrollTo(0,$y); 'ok'" > /dev/null
  agent-browser wait 900 > /dev/null
  agent-browser screenshot "/home/z/my-project/download/prod-galeria-y$y.png" && echo "OK y$y"
done
agent-browser close > /dev/null || true
echo "Listo."
