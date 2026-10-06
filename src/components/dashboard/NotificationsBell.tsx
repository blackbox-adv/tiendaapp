'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'

// ============================================================
// CAMPANITA DE NOTIFICACIONES (solo planes Pro/Premium)
// - Contador de no leídas + panel con los últimos 30 avisos
// - Avisos automáticos: plan por vencer, límite de productos
// - Se marca todo como leído al abrir el panel
// ============================================================

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  icon: string
  link: string | null
  read: boolean
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days} d`
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function NotificationsBell() {
  const { currentUser } = useAppStore()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [locked, setLocked] = useState(false)
  const [open, setOpen] = useState(false)
  const mounted = useRef(false)

  const plan = currentUser?.planId || 'free'
  const enabled = plan !== 'free'

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.planLocked) {
        setLocked(true)
        return
      }
      setLocked(false)
      setItems(Array.isArray(data?.notifications) ? data.notifications : [])
      setUnread(Number(data?.unread ?? 0))
    } catch {
      /* silencioso: la campanita nunca rompe el panel */
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    mounted.current = true
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [enabled, load])

  const markAllRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('tiendapp_token')
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* silencioso */
    }
  }, [])

  if (!enabled || locked) return null

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && unread > 0) {
          // Al abrir el panel se marcan como leídas (el badge desaparece,
          // los avisos siguen visibles en la lista)
          markAllRead()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notificaciones"
          className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[90vw] p-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
          {items.length > 0 && (
            <span className="text-xs text-gray-400">{items.length} recientes</span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Todo tranquilo por aquí</p>
              <p className="text-xs text-gray-400 mt-1">
                Te avisaremos cuando tu plan esté por vencer o estés por llegar al límite de productos.
              </p>
            </div>
          ) : (
            items.map((n) => {
              const content = (
                <div className={`px-4 py-3 border-b border-gray-50 last:border-0 ${n.read ? '' : 'bg-violet-50/60'}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none mt-0.5">{n.icon || '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              )
              return n.link ? (
                <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block hover:bg-gray-50">
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
