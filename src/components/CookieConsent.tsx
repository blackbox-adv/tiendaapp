'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'tiendapp_cookie_consent'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShow(true)
    }
  }, [])

  function acceptAll() {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }))
    setShow(false)
  }

  function acceptEssential() {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, essentialOnly: true, timestamp: Date.now() }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Usamos cookies
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.
              Puedes aceptar todas las cookies o solo las esenciales.{' '}
              <Link href="/privacy" className="text-purple-600 hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
