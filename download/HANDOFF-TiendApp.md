# TiendApp — Handoff Completo para Continuación

> Documento maestro para que una nueva sesión del asistente pueda continuar el trabajo
> sin perder contexto. Última actualización: 25 junio 2026.

---

## 1. QUÉ ES TIENDAPP

**TiendApp** es una plataforma SaaS peruana para que emprendedores creen su tienda online
en minutos, sin programar. Competimos contra WhatsApp Business, catálogos de Facebook e
Instagram (NO contra Shopify — somos más simples y baratos para el emprendedor pequeño).

### Caso de uso típico
- Emprendedor en Perú que vende por WhatsApp (panadería, ropa, artesanía, comida)
- Quiere verse profesional pero no puede pagar Shopify ni sabe programar
- Cobra con **Yape** y **Plin** (billeteras móviles peruanas)
- Recibe pedidos por **WhatsApp**
- No tiene tarjeta de crédito ni RUC al inicio

### URLs
- **Producción**: https://tienda.blackboxperu.com
- **Repositorio**: https://github.com/blackbox-adv/tiendaapp
- **Supabase project**: `bsshjfawtlcfshnmaawf` (org: carlosalbertoguzmansoto)

---

## 2. STACK TÉCNICO

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | Next.js 15.5.18 (App Router) | TypeScript |
| ORM | Prisma 6.11 | Schema en `prisma/schema.prisma` |
| DB | Supabase (PostgreSQL 14) | Project ref: `bsshjfawtlcfshnmaawf` |
| Auth | **JWT custom** (NO next-auth) | `src/lib/auth.ts` — `authenticateRequest()` |
| Storage | Supabase Storage | Para logos, banners, QRs |
| Email | Resend | `src/lib/email.ts` |
| Estado | Zustand | `src/lib/store.ts` — store global con persistencia |
| UI | Tailwind + shadcn/ui + Radix | Framer Motion para animaciones |
| Pagos | Manual (Yape/Plin/transferencia) | Admin aprueba manualmente, no hay gateway automático |

### ⚠️ IMPORTANTE: el build está ROTO por un archivo huérfano
- `src/app/api/auth/[...nextauth]/route.ts` importa `next-auth` pero el paquete fue
  removido en el commit `81c3641` ("migrate to custom JWT auth").
- Ese archivo es código muerto — el commit lo desinstaló pero dejó el route file.
- **Solución pendiente**: borrar ese archivo (y `src/types/next-auth.d.ts` y
  `src/lib/auth-config.ts` que también importan next-auth). NO rompe nada porque
  nada los importa.
- El usuario NO autorizó aún eliminarlo (tuvo la restricción de "no cambiar auth/stack").
  Pregúntale antes de hacerlo.

---

## 3. REGLAS CRÍTICAS DEL USUARIO

El usuario fue muy explícito sobre qué se puede y qué NO se puede tocar:

### ✅ PERMITIDO
- Cambios de copy/UI/UX en la landing
- Mejoras CRO (conversion rate optimization)
- Fix de bugs puntuales
- Migraciones SQL de seguridad (RLS, policies)
- Endpoints nuevos que no cambien los existentes
- Componentes nuevos que se integren al AppRouter

### ❌ PROHIBIDO (a menos que el usuario apruebe explícitamente)
- Cambiar la arquitectura del proyecto
- Cambiar el stack (Next.js, Prisma, Supabase, JWT)
- Mover o renombrar routes/APIs
- Modificar la lógica de auth (JWT custom en `src/lib/auth.ts`)
- Cambiar el schema de la DB sin aprobación
- Remover features existentes
- Modificar componentes del dashboard/admin sin aprobación

### Idioma
- **Siempre responder en español peruano** (mismo idioma del usuario)
- El usuario escribe en español informal peruano ("q paso", "ok", "dame el enlace")
- Las preguntas de clarificación van en español

---

## 4. ESTRUCTURA DEL PROYECTO

```
/home/z/my-project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (REST)
│   │   │   ├── stores/         # CRUD tiendas
│   │   │   ├── products/       # CRUD productos
│   │   │   ├── notifications/  # Notificaciones usuario
│   │   │   ├── admin/          # Endpoints admin (auth required)
│   │   │   ├── payments/       # Yape/Plin voucher submission
│   │   │   ├── auth/[...nextauth]/  # ⚠️ HUÉRFANO, rompe el build
│   │   │   ├── setup-db/       # Migraciones automáticas (GET)
│   │   │   │   └── security/   # Fix Supabase Security Advisor
│   │   │   └── ...
│   │   ├── store/[slug]/       # Tienda pública (SSR)
│   │   ├── demo/[template]/    # Demo de plantillas (datos locales)
│   │   ├── dashboard/          # Dashboard del usuario
│   │   ├── admin/              # Panel admin
│   │   └── ...
│   ├── components/
│   │   ├── landing/            # Hero, Features, Pricing, FAQ, HowItWorks, etc.
│   │   ├── store-templates/    # 5 plantillas: Moderna, Vibrante, Clasica, Luxury, Minimalist
│   │   ├── dashboard/          # Panel del usuario
│   │   ├── admin/              # Panel admin
│   │   ├── auth/               # Login, Register, ResetPassword
│   │   ├── wizard/             # StoreWizard (onboarding)
│   │   ├── info/               # About, Contact, Terms, Privacy
│   │   └── AppRouter.tsx       # Router principal (Zustand-driven)
│   ├── lib/
│   │   ├── auth.ts             # JWT custom (hashPassword, verifyPassword, authenticateRequest)
│   │   ├── db.ts               # Prisma client
│   │   ├── store.ts            # Zustand store global
│   │   ├── types.ts            # Tipos TypeScript
│   │   ├── validations.ts      # Schemas Zod
│   │   ├── supabase.ts         # Cliente Supabase (Storage)
│   │   ├── email.ts            # Resend
│   │   ├── api-response.ts     # Helpers CORS + apiSuccess/apiError
│   │   ├── landing-testimonials.ts  # Testimonios landing
│   │   └── env.ts              # Validación de env vars
│   └── types/next-auth.d.ts    # ⚠️ HUÉRFANO
├── prisma/
│   ├── schema.prisma           # Modelos: User, Store, StoreProduct, Plan, Subscription, Payment, Notification, AuditLog, Setting
│   └── migrations/
├── scripts/
│   ├── fix-supabase-security.sql  # Migración SQL Security Advisor
│   └── fix-tokenversion.sql       # Fix histórico
├── .env                        # SOLO tiene DATABASE_URL (local SQLite para dev)
├── .env.example                # Template con TODAS las vars que producción necesita
├── worklog.md                  # Log multi-agente (SIEMPRE leer antes de trabajar)
└── package.json
```

---

## 5. VARIABLES DE ENTORNO (producción)

El archivo `.env` local solo tiene `DATABASE_URL` (SQLite para desarrollo).
Producción (Vercel + Supabase) necesita todas estas — ver `.env.example`:

```env
DATABASE_URL=postgresql://postgres.bsshjfawtlcfshnmaawf:PASSWORD@db.bsshjfawtlcfshnmaawf.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres.bsshjfawtlcfshnmaawf:PASSWORD@db.bsshjfawtlcfshnmaawf.supabase.co:5432/postgres
SUPABASE_URL=https://bsshjfawtlcfshnmaawf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # service_role, NUNCA exponer al cliente
NEXT_PUBLIC_SUPABASE_URL=https://bsshjfawtlcfshnmaawf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # anon, SÍ puede ir al cliente
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://tienda.blackboxperu.com
JWT_SECRET=...  # generarlo con openssl rand -hex 32
```

---

## 6. GIT Y GITHUB

- **Repo**: `https://github.com/blackbox-adv/tiendaapp`
- **Branch**: `main` (no hay CI/CD, no hay branches dev)
- **Token actual (embebido en remote)**: `[REDACTED-TOKEN]`
  - ⚠️ El usuario lo compartió en chat. Si el chat se expone públicamente,
    hay que pedirle que lo revoque en https://github.com/settings/tokens
  - Para push futuro: `git push origin main` ya funciona (el token está en la URL del remote)
- **Últimos commits (orden cronológico inverso)**:
  - `f5ef329` — automático (post-push)
  - `fb6a559` — fix(demo): remove conflicting /demo/[slug] route
  - `a2e4a26` — feat(security): fix Supabase Security Advisor issues
  - `2ac7602` — feat(landing): CRO/UX improvements for Peruvian entrepreneurs
  - `dfdb59a` — (previo a esta sesión)

### Workflow git recomendado
```bash
cd /home/z/my-project
git status                # ver qué cambió
git add <archivos>        # NUNCA git add . sin revisar
git commit -m "tipo(scope): descripción corta"
git push origin main      # el token ya está en el remote
```

---

## 7. WORKLOG — LECTURA OBLIGATORIA

**Antes de hacer cualquier trabajo**, leer `/home/z/my-project/worklog.md`.
Cada agente que trabajó en el proyecto registró ahí:
- Task ID
- Qué hizo paso a paso
- Decisiones tomadas
- Artefactos producidos

**Después de terminar tu trabajo**, agregar una nueva sección al final con:
```markdown
---
Task ID: <id>
Agent: <nombre>
Task: <descripción>

Work Log:
- paso 1
- paso 2

Stage Summary:
- resultados clave
- artefactos producidos
```

---

## 8. LO ÚLTIMO QUE SE HIZO (junio 2026)

### Sesión reciente — 3 entregables

#### A) CRO/UX de la landing (commit `2ac7602`)
Mejoras de copy y trust para conversión del emprendedor peruano:
- **Hero**: ya tenía Yape/Plin en value prop + stats concretas + microcopy (no se tocó)
- **FAQ.tsx** (nuevo): 6 preguntas que resuelven dudas críticas (comisión, RUC, Yape/Plin, mobile, cancelación, tarjeta)
- **HowItWorks.tsx** (nuevo): 3 pasos (Regístrate → Arma tienda → Vende) entre Hero y Features
- **Footer**: reemplazado Twitter por WhatsApp + agregado RUC/legal info
- **Testimonials**: métricas concretas (180 pedidos, S/8k/mes, +35%, 24 vestidos, 60% online) + 6to testimonio
- **Features**: reescritas como beneficios (no specs técnicas)
- **Pricing**: CTAs diferenciados por plan + microcopy "Paga con Yape, Plin o transferencia"

#### B) Fix Supabase Security Advisor (commit `a2e4a26`)
Tres issues del Security Advisor de Supabase:
- `Notification` sin RLS (CRÍTICO) → habilitado RLS + policies DENY para anon/authenticated
- `v_store_summary` (Security Definer) → recreate con `SECURITY INVOKER` (Postgres 14 compatible)
- `v_payment_history` (Security Definer) → idem

**Endpoint**: `GET /api/setup-db/security` (admin-only, idempotente)
**SQL standalone**: `scripts/fix-supabase-security.sql`

⚠️ **El usuario ejecutó el SQL en Supabase SQL Editor** pero el primer intento falló con
`syntax error at or near "SECURITY"` (Postgres 14 no soporta `ALTER VIEW ... SECURITY INVOKER`).
Se le dio una versión alternativa con `CREATE VIEW ... WITH (security_invoker = true)` que sí funciona.
**No se confirmó si esa versión funcionó** — preguntar en la próxima sesión.

#### C) Fix demo plantillas loading infinito (commit `fb6a559`)
Bug: al hacer clic en "Vista previa" de una plantilla en el dashboard, la página se
quedaba cargando para siempre. Causa: dos rutas competían por `/demo/{id}`:
- `/demo/[template]/` (datos locales, funciona)
- `/demo/[slug]/` (fetch API, se colgaba buscando "luxury" como slug de tienda real)

Fix: borrada la ruta `[slug]` y su componente huérfano `src/components/demo/DemoTemplateClient.tsx`.

---

## 9. ISSUES PENDIENTES

### 🔴 Críticos / Bloqueantes
1. **Build roto por `next-auth` huérfano** — `src/app/api/auth/[...nextauth]/route.ts`
   importa `next-auth` que fue desinstalado. Solución: borrar ese archivo + `src/types/next-auth.d.ts` + `src/lib/auth-config.ts`.
   Esperar aprobación del usuario.

### 🟡 Importantes
2. **Confirmar que el fix de Security Advisor funcionó** — el usuario corrió el SQL
   con la versión Postgres 14-compatible pero no confirmó. Pedirle screenshot del
   Security Advisor después de "Rerun linter".
3. **26 warnings del Security Advisor** — no se revisaron. Probablemente:
   - Índices faltantes
   - Policies amplias (`USING (true)`) en otras tablas
   - Otros `Security Definer Views` menores
4. **Token de GitHub expuesto en chat** — si el usuario lo compartió públicamente,
   recomendarle revocarlo y crear uno nuevo.

### 🟢 Mejoras futuras
5. **Placeholders en landing** que necesitan datos reales:
   - RUC `2060XXXXXXX` en Footer
   - WhatsApp `51999999999` en FAQ
   - Números de testimonios (180 pedidos, S/8k/mes, etc.) — inventados para CRO
6. **Demo plantillas en landing** — `/demo/[template]` existe pero la landing
   `Templates.tsx` debería tener un botón "Ver demo" más visible en mobile.

### ⚪ Deuda técnica (no urgente)
7. `prisma/seed.ts` y `src/app/api/demo/route.ts` tienen errores TypeScript preexistentes
   (property `isDemo` no existe en schema, `categories` no es un include válido).
   No rompen runtime pero ensucian el `tsc`.
8. `tsconfig.tsbuildinfo` se commitea por accidente — debería estar en `.gitignore`.

---

## 10. CÓMO ARRANCAR TRABAJO NUEVO

### Paso 1 — Leer contexto
```bash
cd /home/z/my-project
cat worklog.md | tail -100     # ver último trabajo
git log --oneline -10          # ver commits recientes
git status                     # ver cambios sin commitear
```

### Paso 2 — Verificar entorno
```bash
# El .env local usa SQLite (file:/home/z/my-project/db/custom.db)
# No necesitas Supabase para desarrollo local
npm install
npx prisma generate
npm run dev                    # localhost:3000
```

### Paso 3 — Verificar build (con el bug conocido)
```bash
npm run build
# VA A FALLAR con "Module not found: Can't resolve 'next-auth'"
# Eso es esperado — el bug es preexistente y conocido
# Para verificar que TUS cambios no rompieron nada:
npx tsc --noEmit | grep -v "next-auth" | grep "error TS"
```

### Paso 4 — Trabajar
- Respeta las REGLAS CRÍTICAS (sección 3)
- Usa el mismo patrón de código que ya existe en el repo
- Para scripts largos (>10 líneas), guárdalos en `scripts/` antes de ejecutarlos
- Para documentos/charts, usa los Skills (docx/pdf/xlsx/pptx)
- NUNCA uses `git add .` sin revisar

### Paso 5 — Commitear y pushear
```bash
git add <archivos-específicos>
git commit -m "tipo(scope): descripción"
git push origin main  # token ya está en el remote
```

### Paso 6 — Actualizar worklog
Append a `worklog.md` con tu Task ID, pasos, y resumen.

---

## 11. PATRONES DE CÓDIGO

### API routes
```typescript
// src/app/api/ejemplo/route.ts
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const data = await db.algo.findMany({ where: { userId: auth.user.userId } })
    return apiSuccess({ data }, 200, request)
  } catch (err) {
    console.error('[EJEMPLO] Error:', err)
    return apiError('Error interno', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
```

### Componentes cliente
```tsx
'use client'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'

export function MiComponente() {
  const navigate = useAppStore((s) => s.navigate)
  const currentStore = useAppStore((s) => s.currentStore)
  // ...
}
```

### Navegación (Zustand, NO Next router)
```typescript
navigate({ page: 'landing' })
navigate({ page: 'register' })
navigate({ page: 'dashboard' })
navigate({ page: 'dashboard-templates' })
navigate({ page: 'store', slug: 'mi-tienda' })
navigate({ page: 'product-detail', slug: 'mi-tienda', productId: 'xxx' })
```

**Excepción**: en páginas públicas SSR (`/store/[slug]`, `/demo/[template]`),
usar `useRouter` de `next/navigation` porque la página es renderizada por Next.js,
no por AppRouter. Ver `StoreView.tsx` y `ProductDetailView.tsx` para el patrón.

---

## 12. PLANTILLAS DE TIENDA

5 plantillas en `src/components/store-templates/`:
| ID | Nombre | Plan mínimo | Archivo |
|----|--------|-------------|---------|
| `moderna` | Moderna | free | ModernaTemplate.tsx |
| `vibrante` | Vibrante | pro | VibranteTemplate.tsx |
| `clasica` | Clásica | pro | ClasicaTemplate.tsx |
| `luxury` | Luxury | premium | LuxuryTemplate.tsx |
| `minimalist` | Minimalist | premium | MinimalistTemplate.tsx |

Todas reciben props: `{ store, products, storeSlug, planId, onProductClick }`.

---

## 13. FLUJO DE PAGOS (importante)

No hay gateway automático. El flujo es **manual**:

1. Usuario selecciona plan Pro/Premium en `PlanManager`
2. Ve info de Yape/Plin/transferencia + monto + referencia
3. Sube comprobante (foto) → `POST /api/payments/submit`
4. Admin ve el pago en `AdminPaymentsPage` → aprueba/rechaza
5. Si aprueba: `PATCH /api/payments/{id}/approve` → crea Subscription activa → envía email
6. Si rechaza: `PATCH /api/payments/{id}/reject` → notifica al usuario

**Tablas DB**: `Payment`, `Subscription`, `Plan`
**Modelo**: `Payment` tiene `status: pending|approved|rejected`, `verifiedAt`, `verifiedBy`

---

## 14. YAPE / PLIN (informacional, no funcional)

Yape y Plin son **billeteras móviles peruanas** (como PayPal pero locales).
- No tienen API pública para integración merchant
- Los usuarios suben el QR de su app bancaria personal
- El cliente escanea el QR desde la tienda y paga directo al vendedor
- El dinero **no pasa por TiendApp** — va directo a la cuenta del vendedor

En la DB: `Store.yapeQrUrl`, `Store.plinQrUrl`, `Store.yapeNumber`, `Store.plinNumber`
son strings (URL del QR subido a Supabase Storage + número de celular).

---

## 15. CONTACTO CON EL USUARIO

- **Nombre**: Carlos Alberto Guzmán Soto (org Supabase: `carlosalbertoguzmansoto`)
- **Empresa**: BlackBox Peru
- **Idioma**: español peruano informal
- **Estilo de comunicación**: directo, cortito ("q paso", "ok", "dame el enlace")
- **Decisión**: confianza media — aprueba rápido pero espera que respetes sus reglas
- **Domain**: blackboxperu.com / tienda.blackboxperu.com

### Cómo preguntarle cosas
- **NO** le hagas 8 preguntas de clarificación para tareas que ya tienen contexto
- Si la tarea es ambigua, pregunta 1-2 cosas máximo, en español, con opciones concretas
- Si tienes dudas técnicas (no de producto), resuélvelas tú mismo con el contexto del repo

---

## 16. ARCHIVOS CRÍTICOS (qué leer primero)

Si tienes poco tiempo, lee en este orden:

1. `worklog.md` (tail) — qué se hizo último
2. `prisma/schema.prisma` — modelos de DB
3. `src/lib/store.ts` — Zustand, especialmente `navigate()`, `currentStore`, `currentUser`
4. `src/lib/auth.ts` — JWT custom, `authenticateRequest()`
5. `src/components/AppRouter.tsx` — cómo se arma cada página
6. `src/lib/api-response.ts` — patrón de respuestas API + CORS
7. `src/lib/validations.ts` — Zod schemas
8. `src/app/api/setup-db/route.ts` — migraciones automáticas (importante para DB)

---

## 17. COSAS QUE NO HACER (lecciones aprendidas)

- ❌ NO uses `next-auth` — fue removido, hay JWT custom
- ❌ NO crees rutas que compitan con existentes (ver bug `/demo/[slug]`)
- ❌ NO uses `git add .` — siempre agrega archivos específicos
- ❌ NO commitees `tsconfig.tsbuildinfo` ni `.env`
- ❌ NO llames a APIs de Supabase con la anon key desde el server — usa `service_role`
- ❌ NO agregues el RUC real o WhatsApp real del usuario sin confirmar — son placeholders
- ❌ NO toques `src/app/api/auth/[...nextauth]/` sin aprobación (rompe el build pero
  el usuario no ha autorizado borrarlo)
- ❌ NO pongas el token de GitHub en archivos commiteados
- ❌ NO uses emojis en archivos a menos que el usuario los pida explícitamente

---

## 18. PRÓXIMOS PASOS RECOMENDADOS

Si el usuario vuelve y pregunta "¿qué sigue?", sugerirle en este orden:

1. **Confirmar que el fix de Supabase Security Advisor funcionó** — pedirle screenshot
2. **Revisar las 26 warnings** del Security Advisor (puede haber policies amplias críticas)
3. **Borrar el `next-auth` huérfano** para que el build vuelva a pasar (pedir aprobación)
4. **Reemplazar placeholders** de la landing (RUC, WhatsApp, testimonios) con datos reales
5. **Testear el fix del demo** de plantillas en producción después del deploy
6. **Agregar botón "Ver demo"** más visible en mobile en la landing Templates

---

*Documento generado por la sesión del 25 junio 2026.*
*Si algo de esto está desactualizado, leer `worklog.md` (tail) para ver lo más reciente.*
