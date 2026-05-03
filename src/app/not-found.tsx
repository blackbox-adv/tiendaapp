'use client'

import Link from 'next/link'
import { Store, Search, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="absolute inset-0 bg-violet-100 rounded-full opacity-50 animate-pulse" />
          <div className="absolute inset-4 bg-violet-200 rounded-full opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Store className="w-20 h-20 text-violet-400" />
              <Search className="w-8 h-8 text-violet-600 absolute -bottom-2 -right-4 bg-white rounded-full p-1 shadow-md" />
            </div>
          </div>
        </div>

        {/* Error code */}
        <h1 className="text-8xl font-extrabold text-violet-600 tracking-tight">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-3">
          Pagina no encontrada
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          La pagina que buscas no existe o ha sido movida.
          Puede que la tienda este inactiva o el enlace sea incorrecto.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-violet-200"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atras
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 mt-8">
          Si crees que esto es un error, contactanos por{' '}
          <a href="https://wa.me/51999888777" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
