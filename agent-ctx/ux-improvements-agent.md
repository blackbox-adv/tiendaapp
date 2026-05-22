# Task: UX Improvements for TiendApp Store Templates

## Summary
Completed all 5 tasks for the TiendApp public-facing store templates.

## Changes Made

### Task 1: Remove "Buscador disponible en Plan Pro" from public view
- **Files modified**: ModernaTemplate.tsx, VibranteTemplate.tsx, ClasicaTemplate.tsx, LuxuryTemplate.tsx, MinimalistTemplate.tsx
- Changed the `else` clause when `planId === 'free'` from showing an upgrade button to rendering `null`
- Removed `Lock` import from lucide-react in all 5 template files

### Task 2: Fix banner + name integration (avoid name repetition)
- **Files modified**: ModernaTemplate.tsx, ClasicaTemplate.tsx, LuxuryTemplate.tsx, MinimalistTemplate.tsx
- Changed layout from "banner → header with name" to conditional rendering:
  - When banner exists: overlay store name, logo, description, and feature badges ON TOP of the banner with appropriate text styling (white text, backdrop blur)
  - When no banner: keep the original header as-is
- VibranteTemplate was already correct — no changes needed

### Task 3: Add quantity selector in ProductDetailView
- **Files modified**: ProductDetailView.tsx, validations.ts, whatsapp/route.ts
- Added `quantity` state (default 1) with Minus/Plus buttons
- Updated price display: shows total when quantity > 1, with "S/X.XX c/u" label
- Updated savings calculation to multiply by quantity
- Updated WhatsApp message to include quantity info ("Me interesa X unidades de...")
- Updated Yape/Plin payment section to show total amount
- Updated WhatsApp API route to include quantity in the generated message
- Added `quantity` field to `whatsappSchema` in validations.ts

### Task 4: Add Combos/Packs system
- **File created**: CombosSection.tsx
- Auto-groups products from the same category that have 3+ products
- Shows "Pack" card with stacked/overlaid product images, combined name, original total vs pack price (5% discount)
- Includes "Pedir Pack por WhatsApp" button with detailed message listing all products
- Added to all 5 templates (between category filters and product grid)

### Task 5: Add Promotional Popup system
- **File created**: PromoPopup.tsx
- Shows popup on store visit with featured/newest product
- Includes product image, name, price, "Ver oferta" CTA
- Close button and "No mostrar de nuevo" checkbox (localStorage persistence)
- Framer-motion fade + scale animation
- Only shows once per session per store (localStorage key: `popup-dismissed-{storeId}`)
- Added to StoreView.tsx (rendered after WhatsApp button)

## Verification
- TypeScript compilation passes with no errors (`npx tsc --noEmit`)
- No remaining "Buscador disponible en Plan Pro" text in template files
- All imports are clean (Lock icon removed from templates)
- All new components are 'use client'
- All text is in Spanish
