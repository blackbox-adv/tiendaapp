import { db } from '@/lib/db'

// ============================================================
// Resolución de acceso a tienda: owner (dueno) o empleado.
// Empleado = User con role 'store_employee' vinculado via StoreMember.
// Devuelve la tienda a la que pertenece el usuario y su nivel de acceso.
// ============================================================

export interface StoreAccess {
  storeId: string
  ownerId: string
  isOwner: boolean
  storeName: string
}

export async function resolveStoreForUser(
  userId: string,
  role?: string
): Promise<StoreAccess | null> {
  // 1) Dueno: su propia tienda
  const owned = await db.store.findFirst({
    where: { ownerId: userId },
    select: { id: true, ownerId: true, name: true },
  })
  if (owned) {
    return { storeId: owned.id, ownerId: owned.ownerId, isOwner: true, storeName: owned.name }
  }

  // 2) Empleado activo: la tienda de su membresia (StoreMember no tiene
  //    relación Prisma con Store, se resuelve en dos consultas indexadas)
  const member = await db.storeMember.findFirst({
    where: { userId, isActive: true },
    select: { storeId: true },
  })
  if (member) {
    const store = await db.store.findUnique({
      where: { id: member.storeId },
      select: { id: true, ownerId: true, name: true },
    })
    if (store) {
      return { storeId: store.id, ownerId: store.ownerId, isOwner: false, storeName: store.name }
    }
  }

  return null
}
