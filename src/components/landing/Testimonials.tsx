'use client'

import { motion } from 'framer-motion'
import { TESTIMONIALS } from '@/lib/landing-testimonials'
import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Testimonios</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Miles de emprendedores peruanos ya confían en TiendApp para hacer crecer sus negocios.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-violet-100 transition-all duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-violet-100" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-violet-100 flex-shrink-0">
                  {t.avatar.startsWith('http') ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  {/* Fallback initials if image fails to load */}
                  <div
                    className="w-full h-full flex items-center justify-center text-sm font-bold text-violet-600"
                    style={{ display: t.avatar.startsWith('http') ? 'none' : 'flex' }}
                  >
                    {t.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">"{t.comment}"</p>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-violet-600 font-medium">{t.storeName}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
