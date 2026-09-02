'use client'

import AppRouter from '@/components/AppRouter'

// Deep-link /admin → el AppRouter SPA detecta el pathname y renderiza el
// panel de administración (requiere rol super_admin/admin, ver guards).
export default function AdminPage() {
  return <AppRouter />
}
