'use client'

import { useState } from 'react'
import { Wallet, Copy, Check, Phone } from 'lucide-react'
import type { Store } from '@/lib/types'

// Muestra las formas de pago de la tienda (Yape / Plin) con QR y número.
// Se renderiza solo si la tienda configuró al menos un método.
export function PaymentMethods({ store }: { store: Store }) {
  const [copied, setCopied] = useState<string | null>(null)

  const methods = [
    { key: 'yape', label: 'Yape', number: store.yapeNumber, qr: store.yapeQrUrl, color: '#6D28D9' },
    { key: 'plin', label: 'Plin', number: store.plinNumber, qr: store.plinQrUrl, color: '#0EA5E9' },
  ].filter((m) => m.number || m.qr)

  if (methods.length === 0) return null

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // clipboard no disponible
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
          Formas de pago
        </h2>
      </div>
      <div
        className={`grid gap-4 ${methods.length > 1 ? 'sm:grid-cols-2' : ''}`}
      >
        {methods.map((m) => (
          <div
            key={m.key}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/60"
          >
            {m.qr ? (
              <img
                src={m.qr}
                alt={`QR de ${m.label}`}
                className="w-24 h-24 rounded-lg object-cover border border-gray-200 bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg border border-dashed border-gray-200 bg-white flex items-center justify-center">
                <Phone className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <div className="min-w-0">
              <span
                className="inline-block px-2 py-0.5 rounded-md text-white text-[10px] font-bold tracking-wide uppercase"
                style={{ backgroundColor: m.color }}
              >
                {m.label}
              </span>
              {m.number ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <p className="text-lg font-semibold text-gray-900 tracking-tight truncate">
                    {m.number}
                  </p>
                  <button
                    onClick={() => copy(m.number!, m.key)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 transition-colors flex-shrink-0"
                    aria-label={`Copiar número de ${m.label}`}
                  >
                    {copied === m.key ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  Escanea el QR con tu app
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Paga y coordina la entrega por WhatsApp
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
