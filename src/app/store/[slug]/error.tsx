'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[STORE_ERROR_BOUNDARY]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tienda no disponible</h2>
        <p className="text-gray-600 mb-6">
          No pudimos cargar esta tienda en este momento. Intenta de nuevo en unos segundos.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Reintentar
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
