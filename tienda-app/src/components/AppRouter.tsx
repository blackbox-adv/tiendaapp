'use client'

import { useStore } from '@/lib/store'
import LandingPage from './LandingPage'
import AuthPage from './AuthPage'
import DashboardHome from './dashboard/DashboardHome'
import ProductManager from './dashboard/ProductManager'
import AppearanceEditor from './dashboard/AppearanceEditor'
import SettingsEditor from './dashboard/SettingsEditor'
import PlanManager from './dashboard/PlanManager'
import StoreView from './StoreView'
import SuperAdmin from './admin/SuperAdmin'

export default function AppRouter() {
  const { route } = useStore()

  const isDashboard = route.page === 'dashboard' || route.page === 'dashboard-products' || route.page === 'dashboard-product-form' || route.page === 'dashboard-appearance' || route.page === 'dashboard-settings' || route.page === 'dashboard-plan' || route.page === 'store-preview' || route.page === 'super-admin'

  if (route.page === 'landing') return <LandingPage />
  if (route.page === 'pricing') return <LandingPage /> // pricing section is in landing
  if (route.page === 'login' || route.page === 'register') return <AuthPage mode={route.page} />
  if (route.page === 'view-store') return <StoreView />

  if (isDashboard) {
    if (route.page === 'dashboard') return <DashboardHome />
    if (route.page === 'dashboard-products' || route.page === 'dashboard-product-form') return <ProductManager />
    if (route.page === 'dashboard-appearance') return <AppearanceEditor />
    if (route.page === 'dashboard-settings') return <SettingsEditor />
    if (route.page === 'dashboard-plan') return <PlanManager />
    if (route.page === 'super-admin') return <SuperAdmin />
  }

  return <LandingPage />
}
