# Task: Orders API + Cart Component for TiendApp

## Summary
Created 4 files for the TiendApp orders and cart system:

### 1. `/src/app/api/orders/route.ts`
- **GET** — List orders for a store (auth required, store ownership verified). Supports optional `status` filter query param.
- **POST** — Create a new order (public, no auth). Validates required fields (storeId, customerName, customerPhone, items). Auto-generates `orderNumber` (format: ORD-YYYYMMDD-XXXX), calculates `totalAmount` from items, sets status to 'pending', and generates a `whatsappMessage` with order details formatted for WhatsApp.

### 2. `/src/app/api/orders/[id]/route.ts`
- **GET** — Get single order (auth required, store ownership verified).
- **PUT** — Update order status (auth required, store ownership verified). Accepts `status: 'confirmed' | 'cancelled'`. Prevents updating cancelled orders.
- Uses `params: Promise<{ id: string }>` pattern matching the existing products route.

### 3. `/src/lib/cart-context.tsx`
- `'use client'` React context with `createContext`/`useContext`.
- Exports `CartProvider` and `useCart` hook.
- `CartItem` type: `{ productId, name, price, imageUrl, quantity, storeId }`.
- Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.
- Computed: `totalAmount`, `totalItems` (via `useMemo`).

### 4. `/src/components/store-templates/CartButton.tsx`
- Floating cart button (bottom-left, violet) with item count badge.
- Opens a Sheet (right-side drawer) with two steps:
  - **Cart view**: Shows items with images, quantities (+/- controls), subtotal per item, total, "Hacer pedido" and "Pedir por WhatsApp" buttons.
  - **Checkout view**: Order summary, customer info form (name*, phone*, email, notes), "Confirmar pedido" button that POSTs to `/api/orders`, WhatsApp button, and back button.
- Filters cart items by `storeId` so each store only sees its own items.
- Shows success/error messages after order submission.
- Uses existing shadcn/ui components (Sheet, Button, Input, Badge, Separator).

## Patterns Used
- `db` from `@/lib/db`, `apiError/apiSuccess` from `@/lib/api-response`
- `authenticateRequest` from `@/lib/auth`, `serializeDecimals` from `@/lib/utils`
- Follows existing route patterns from `/api/products` and `/api/products/[id]`
- Leverages existing `StoreOrder` Prisma model (already in schema)

## TypeScript
- `npx tsc --noEmit` passes with zero errors
