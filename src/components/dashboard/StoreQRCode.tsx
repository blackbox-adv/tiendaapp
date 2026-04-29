'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { QrCode, Copy, Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StoreQRCode() {
  const { currentStore } = useAppStore()
  const [copied, setCopied] = useState(false)

  if (!currentStore) return null

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/store/${currentStore.slug}`
    : `https://tiendapp.pe/store/${currentStore.slug}`

  // QR Code URL using a free QR API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}&bgcolor=ffffff&color=333333`

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `qr-${currentStore.slug}.png`
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-violet-600" />
          Código QR de tu Tienda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Comparte este código QR con tus clientes para que accedan directamente a tu tienda.
        </p>

        <div className="flex flex-col items-center">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <img
              src={qrUrl}
              alt={`QR Code de ${currentStore.name}`}
              className="w-48 h-48"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center max-w-[200px] truncate">
            {storeUrl}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={copyLink}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar enlace'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={downloadQR}
          >
            <Download className="w-4 h-4" />
            Descargar QR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
