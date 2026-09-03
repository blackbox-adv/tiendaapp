'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import type { PageRoute } from '@/lib/types'

// Landing
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Templates } from '@/components/landing/Templates'
import { Comparison } from '@/components/landing/Comparison'
import { GrowthLadder } from '@/components/landing/GrowthLadder'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { FAQ } from '@/components/landing/FAQ'
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

// Store templates
import { StoreView } from '@/components/store-templates/StoreView'
import { ProductDetailView } from '@/components/store-templates/ProductDetailView'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
}

// Routes that are handled by Next.js App Router pages
const NEXTJS_ROUTES = [
  '/dashboard',
  '/dashboard/products',
  '/dashboard/categories',
  '/dashboard/settings',
  '/dashboard/template',
]

export default function AppRouter() {
  const route = useAppStore((s) => s.route)
  const currentUser = useAppStore((s) => s.currentUser)
  const isSyncing = useAppStore((s) => s.isSyncing)
  const navigate = useAppStore((s) => s.navigate)
  const nextRouter = useRouter()

  // Deep-link detection: sync Zustand route with actual browser URL
  useEffect(() => {
    if (typeof window === 'undefined') return
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

    // Deep-link for dashboard sub-routes — redirect to Next.js pages
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      // Next.js App Router handles dashboard pages — don't override
      return
    }

    // Deep-link for admin sub-routes — redirect to Next.js pages
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      // Admin pages handled by AppRouter
      if (pathname === '/admin') {
        navigate({ page: 'admin' })
        return
      }
    }

    // Store/product deep-links (handled by Next.js SSR, skip here)
    if (pathname.startsWith('/store/') || pathname.startsWith('/demo/')) {
      return
    }

    // Onboarding handled by Next.js
    if (pathname.startsWith('/onboarding')) {
      return
    }

    // Auth pages handled by Next.js
    if (pathname.startsWith('/auth/')) {
      return
    }

    const handler = routeMap[pathname]
    if (handler) {
      handler()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect dashboard routes to Next.js pages
  useEffect(() => {
    if (route.page.startsWith('dashboard') || route.page === 'wizard') {
      const dashboardRedirects: Record<string, string> = {
        'dashboard': '/dashboard',
        'dashboard-products': '/dashboard/products',
        'dashboard-product-form': '/dashboard/products/new',
        'dashboard-settings': '/dashboard/settings',
        'dashboard-templates': '/dashboard/template',
        'dashboard-qr': '/dashboard/settings',
        'dashboard-popup': '/dashboard/settings',
        'dashboard-plan': '/dashboard/settings',
        'wizard': '/onboarding',
      }

      const redirectUrl = dashboardRedirects[route.page]
      if (redirectUrl) {
        // Check if we're already on the target page
        if (typeof window !== 'undefined' && window.location.pathname !== redirectUrl) {
          // For product form with specific product ID
          if (route.page === 'dashboard-product-form' && route.productId) {
            nextRouter.push(`/dashboard/products/${route.productId}`)
          } else {
            nextRouter.push(redirectUrl)
          }
        }
        return
      }
    }
  }, [route.page, nextRouter])

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
    // Redirect to Next.js login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
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
            <Problem />
            <HowItWorks />
            <Features />
            <Templates />
            <Comparison />
            <GrowthLadder />
            <Pricing />
            <Testimonials />
            <FAQ />
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

      // Dashboard and admin routes are handled by Next.js App Router pages
      // The redirect useEffect above handles the navigation
      case 'dashboard':
      case 'dashboard-products':
      case 'dashboard-product-form':
      case 'dashboard-settings':
      case 'dashboard-templates':
      case 'dashboard-qr':
      case 'dashboard-plan':
      case 'dashboard-popup':
      case 'wizard':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Redirigiendo...</p>
            </div>
          </div>
        )

      case 'admin':
      case 'admin-stores':
      case 'admin-users':
      case 'admin-plans':
      case 'admin-payments':
      case 'admin-settings':
      case 'admin-notifications': {
        // Admin pages are still handled by Zustand SPA for now
        // TODO: Migrate admin to Next.js App Router pages
        const AdminSidebar = require('@/components/admin/AdminSidebar').AdminSidebar
        const AdminOverview = require('@/components/admin/AdminOverview').AdminOverview
        const AdminStores = require('@/components/admin/AdminStores').AdminStores
        const AdminUsers = require('@/components/admin/AdminUsers').AdminUsers
        const AdminPlans = require('@/components/admin/AdminPlans').AdminPlans
        const AdminPaymentsPage = require('@/components/admin/AdminPaymentsPage').AdminPaymentsPage
        const AdminSettings = require('@/components/admin/AdminSettings').AdminSettings
        const AdminNotificationsPage = require('@/components/admin/AdminNotificationsPage').AdminNotificationsPage

        const adminContent = () => {
          switch (route.page) {
            case 'admin': return <AdminOverview />
            case 'admin-stores': return <AdminStores />
            case 'admin-users': return <AdminUsers />
            case 'admin-plans': return <AdminPlans />
            case 'admin-payments': return <AdminPaymentsPage />
            case 'admin-settings': return <AdminSettings />
            case 'admin-notifications': return <AdminNotificationsPage />
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
