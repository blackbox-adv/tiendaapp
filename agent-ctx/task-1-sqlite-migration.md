# Task: Replace PostgreSQL Raw SQL with Prisma ORM for SQLite Compatibility

## Summary
Replaced ALL `$queryRawUnsafe`, `$queryRaw`, `$executeRawUnsafe`, and `$executeRaw` calls across 8 API route files with database-agnostic Prisma ORM queries. Also cleaned up `lib/db.ts` to remove PgBouncer-specific connection logic.

## Files Modified

### 1. `/src/app/api/stores/route.ts`
- **GET slug lookup** (was raw SQL with `json_build_object`, `json_agg`, `FILTER`, `LEFT JOIN`): Replaced with `db.store.findUnique({ where: { slug }, include: { products, owner } })`
- **GET admin store listing** (was raw SQL with `::int`, `::text`, `LATERAL JOIN`, `COALESCE`): Replaced with `db.store.findMany({ include: { owner, products, subscriptions: { include: { plan } } } })`
- **POST plan check** (was raw SQL `SELECT ... FROM "Subscription" JOIN "Plan"`): Replaced with `tx.subscription.findFirst({ include: { plan } })`
- **DELETE store check** (was raw SQL with subquery COUNT): Replaced with `db.store.findUnique({ include: { _count: { select: { products: true } } } })`
- Cleaned up PgBouncer-related comments

### 2. `/src/app/api/admin/stores/route.ts`
- **GET all stores** (was raw SQL with LATERAL JOIN, PostgreSQL casts): Replaced with `db.store.findMany({ include: { owner, products, subscriptions: { include: { plan } } } })`
- **DELETE store** (was raw SQL with SQL injection vulnerability via string interpolation): Replaced with `db.store.findUnique({ include: { _count } })`
- **PUT isActive toggle** (was `$executeRawUnsafe` with `NOW()`): Replaced with `db.store.update()` — Prisma handles `updatedAt` via `@updatedAt`
- Removed PostgreSQL-specific `::int` casts and `LATERAL JOIN` syntax

### 3. `/src/app/api/admin/stats/route.ts`
- **All count queries** (7 raw SQL `COUNT(*)` queries): Replaced with `db.model.count()` calls
- **Subscriptions listing** (was raw SQL with `::text` casts): Replaced with `db.subscription.findMany({ include: { plan } })`
- **Completed payments** (was raw SQL with `::text` casts): Replaced with `db.payment.findMany({ select: { amount, verifiedAt } })`
- **Top stores** (was raw SQL with GROUP BY, COUNT, `::int`): Replaced with `db.store.findMany({ include: { products } })`
- **Recent stores** (was raw SQL with LATERAL JOIN): Replaced with `db.store.findMany({ include: { owner, subscriptions: { include: { plan } } } })`
- All count queries run in parallel with `Promise.all()`

### 4. `/src/app/api/billing/check/route.ts`
- **GET billing summary** (6 raw SQL queries with `::int`, `::text` casts, inline date literals): Replaced with Prisma `count()` and `findMany()` queries running in parallel
- Past-due subscriptions with relations: Replaced with `db.subscription.findMany({ include: { user, store, plan } })`

### 5. `/src/app/api/users/route.ts`
- **GET user listing** (was raw SQL with LATERAL JOIN, `::text` casts, manual pagination): Replaced with `db.user.findMany({ skip, take, include: { stores, subscriptions: { include: { plan } } } })`
- **User count** (was raw SQL `COUNT(*)::int`): Replaced with `db.user.count()`
- Removed complex row-grouping logic since Prisma returns properly nested objects

### 6. `/src/app/api/settings/route.ts`
- **GET settings** (was `$queryRawUnsafe` SELECT): Replaced with `db.platformSetting.findMany()`
- **PUT settings fallback** (was `$executeRawUnsafe` with PostgreSQL `ON CONFLICT` and `EXCLUDED`): Removed — Prisma `upsert()` handles this correctly with SQLite
- Removed `uuid` import (no longer needed)

### 7. `/src/app/api/admin/migrate/route.ts`
- **Entire file** was PostgreSQL-specific DDL (`CREATE TABLE`, `ALTER TABLE`, `ADD CONSTRAINT`, `DO $$`, `EXCEPTION WHEN OTHERS`, `SQLSTATE`, `JSONB`, `TIMESTAMP(3)`, `DECIMAL(10,2)`): Replaced with simple model accessibility verification using `db.model.count()` for each table
- Users should run `bun run db:push` to manage schema changes instead

### 8. `/src/app/api/store-products/route.ts`
- **POST plan limit check** (was raw SQL `SELECT maxProducts FROM ... JOIN`): Replaced with `db.subscription.findFirst({ include: { plan: { select: { maxProducts } } } })`
- **PUT ownership check** (was raw SQL with `$1` parameter, table name "Product" instead of "StoreProduct"): Replaced with `db.storeProduct.findUnique({ include: { store } })`
- **DELETE ownership check** (was raw SQL): Replaced with `db.storeProduct.findUnique({ include: { store } })`
- **DELETE store slug lookup** (was raw SQL): Replaced with `db.storeProduct.findUnique({ include: { store: { select: { slug } } } })`

### 9. `/src/lib/db.ts`
- Removed `getDatasourceUrl()` function with PgBouncer/Supabase connection pooling logic
- Simplified PrismaClient instantiation — no longer needs `datasourceUrl` override for SQLite

## Key Changes in Query Approach
| PostgreSQL Raw SQL Pattern | Prisma ORM Replacement |
|---|---|
| `COUNT(*)::int` | `db.model.count()` |
| `::text` casts | Not needed — Prisma returns proper types |
| `LATERAL JOIN` | `include: { subscriptions: { take: 1, include: { plan } } }` |
| `json_build_object`, `json_agg` | `include` with `select` |
| `LEFT JOIN ... GROUP BY` | `include: { products: { where: { isActive: true } } }` |
| `ON CONFLICT ... DO UPDATE` | `db.platformSetting.upsert()` |
| `NOW()` / `CURRENT_TIMESTAMP` | Prisma `@updatedAt` handles this |
| `$1` parameters | Prisma typed `where` clauses |
| String interpolation (SQL injection risk) | Prisma parameterized queries |

## Verification
- Zero remaining `$queryRawUnsafe`, `$queryRaw`, `$executeRawUnsafe`, `$executeRaw` in codebase
- Zero remaining PostgreSQL-specific syntax (`::int`, `::text`, `LATERAL`, `json_build_object`, `json_agg`)
- TypeScript compilation: No new errors introduced (6 pre-existing errors in unrelated `admin/payments/route.ts`)
