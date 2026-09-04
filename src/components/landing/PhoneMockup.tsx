'use client'

import Image from 'next/image'
import { WhatsAppIcon } from './WhatsAppIcon'

/**
 * Mockup de celular con chat de WhatsApp simulado (SOLO PRESENTACIONAL).
 * Concepto del Diseño 3 adaptado a la paleta terracota: el visitante ve
 * exactamente dónde ocurre la venta — el chat de WhatsApp con una
 * conversación real de pedido. Sin lógica, sin eventos, sin links.
 */
export function PhoneMockup() {
  return (
    <div className="relative w-[270px] sm:w-[300px] rounded-[2.5rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl shadow-stone-900/30 overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-b-2xl z-20" />

      {/* Pantalla: tienda demo real de bodega */}
      <div className="aspect-[9/16] bg-white overflow-hidden relative">
        <Image
          src="/templates/bodega-preview.png"
          alt="Tienda online de bodega creada con TiendApp con pedidos por WhatsApp"
          width={300}
          height={533}
          priority
          className="w-full h-full object-cover object-top"
        />

        {/* Overlay: chat de WhatsApp sobre la tienda (la venta ocurriendo en vivo) */}
        <div className="absolute inset-x-2 bottom-2 z-10">
          <div className="rounded-2xl bg-[#ECE5DD] shadow-xl overflow-hidden border border-black/5">
            {/* Header del chat */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#075E54]">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                M
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white leading-tight">Mercadito Doña María</p>
                <p className="text-[9px] text-emerald-100 leading-tight">en línea · responde rápido</p>
              </div>
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-200" />
            </div>

            {/* Mensajes */}
            <div className="px-2.5 py-2.5 space-y-1.5">
              {/* Cliente */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
                  <p className="text-[10px] text-stone-800 leading-snug">
                    ¡Hola! 👋 ¿Tienes arroz de 5 kilos?
                  </p>
                  <p className="text-[8px] text-stone-400 text-right">10:24</p>
                </div>
              </div>
              {/* Respuesta del negocio */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[#DCF8C6] px-2.5 py-1.5 shadow-sm">
                  <p className="text-[10px] text-stone-800 leading-snug">
                    ¡Sí! Quedan 8 🙌 Te los dejo a <span className="font-bold">S/25.90</span>
                  </p>
                  <p className="text-[8px] text-stone-400 text-right">10:24 ✓✓</p>
                </div>
              </div>
              {/* Cliente cierra */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
                  <p className="text-[10px] text-stone-800 leading-snug">
                    Perfecto, pago por <span className="font-bold">Yape</span> 💜
                  </p>
                  <p className="text-[8px] text-stone-400 text-right">10:25</p>
                </div>
              </div>
            </div>

            {/* Barra inferior: pedido por WhatsApp */}
            <div className="px-2.5 pb-2.5">
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 shadow-sm">
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold text-white">Pedir por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
