// Replica EXACTA del flujo de PUT /api/store-products para cazar el throw
import { updateProductSchema, validateBody } from '../src/lib/validations'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// stubs de sanitize (importar reales si existen)
function sanitizeBasic(s: string) { return s }
function sanitizeUrl(s: string) { return s }

async function main() {
  const body: Record<string, unknown> = { id: 'prod-4ngZ5FQaxiWB9kpVvm0ewdXk', name: 'QA Auricular Pro' }

  console.log('1. validateBody...')
  const validation = validateBody(updateProductSchema, body)
  if (!validation.success) { console.log('VALIDATION FAIL:', validation.error); return }
  const { id, ...data } = validation.data
  console.log('   ok. data keys:', Object.keys(data).join(','))

  console.log('2. sanitizing...')
  if (data.name) data.name = sanitizeBasic(data.name)
  if (data.description) data.description = sanitizeHtmlSafe(data.description as string)
  if (data.imageUrl) data.imageUrl = sanitizeUrl(data.imageUrl)
  console.log('   ok')

  console.log('3. ownership raw...')
  const ownershipCheck = await db.$queryRawUnsafe(`SELECT p.id, s."ownerId" FROM "StoreProduct" p JOIN "Store" s ON s.id = p."storeId" WHERE p.id = $1`, id)
  console.log('   ok:', JSON.stringify(ownershipCheck))

  console.log('4. numerics...')
  if (data.price !== undefined) data.price = parseFloat(String(data.price))
  if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(String(data.originalPrice)) : null
  if (data.rating !== undefined) data.rating = parseFloat(String(data.rating))
  console.log('   ok')

  console.log('5. build SQL (lógica corregida)...')
  const sentKeys = new Set(Object.keys(body))
  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIdx = 1
  const addField = (fieldName: string, value: unknown) => {
    if (value !== undefined && sentKeys.has(fieldName)) {
      setClauses.push(`"${fieldName}" = $${paramIdx}`)
      values.push(value)
      paramIdx++
    }
  }
  addField('name', data.name)
  addField('description', data.description)
  addField('price', data.price)
  addField('originalPrice', data.originalPrice)
  addField('imageUrl', data.imageUrl)
  if (data.images !== undefined && sentKeys.has('images')) {
    const sanitizedImages = Array.isArray(data.images) && data.images.length > 0
      ? JSON.stringify(data.images.map((url: string) => sanitizeUrl(url)).filter(Boolean))
      : '[]'
    setClauses.push(`"images" = $${paramIdx}::jsonb`)
    values.push(sanitizedImages)
    paramIdx++
  }
  addField('category', data.category)
  addField('color', data.color)
  addField('stock', data.stock)
  addField('isActive', data.isActive)
  addField('featured', data.featured)
  addField('rating', data.rating)
  setClauses.push(`"updatedAt" = NOW()`)
  values.push(id)
  console.log('   SQL:', `UPDATE "StoreProduct" SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`)
  console.log('   values:', JSON.stringify(values))

  console.log('6. execute...')
  await db.$executeRawUnsafe(`UPDATE "StoreProduct" SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`, ...values)
  console.log('   update ok')

  console.log('7. fetch + serializeDecimals...')
  const product = await db.storeProduct.findUnique({ where: { id } })
  const { serializeDecimals } = await import('../src/lib/utils')
  console.log('   serialized:', JSON.stringify(serializeDecimals(product)).slice(0, 120))
  console.log('TODO OK — el handler deberia funcionar')
}

function sanitizeHtmlSafe(s: string) { return s }

main().finally(() => db.$disconnect())
