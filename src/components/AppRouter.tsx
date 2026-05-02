'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

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

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeInOut" },
}

export default function AppRouter() {
  const route = useAppStore((s) => s.route)
  const currentUser = useAppStore((s) => s.currentUser)
  const navigate = useAppStore((s) => s.navigate)

  // Route guards
  const requiresAuth = route.page.startsWith('dashboard') || route.page === 'wizard'
  const requiresAdmin = route.page.startsWith('admin')

  if (requiresAuth && !currentUser) {
    navigate({ page: 'login' })
  } else if (requiresAdmin && (!currentUser || currentUser.role !== 'admin')) {
    navigate({ page: 'landing' })
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
      case 'dashboard-plan': {
        const dashboardContent = () => {
          switch (route.page) {
            case 'dashboard': return <DashboardOverview />
            case 'dashboard-products': return <ProductList />
            case 'dashboard-product-form': return <ProductForm productId={route.productId} />
            case 'dashboard-settings': return <StoreSettings />
            case 'dashboard-templates': return <TemplateGallery />
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
      case 'admin-settings': {
        const adminContent = () => {
          switch (route.page) {
            case 'admin': return <AdminOverview />
            case 'admin-stores': return <AdminStores />
            case 'admin-users': return <AdminUsers />
            case 'admin-plans': return <AdminPlans />
            case 'admin-settings': return <AdminSettings />
          }
        }
        return (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex">
            <AdminSidebar />
            <main className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
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
    <div style={{ minHeight: '100vh' }}>
      {renderPage()}
    </div>
  )
}
