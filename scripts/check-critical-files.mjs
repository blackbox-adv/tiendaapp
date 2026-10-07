// ============================================================
// GUARDIÁN DE DESPLIEGUE — corre ANTES de cada build en Vercel.
// Si falta cualquier archivo crítico, el deploy FALLA y la
// versión rota NUNCA llega a producción.
//
// Contexto: /api/upload (subida de fotos) se borró 4 veces por
// sincronizaciones entre el árbol de trabajo y el repo git.
// Con este guardián eso es físicamente imposible en producción:
// sin la ruta, `npm run build` falla y Vercel mantiene la
// versión anterior funcionando.
// ============================================================

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Archivos cuya ausencia rompe funcionalidad crítica en producción
const CRITICAL_FILES = [
  // Subida de imágenes (logo onboarding, fotos de productos, popup, QR, settings)
  'src/app/api/upload/route.ts',
  // Núcleo del backend
  'src/lib/db.ts',
  'src/lib/auth.ts',
  'src/lib/plans.ts',
  'src/lib/plan-gating.ts',
  'src/lib/upload.ts',
  'prisma/schema.prisma',
  // Rutas de API críticas (login/register viven en /api/auth/route.ts)
  'src/app/api/auth/route.ts',
  'src/app/api/store-products/route.ts',
  'src/app/api/health/route.ts',
  // Front crítico
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/components/store-templates/StoreView.tsx',
];

const missing = CRITICAL_FILES.filter((f) => !existsSync(join(root, f)));

if (missing.length > 0) {
  console.error('');
  console.error('⛔ DESPLIEGUE BLOQUEADO — faltan archivos críticos:');
  for (const f of missing) console.error('   ✗ ' + f);
  console.error('');
  console.error('   No se despliega una versión rota. Restaura los archivos');
  console.error('   desde el historial git, p. ej.:');
  console.error('   git log --oneline -- <archivo>');
  console.error('   git checkout <commit-sano> -- <archivo>');
  console.error('');
  process.exit(1);
}

console.log('✅ Guardián OK: ' + CRITICAL_FILES.length + ' archivos críticos presentes.');
