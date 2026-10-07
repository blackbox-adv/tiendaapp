'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, Loader2, Send, ChevronLeft } from 'lucide-react'
import { getAuthHeaders } from '@/lib/api'

// ============================================================
// Bandeja de chat (dueno + empleados, Premium).
// Lista de hilos a la izquierda, conversación a la derecha.
// Polling ligero: 6s en la bandeja, 4s dentro de un hilo abierto.
// ============================================================

interface Thread {
  threadId: string
  customerName: string
  lastMessage: string
  lastSender: 'customer' | 'store'
  lastAt: string
  messageCount: number
  unread: number
}

interface Msg {
  id: string
  threadId: string
  sender: 'customer' | 'store'
  authorName: string
  authorWhatsapp: string | null
  body: string
  createdAt: string
}

export default function ChatsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showListOnMobile, setShowListOnMobile] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/chats', { headers: getAuthHeaders() })
      if (!res.ok) return
      const data = await res.json()
      const payload = data?.data || data
      setThreads(Array.isArray(payload?.threads) ? payload.threads : [])
      setTotalUnread(payload?.totalUnread || 0)
    } catch { /* siguiente intento */ }
  }, [])

  const loadThread = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/chats?thread=${encodeURIComponent(tid)}`, { headers: getAuthHeaders() })
      if (!res.ok) return
      const data = await res.json()
      const payload = data?.data || data
      if (Array.isArray(payload?.messages)) setMessages(payload.messages)
    } catch { /* siguiente intento */ }
  }, [])

  useEffect(() => {
    loadThreads().finally(() => setLoading(false))
    const iv = setInterval(loadThreads, 6000)
    return () => clearInterval(iv)
  }, [loadThreads])

  useEffect(() => {
    if (!selected) return
    loadThread(selected)
    const iv = setInterval(() => loadThread(selected), 4000)
    return () => clearInterval(iv)
  }, [selected, loadThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selected])

  const openThread = (tid: string) => {
    setSelected(tid)
    setShowListOnMobile(false)
    setMessages([])
    // optimista: quita el badge de no leídos
    setThreads((ts) => ts.map((t) => (t.threadId === tid ? { ...t, unread: 0 } : t)))
  }

  const send = async () => {
    const text = input.trim()
    if (!text || !selected || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ threadId: selected, body: text }),
      })
      if (res.ok) {
        setInput('')
        await loadThread(selected)
        await loadThreads()
      }
    } catch { /* siguiente intento */ }
    finally { setSending(false) }
  }

  const fmtTime = (iso: string) => {
    try {
      const d = new Date(iso)
      const hoy = new Date()
      const sameDay = d.toDateString() === hoy.toDateString()
      return sameDay
        ? d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    } catch { return '' }
  }

  const selectedThread = threads.find((t) => t.threadId === selected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-emerald-600" />
          Chats
          {totalUnread > 0 && (
            <span className="bg-emerald-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{totalUnread}</span>
          )}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Conversaciones de tus clientes desde tu tienda. Respóndelas aquí — tus clientes las ven al instante.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-medium text-stone-800">Aún no hay conversaciones</p>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Cuando un cliente toque el botón de chat en tu tienda y te escriba, la conversación aparece aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden grid md:grid-cols-[300px_1fr]" style={{ minHeight: '480px' }}>
          {/* Lista de hilos */}
          <div className={`border-r border-stone-200 overflow-y-auto ${showListOnMobile ? '' : 'hidden md:block'}`} style={{ maxHeight: '70vh' }}>
            {threads.map((t) => (
              <button
                key={t.threadId}
                onClick={() => openThread(t.threadId)}
                className={`w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-stone-50 transition-colors ${selected === t.threadId ? 'bg-violet-50' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-stone-900 truncate">{t.customerName}</p>
                  {t.unread > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">
                  {t.lastSender === 'store' ? 'Tú: ' : ''}{t.lastMessage}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">{fmtTime(t.lastAt)}</p>
              </button>
            ))}
          </div>

          {/* Conversación */}
          <div className={`flex flex-col ${showListOnMobile ? 'hidden md:flex' : 'flex'}`} style={{ maxHeight: '70vh' }}>
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-stone-200 flex items-center gap-2 shrink-0">
                  <button onClick={() => setShowListOnMobile(true)} className="md:hidden p-1 hover:bg-stone-100 rounded" aria-label="Volver">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <p className="font-semibold text-sm text-stone-900">{selectedThread?.customerName || 'Cliente'}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-stone-50">
                  {messages.map((m) => {
                    const mine = m.sender === 'store'
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-violet-600 text-white rounded-br-md' : 'bg-white border border-stone-200 rounded-bl-md'}`}>
                          {!mine && <p className="text-[11px] font-semibold text-stone-500 mb-0.5">{m.authorName}</p>}
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p className={`text-[10px] mt-1 ${mine ? 'text-violet-200' : 'text-stone-400'}`}>{fmtTime(m.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="px-3 py-2 border-t border-stone-200 shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                      placeholder="Responder..."
                      maxLength={1000}
                      className="flex-1 text-sm rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      onClick={send}
                      disabled={sending || !input.trim()}
                      aria-label="Enviar"
                      className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg w-10 flex items-center justify-center transition-colors"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                Elige una conversación para responder
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
