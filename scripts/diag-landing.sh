#!/bin/bash
# Diagnóstico: la landing se ve blanca en headless — revisar errores JS y contenido
agent-browser set viewport 1440 900
agent-browser open "https://tienda.blackboxperu.com" > /dev/null
agent-browser wait --load networkidle > /dev/null || true
agent-browser wait 4000 > /dev/null
echo "=== URL: $(agent-browser get url)"
echo "=== TITLE: $(agent-browser get title)"
echo "=== BODY TEXT (primeros 500 chars):"
agent-browser eval "document.body.innerText.slice(0,500).replace(/\n+/g,' | ')"
echo ""
echo "=== BODY TEXT LENGTH: $(agent-browser eval 'document.body.innerText.length')"
echo "=== SECCIONES: $(agent-browser eval 'document.querySelectorAll("section,header,nav,main").length')"
echo "=== IMGS TOTALES: $(agent-browser eval 'document.images.length')"
echo "=== IMGS ROTAS: $(agent-browser eval 'Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).length')"
echo "=== ERRORES CONSOLA:"
agent-browser errors | head -30
echo "=== SCREENSHOT SIN EVAL:"
agent-browser screenshot /home/z/my-project/download/diag-landing-sin-eval.png && echo "shot ok"
agent-browser close > /dev/null || true
