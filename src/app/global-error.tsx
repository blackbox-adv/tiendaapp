'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL_ERROR_BOUNDARY]', error)
  }, [error])

  return (
    <html lang="es-PE">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '1rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#fef2f2',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
              Error del servidor
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Ocurrió un error crítico. Por favor, recarga la página.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#7C3AED',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
