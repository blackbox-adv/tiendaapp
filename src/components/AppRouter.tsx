'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import type { PageRoute } from '@/lib/types'

// Landing
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Templates } from '@/components/landing/Templates'
import { Testimonials } from '@/components/landing/Testimonials'
import { Footer } from '@/components/landing/Footer'

// Auth
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'

// Info
import { AboutPage } from '@/components/info/AboutPage'
import { ContactPage } from '@/components/info/ContactPage'
import { TermsPage } from '@/components/info/TermsPage'
import { PrivacyPage } from '@/components/info/PrivacyPage'

// Wizard
import { StoreWizard } from '@/components/wizard/StoreWizard'

// Dashboard
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { ProductList } from '@/components/dashboard/ProductList'
import { ProductForm } from '@/components/dashboard/ProductForm'
import { StoreSettings } from '@/components/dashboard/StoreSettings'
import { TemplateGallery } from '@/components/dashboard/TemplateGallery'
import { PlanManager } from '@/components/dashboard/PlanManager'
import { StoreQRCode } from '@/components/dashboard/StoreQRCode'

// Store templates
import { StoreView } from '@/components/store-templates/StoreView'
import { ProductDetailView } from '@/components/store-templates/ProductDetailView'

// Admin
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { AdminStores } from '@/components/admin/AdminStores'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminPlans } from '@/components/admin/AdminPlans'
import { AdminSettings } from '@/components/admin/AdminSettings'
import { AdminPaymentsPage } from '@/components/admin/AdminPaymentsPage'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
}

export default function AppRouter() {
  const route = useAppStore((s) => s.route)
  const currentUser = useAppStore((s) => s.currentUser)
  const isSyncing = useAppStore((s) => s.isSyncing)
  const navigate = useAppStore((s) => s.navigate)

  // Deep-link detection: sync Zustand route with actual browser URL
  useEffect(() => {
    const pathname = window.location.pathname

    const routeMap: Record<string, () => void> = {
      '/reset-password': () => navigate({ page: 'reset-password' }),
      '/login': () => navigate({ page: 'login' }),
      '/register': () => navigate({ page: 'register' }),
      '/about': () => navigate({ page: 'about' }),
      '/contact': () => navigate({ page: 'contact' }),
      '/terms': () => navigate({ page: 'terms' }),
      '/privacy': () => navigate({ page: 'privacy' }),
    }

    // Deep-link for dashboard sub-routes
    if (pathname === '/dashboard') {
      navigate({ page: 'dashboard' })
      return
    }
    if (pathname.startsWith('/dashboard/')) {
      const sub = pathname.replace('/dashboard/', '')
      const dashboardRoutes: Record<string, PageRoute['page']> = {
        'products': 'dashboard-products',
        'settings': 'dashboard-settings',
        'templates': 'dashboard-templates',
        'qr': 'dashboard-qr',
        'plan': 'dashboard-plan',
      }
      if (dashboardRoutes[sub]) {
        navigate({ page: dashboardRoutes[sub] } as PageRoute)
        return
      }
    }

    // Deep-link for admin sub-routes
    if (pathname === '/admin') {
      navigate({ page: 'admin' })
      return
    }
    if (pathname.startsWith('/admin/')) {
      const sub = pathname.replace('/admin/', '')
      const adminRoutes: Record<string, PageRoute['page']> = {
        'stores': 'admin-stores',
        'users': 'admin-users',
        'plans': 'admin-plans',
        'payments': 'admin-payments',
        'settings': 'admin-settings',
      }
      if (adminRoutes[sub]) {
        navigate({ page: adminRoutes[sub] } as PageRoute)
        return
      }
    }

    // Store/product deep-links (handled by Next.js SSR, skip here)
    if (pathname.startsWith('/store/') || pathname.startsWith('/demo/')) {
      return
    }

    const handler = routeMap[pathname]
    if (handler) {
      handler()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Route guards — wait for sync to complete before redirecting
  const requiresAuth = route.page.startsWith('dashboard') || route.page === 'wizard'
  const requiresAdmin = route.page.startsWith('admin')

  // Show loading while syncing from API (prevents race condition on page refresh)
  if (isSyncing && (requiresAuth || requiresAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (requiresAuth && !currentUser) {
    navigate({ page: 'login' })
    return null
  } else if (requiresAdmin && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin'))) {
    navigate({ page: 'landing' })
    return null
  }

  const renderPage = () => {
    switch (route.page) {
      case 'landing':
        return (
          <motion.div key="landing" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Templates />
            <Testimonials />
            <Footer />
          </motion.div>
        )

      case 'login':
        return (
          <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-gray-50">
            <LoginPage />
          </motion.div>
        )

      case 'register':
        return (
          <motion.div key="register" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-gray-50">
            <RegisterPage />
          </motion.div>
        )

      case 'reset-password':
        return (
          <motion.div key="reset-password" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-gray-50">
            <ResetPasswordPage />
          </motion.div>
        )

      case 'about':
        return (
          <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <AboutPage />
          </motion.div>
        )

      case 'contact':
        return (
          <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <ContactPage />
          </motion.div>
        )

      case 'terms':
        return (
          <motion.div key="terms" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <TermsPage />
          </motion.div>
        )

      case 'privacy':
        return (
          <motion.div key="privacy" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <PrivacyPage />
          </motion.div>
        )

      case 'wizard':
        return (
          <motion.div key="wizard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-gray-50">
            <StoreWizard />
          </motion.div>
        )

      case 'store':
        return (
          <motion.div key={`store-${route.slug}`} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <StoreView slug={route.slug} />
          </motion.div>
        )

      case 'product-detail':
        return (
          <motion.div key={`product-${route.productId}`} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <ProductDetailView slug={route.slug} productId={route.productId} />
          </motion.div>
        )

      case 'dashboard':
      case 'dashboard-products':
      case 'dashboard-product-form':
      case 'dashboard-settings':
      case 'dashboard-templates':
      case 'dashboard-qr':
      case 'dashboard-plan': {
        const dashboardContent = () => {
          switch (route.page) {
            case 'dashboard': return <DashboardOverview />
            case 'dashboard-products': return <ProductList />
            case 'dashboard-product-form': return <ProductForm productId={route.productId} />
            case 'dashboard-settings': return <StoreSettings />
            case 'dashboard-templates': return <TemplateGallery />
            case 'dashboard-qr': return <StoreQRCode />
            case 'dashboard-plan': return <PlanManager />
          }
        }
        return (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 bg-gray-50 p-4 pt-16 md:pt-8 md:p-8 overflow-auto">
              {dashboardContent()}
            </main>
          </motion.div>
        )
      }

      case 'admin':
      case 'admin-stores':
      case 'admin-users':
      case 'admin-plans':
      case 'admin-payments':
      case 'admin-settings': {
        const adminContent = () => {
          switch (route.page) {
            case 'admin': return <AdminOverview />
            case 'admin-stores': return <AdminStores />
            case 'admin-users': return <AdminUsers />
            case 'admin-plans': return <AdminPlans />
            case 'admin-payments': return <AdminPaymentsPage />
            case 'admin-settings': return <AdminSettings />
          }
        }
        return (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex">
            <AdminSidebar />
            <main className="flex-1 bg-gray-50 p-4 pt-14 md:pt-8 md:p-8 overflow-auto">
              {adminContent()}
            </main>
          </motion.div>
        )
      }

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p>Página no encontrada</p>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh' }} role="main">
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </div>
  )
}
