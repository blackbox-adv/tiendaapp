// QA Task 47: ficha tecnica automatica (especificaciones desde descripcion)
// 1) busca tienda del usuario QA  2) crea producto temporal con specs en la descripcion
// 3) imprime URL publica  4) al final (flag --cleanup) borra el producto
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const DESC = 'Bolso artesanal hecho a mano por artesanas de Gamarra.\n\nMaterial: cuero sintético premium\nMedidas: 20 x 15 cm\nIncluye: correa ajustable + bolsa de regalo'

async function main() {
  const mode = process.argv[2] || 'create'
  const qa = await db.user.findUnique({
    where: { email: QA_EMAIL },
    select: { id: true, stores: { select: { id: true, slug: true, name: true } } },
  })
  if (!qa || qa.stores.length === 0) throw new Error('QA user o tienda no encontrada')
  const store = qa.stores[0]
  console.log('QA store:', store.slug)

  if (mode === 'create') {
    // limpiar restos previos si los hubiera
    await db.storeProduct.deleteMany({ where: { storeId: store.id, name: 'QA Specs Ficha' } })
    const p = await db.storeProduct.create({
      data: {
        name: 'QA Specs Ficha',
        description: DESC,
        price: 59.9,
        storeId: store.id,
        category: 'accesorios',
        isActive: true,
      },
    })
    console.log('PRODUCT_URL=https://kyllari.com/store/' + store.slug + '/product/' + p.id)
  } else if (mode === 'cleanup') {
    const r = await db.storeProduct.deleteMany({ where: { storeId: store.id, name: 'QA Specs Ficha' } })
    console.log('deleted:', r.count)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
