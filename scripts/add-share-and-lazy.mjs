// Codemod: en TODAS las plantillas de tienda:
//  1) <img> sin loading → añade loading="lazy" decoding="async" (rendimiento móvil)
//  2) tras cada <img> de producto (src={X.imageUrl || PRODUCT_IMG_FALLBACK})
//     inserta <ShareProductButton .../> usando la MISMA variable X en scope
//  3) añade el import si falta
// Idempotente: se puede correr varias veces sin duplicar.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/components/store-templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Template.tsx'));

let totalLazy = 0, totalShare = 0, totalImports = 0;
const detail = [];

for (const f of files) {
  const p = path.join(dir, f);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;
  const stats = { lazy: 0, share: 0, imp: 0 };

  // ── 1. lazy loading (idempotente: el atributo va pegado a <img, antes de cualquier '>') ──
  src = src.replace(/<img\b(?![^>]*?loading=)/g, () => {
    stats.lazy++;
    return '<img loading="lazy" decoding="async"';
  });

  // ── 2. botón compartir tras cada imagen de producto ──
  // Captura la variable en scope desde el propio src: {X.imageUrl || PRODUCT_IMG_FALLBACK}
  src = src.replace(
    /(<img\b[\s\S]*?src=\{(\w+)\.imageUrl \|\| PRODUCT_IMG_FALLBACK\}[\s\S]*?\/>)(?!\s*\n\s*<ShareProductButton)/g,
    (m, imgTag, varName) => {
      stats.share++;
      return `${imgTag}\n                    <ShareProductButton productName={${varName}.name} price={${varName}.price} productId={${varName}.id} slug={storeSlug} storeName={store.name} />`;
    }
  );

  // ── 3. import del componente ──
  if (stats.share > 0 && !src.includes("from './ShareProductButton'")) {
    const firstImport = src.search(/^import /m);
    if (firstImport >= 0) {
      src = src.slice(0, firstImport) + "import { ShareProductButton } from './ShareProductButton'\n" + src.slice(firstImport);
      stats.imp = 1;
    }
  }

  if (src !== before) fs.writeFileSync(p, src, 'utf8');
  totalLazy += stats.lazy; totalShare += stats.share; totalImports += stats.imp;
  detail.push(`${f}: lazy+${stats.lazy}, share+${stats.share}, import+${stats.imp}`);
}

console.log(detail.join('\n'));
console.log(`\nTOTAL: ${totalLazy} imágenes con lazy añadidas, ${totalShare} botones compartir insertados, ${totalImports} imports añadidos`);
