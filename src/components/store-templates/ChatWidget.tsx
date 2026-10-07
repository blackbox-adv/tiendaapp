'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

// ============================================================
// Chat interno cliente-tienda (Premium).
// - Flotante en la tienda, arriba del botón de WhatsApp.
// - El visitante escribe su nombre una vez; el hilo vive en su
//   localStorage (capability UUID) y persiste entre visitas.
// - Polling cada 5s SOLO mientras el panel está abierto.
// - Las respuestas de la tienda muestran el nombre del que atiende
//   y, si tiene, su WhatsApp propio ("continuar en WhatsApp").
// ============================================================

interface ChatMsg {
  id: string
  threadId: string
  sender: 'customer' | 'store'
  authorName: string
  authorWhatsapp: string | null
  body: string
  createdAt: string
}

export function ChatWidget({ storeSlug, storeName }: { storeSlug: string; storeName: string }) {
  const [open, setOpen] = useState(false)
  const [threadId, setThreadId] = useState<string>('')
  const [name, setName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const threadKey = `tiendapp_chat_thread_${storeSlug}`

  useEffect(() => {
    try {
      const savedThread = localStorage.getItem(threadKey)
      if (savedThread) setThreadId(savedThread)
      const savedName = localStorage.getItem('tiendapp_chat_name')
      if (savedName) {
        setName(savedName)
        setNameSaved(true)
      }
    } catch { /* localStorage bloqueado: sesión efímera */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug])

  const poll = useCallback(async (tid: string) => {
    if (!tid) return
    try {
      const res = await fetch(`/api/chat?storeSlug=${encodeURIComponent(storeSlug)}&thread=${encodeURIComponent(tid)}`)
      if (!res.ok) return
      const data = await res.json()
      const payload = data?.data || data
      if (Array.isArray(payload?.messages)) setMessages(payload.messages)
    } catch { /* red falló: siguiente intento */ }
  }, [storeSlug])

  // Polling solo con el panel abierto
  useEffect(() => {
    if (!open || !threadId) return
    poll(threadId)
    const iv = setInterval(() => poll(threadId), 5000)
    return () => clearInterval(iv)
  }, [open, threadId, poll])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const saveName = () => {
    const n = name.trim()
    if (n.length < 2) {
      setError('Escribe tu nombre para empezar')
      return
    }
    setError('')
    setNameSaved(true)
    try { localStorage.setItem('tiendapp_chat_name', n) } catch { /* noop */ }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    if (!nameSaved) { saveName(); return }
    setSending(true)
    setError('')
    try {
      let tid = threadId
      if (!tid) {
        tid = crypto.randomUUID()
        setThreadId(tid)
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeSlug, threadId: tid, name: name.trim(), body: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'No se pudo enviar el mensaje')
        return
      }
      const payload = data?.data || data
      if (payload?.threadId) {
        setThreadId(payload.threadId)
        try { localStorage.setItem(threadKey, payload.threadId) } catch { /* noop */ }
      }
      setInput('')
      await poll(payload?.threadId || tid)
    } catch {
      setError('Error de conexión, intenta de nuevo')
    } finally {
      setSending(false)
    }
  }

  const fmtTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <>
      {/* Botón flotante — encima del botón de WhatsApp (bottom-6) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat con la tienda"
          className="fab-above-cookie fixed bottom-[5.75rem] right-6 z-50 w-14 h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fab-above-cookie fixed bottom-[5.75rem] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col" style={{ maxHeight: 'min(480px, 70vh)' }}>
          {/* Header */}
          <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Chat · {storeName}</p>
              <p className="text-[11px] text-stone-300">Respondemos lo antes posible</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes o bienvenida */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-stone-50">
            {messages.length === 0 && (
              <div className="text-center py-6 px-4">
                <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-stone-500" />
                </div>
                <p className="text-sm text-stone-600 font-medium">¡Hola! 👋</p>
                <p className="text-xs text-stone-500 mt-1">
                  Escribe tu consulta y te responde {storeName} directo por aquí, sin WhatsApp.
                </p>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.sender === 'customer'
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-md'}`}>
                    {!mine && (
                      <p className="text-[11px] font-semibold text-stone-500 mb-0.5">{m.authorName || storeName}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-emerald-100' : 'text-stone-400'}`}>
                      {fmtTime(m.createdAt)}
                      {!mine && m.authorWhatsapp && (
                        <>
                          {' · '}
                          <a
                            href={`https://wa.me/${m.authorWhatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-semibold"
                          >
                            WhatsApp
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Nombre (una vez) */}
          {!nameSaved && (
            <div className="px-3 py-2 border-t border-stone-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                  placeholder="Tu nombre..."
                  maxLength={60}
                  className="flex-1 text-sm rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button onClick={saveName} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 text-sm font-medium transition-colors">
                  Empezar
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          {nameSaved && (
            <div className="px-3 py-2 border-t border-stone-200 bg-white shrink-0">
              {error && <p className="text-xs text-red-600 mb-1.5">{error}</p>}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Escribe tu mensaje..."
                  maxLength={1000}
                  className="flex-1 text-sm rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  aria-label="Enviar mensaje"
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg w-10 flex items-center justify-center transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
