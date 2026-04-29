'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrivacyPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
          </div>
          <p className="text-sm text-gray-400 mb-8">Última actualización: Abril 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Información que Recopilamos</h2>
              <p className="text-gray-600 leading-relaxed">
                En TiendApp recopilamos información necesaria para brindar nuestros servicios. Al crear una cuenta, solicitamos su nombre, correo electrónico y contraseña. Cuando crea una tienda, almacenamos información sobre su negocio, productos y configuraciones. También recopilamos datos de uso automáticamente, como su dirección IP, tipo de navegador, páginas visitadas y tiempos de sesión, mediante cookies y tecnologías similares.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cómo Usamos su Información</h2>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos la información recopilada para prestar y mejorar nuestros servicios, incluyendo la creación y gestión de tiendas online, procesamiento de pagos, atención al cliente, envío de notificaciones relevantes sobre su cuenta, análisis de uso para mejorar la plataforma, y prevención de fraudes y actividades no autorizadas. No vendemos ni compartimos su información personal con terceros con fines comerciales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compartir Información con Terceros</h2>
              <p className="text-gray-600 leading-relaxed">
                Podemos compartir información limitada con proveedores de servicios esenciales para el funcionamiento de la plataforma, como procesadores de pagos (Culqi, Niubiz), servicios de almacenamiento en la nube (Supabase), y herramientas de análisis. También podemos divulgar información cuando sea requerido por ley, en respuesta a una orden judicial, o para proteger los derechos y la seguridad de TiendApp y sus usuarios. En ningún caso compartimos sus datos personales para fines de marketing de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Almacenamiento y Seguridad</h2>
              <p className="text-gray-600 leading-relaxed">
                Sus datos se almacenan en servidores seguros de Supabase con encriptación en tránsito y en reposo. Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo autenticación con JWT, validación de entradas, protección contra ataques XSS y CSRF, limitación de solicitudes, y monitoreo continuo de accesos. A pesar de nuestros esfuerzos, ningún sistema es completamente seguro y no podemos garantizar la seguridad absoluta de sus datos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento de la plataforma, como la sesión de usuario y preferencias. También podemos usar cookies de análisis para comprender cómo los usuarios interactúan con nuestro servicio. Puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad de ciertas características de TiendApp. No utilizamos cookies de publicidad de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Sus Derechos</h2>
              <p className="text-gray-600 leading-relaxed">
                Usted tiene derecho a acceder, corregir, actualizar o eliminar su información personal en cualquier momento desde la configuración de su cuenta. Puede solicitar la exportación de sus datos en formato legible. También puede solicitar la eliminación total de su cuenta y todos los datos asociados. Para ejercer estos derechos, puede contactarnos directamente o utilizar las herramientas disponibles en su panel de control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Retención de Datos</h2>
              <p className="text-gray-600 leading-relaxed">
                Conservamos sus datos personales mientras su cuenta esté activa o según sea necesario para prestar nuestros servicios. Si elimina su cuenta, eliminaremos sus datos personales en un plazo de 30 días hábiles, excepto aquellos que debamos conservar por obligaciones legales o para resolver disputas. Los datos anónimos y agregados pueden conservarse indefinidamente con fines analíticos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Privacidad de los Clientes de Tiendas</h2>
              <p className="text-gray-600 leading-relaxed">
                Cuando un cliente interactúa con una tienda creada en TiendApp (por ejemplo, al enviar un mensaje por WhatsApp), la información compartida es entre el cliente y el dueño de la tienda. TiendApp actúa como intermediario técnico y no almacena ni procesa las conversaciones de WhatsApp. Los dueños de tiendas son responsables de cumplir con sus propias políticas de privacidad respecto a los datos de sus clientes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Menores de Edad</h2>
              <p className="text-gray-600 leading-relaxed">
                TiendApp no está diseñada para menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que un menor nos ha proporcionado datos personales, los eliminaremos de inmediato. Si usted es padre o tutor y cree que su hijo ha usado nuestro servicio, contáctenos para solicitar la eliminación de sus datos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Cambios a esta Política</h2>
              <p className="text-gray-600 leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por requisitos legales. Le notificaremos sobre cambios significativos a través de correo electrónico o un aviso visible en la plataforma. El uso continuado del servicio después de dichos cambios constituye su aceptación de la política actualizada. Le recomendamos revisar esta página periódicamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contacto</h2>
              <p className="text-gray-600 leading-relaxed">
                Si tiene preguntas, preocupaciones o solicitudes relacionadas con esta Política de Privacidad, puede contactarnos a través de: Email: privacidad@tiendapp.pe, WhatsApp: +51 999 888 777, o mediante nuestro formulario de contacto. Responderemos a su solicitud en un plazo máximo de 5 días hábiles.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
