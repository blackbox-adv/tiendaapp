'use client'

import Image from 'next/image'
import { WhatsAppIcon } from './WhatsAppIcon'

/**
 * Mockup de celular MODERNO (Dynamic Island, bisel fino, botones laterales)
 * con la tienda demo "Bodega Doña Rosa" renderizada NATIVAMENTE en versión
 * móvil (no un screenshot de escritorio encogido) y el chat de WhatsApp
 * ocurriendo en vivo sobre la tienda. SOLO PRESENTACIONAL: sin lógica, sin
 * eventos, sin links. Verde WhatsApp y rojo de la bodega viven SOLO aquí
 * dentro (es la marca de la tienda demo, no la marca Kyllari).
 */

const PRODUCTS = [
  { img: '/sample-products/arroz-5kg.jpg', name: 'Arroz Extra Superior 5kg', price: 'S/24.90', old: 'S/27.90', off: '-11%' },
  { img: '/sample-products/cafe-molido-500g.jpg', name: 'Café Molido 500g', price: 'S/19.90', old: 'S/22.90', off: '-13%' },
  { img: '/sample-products/aceite-vegetal-1l.jpg', name: 'Aceite Vegetal 1L', price: 'S/8.90', old: null, off: null },
  { img: '/sample-products/azucar-rubia-1kg.jpg', name: 'Azúcar Rubia 1kg', price: 'S/5.50', old: null, off: null },
]

function StatusIcons() {
  return (
    <div className="flex items-center gap-1 text-[#17142E]">
      {/* Señal */}
      <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" aria-hidden>
        <rect x="0" y="6" width="2.4" height="4" rx="0.6" />
        <rect x="3.7" y="4" width="2.4" height="6" rx="0.6" />
        <rect x="7.4" y="2" width="2.4" height="8" rx="0.6" />
        <rect x="11.1" y="0" width="2.4" height="10" rx="0.6" />
      </svg>
      {/* WiFi */}
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
        <path d="M1.6 3.6a7.6 7.6 0 0 1 10.8 0" />
        <path d="M3.9 6.1a4.4 4.4 0 0 1 6.2 0" />
        <circle cx="7" cy="8.7" r="1.05" fill="currentColor" stroke="none" />
      </svg>
      {/* Batería */}
      <svg width="19" height="10" viewBox="0 0 19 10" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="14.5" height="9" rx="2.6" stroke="currentColor" opacity="0.4" />
        <rect x="2" y="2" width="11.5" height="6" rx="1.6" fill="currentColor" />
        <path d="M16.6 3.4v3.2a1.7 1.7 0 0 0 0-3.2Z" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  )
}

export function PhoneMockup() {
  return (
    <div className="relative w-[270px] sm:w-[300px]">
      {/* Botones laterales (detalle realista del marco) */}
      <div className="absolute -left-[3px] top-[22%] w-[3px] h-9 rounded-l-full bg-[#2A2745]" />
      <div className="absolute -left-[3px] top-[32%] w-[3px] h-9 rounded-l-full bg-[#2A2745]" />
      <div className="absolute -right-[3px] top-[26%] w-[3px] h-14 rounded-r-full bg-[#2A2745]" />

      {/* Aro metálico + bisel fino */}
      <div className="relative rounded-[2.9rem] p-[2px] bg-gradient-to-b from-[#57536F] via-[#211E3C] to-[#57536F] shadow-2xl shadow-[#17142E]/30">
        <div className="rounded-[2.75rem] bg-[#17142E] p-[7px]">
          <div className="relative aspect-[9/16] rounded-[2.35rem] overflow-hidden bg-white">

            {/* Dynamic Island */}
            <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[72px] h-[20px] bg-black rounded-full z-40" />

            {/* Barra de estado */}
            <div className="relative z-30 flex items-center justify-between h-8 px-5 bg-white">
              <span className="text-[10px] font-bold text-[#17142E] tracking-tight">9:41</span>
              <StatusIcons />
            </div>

            {/* ===== Tienda demo en versión móvil (nativa, nítida) ===== */}
            {/* Tira de estado de la bodega */}
            <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#F97316] py-[3px]">
              <span className="text-[7px] font-bold text-white tracking-wide">🛵 DELIVERY EN TU BARRIO · ABIERTO AHORA</span>
            </div>

            {/* Header de la tienda */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border-b border-stone-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-[9px] shrink-0">🏪</div>
                <p className="text-[10px] font-black text-stone-900 truncate">Bodega Doña Rosa</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-red-600 pl-1.5 pr-2 py-[3px] shrink-0">
                <WhatsAppIcon className="w-2.5 h-2.5 text-white" />
                <span className="text-[8px] font-bold text-white">Pedir</span>
              </div>
            </div>

            {/* Buscador */}
            <div className="px-2.5 pt-1.5">
              <div className="flex items-center gap-1.5 h-6 rounded-full bg-stone-100 px-2">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="3" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8px] text-stone-400">¿Qué buscas hoy?</span>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex items-center gap-1.5 px-2.5 pt-1.5">
              <span className="rounded-full bg-red-600 text-white text-[7px] font-bold px-2 py-[3px]">TODOS · 6</span>
              <span className="rounded-full border border-stone-200 text-stone-500 text-[7px] font-bold px-2 py-[3px]">ABARROTES · 5</span>
              <span className="rounded-full border border-stone-200 text-stone-500 text-[7px] font-bold px-2 py-[3px]">SNACKS · 1</span>
            </div>

            {/* Productos (2 columnas) — la 2.ª fila queda detrás del chat, como contenido real */}
            <div className="grid grid-cols-2 gap-1.5 px-2.5 pt-2 pb-10">
              {PRODUCTS.map((p) => (
                <div key={p.name} className="relative rounded-xl border border-stone-100 bg-white overflow-hidden shadow-sm">
                  {p.off && (
                    <span className="absolute top-1 left-1 z-10 rounded-full bg-red-600 text-white text-[6.5px] font-black px-1.5 py-[2px]">
                      {p.off} HOY
                    </span>
                  )}
                  <Image src={p.img} alt={p.name} width={128} height={96} className="w-full h-[62px] object-cover" />
                  <div className="p-1.5">
                    <p className="text-[8px] font-semibold text-stone-800 leading-tight h-[19px] overflow-hidden">{p.name}</p>
                    <p className="pt-0.5 flex items-baseline gap-1">
                      <span className="text-[10px] font-black text-red-600">{p.price}</span>
                      {p.old && <span className="text-[7px] text-stone-400 line-through">{p.old}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Overlay: chat de WhatsApp (la venta ocurriendo en vivo) ===== */}
            <div className="absolute inset-x-1.5 bottom-1.5 z-20">
              <div className="rounded-2xl shadow-2xl overflow-hidden border border-black/10">
                {/* Header moderno de WhatsApp */}
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#008069]">
                  <div className="w-[22px] h-[22px] rounded-full bg-emerald-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">R</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold text-white leading-tight">Bodega Doña Rosa</p>
                    <p className="text-[7px] text-emerald-100 leading-tight">en línea · responde rápido</p>
                  </div>
                  <WhatsAppIcon className="w-3 h-3 text-emerald-200 shrink-0" />
                </div>

                {/* Mensajes — estilo WhatsApp actual */}
                <div className="px-2 py-2 space-y-1.5 bg-[#EFEAE2]">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[10px] rounded-tl-[3px] bg-white px-2 py-1 shadow-sm">
                      <p className="text-[8.5px] text-stone-800 leading-snug">¡Hola! 👋 ¿Tiene arroz de 5 kilos?</p>
                      <p className="text-[6.5px] text-[#667781] text-right">10:24</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-[10px] rounded-tr-[3px] bg-[#D9FDD3] px-2 py-1 shadow-sm">
                      <p className="text-[8.5px] text-stone-800 leading-snug">¡Sí queda! 🙌 Te lo dejo a <span className="font-bold">S/24.90</span></p>
                      <p className="text-[6.5px] text-[#667781] text-right">10:24 <span className="text-[#53BDEB] font-bold">✓✓</span></p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[10px] rounded-tl-[3px] bg-white px-2 py-1 shadow-sm">
                      <p className="text-[8.5px] text-stone-800 leading-snug">Perfecto, pago por <span className="font-bold">Yape</span> 💜</p>
                      <p className="text-[6.5px] text-[#667781] text-right">10:25</p>
                    </div>
                  </div>
                </div>

                {/* CTA del pedido */}
                <div className="px-2 pb-2 bg-[#EFEAE2]">
                  <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-[6px] shadow-sm">
                    <WhatsAppIcon className="w-3 h-3 text-white" />
                    <span className="text-[8.5px] font-bold text-white">Pedir por WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
