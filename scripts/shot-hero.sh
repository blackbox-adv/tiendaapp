#!/bin/bash
# Captura el hero de la landing corregida
agent-browser set viewport 1440 900
agent-browser open "https://tienda.blackboxperu.com" > /dev/null
agent-browser wait --load networkidle > /dev/null || true
agent-browser wait 3500 > /dev/null
agent-browser eval "var b=document.querySelectorAll('button');for(var i=0;i<b.length;i++){if(/Aceptar todas/i.test(b[i].textContent||'')){b[i].click();break}}'ok'" > /dev/null 2>&1 || true
agent-browser wait 800 > /dev/null
agent-browser screenshot /home/z/my-project/download/ver-hero-corregido.png && echo "OK hero"
agent-browser close > /dev/null || true
