'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TermsPage() {
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
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones</h1>
          </div>
          <p className="text-sm text-gray-400 mb-8">Última actualización: Abril 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
              <p className="text-gray-600 leading-relaxed">
                Al acceder y utilizar la plataforma TiendApp (en adelante, &quot;el Servicio&quot;), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice nuestro Servicio. Estos términos aplican a todos los usuarios, incluidos visitantes, dueños de tiendas y administradores.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descripción del Servicio</h2>
              <p className="text-gray-600 leading-relaxed">
                TiendApp es una plataforma SaaS que permite a emprendedores y pequeños negocios crear y gestionar su tienda online en Perú. El Servicio incluye la creación de tiendas virtuales, gestión de productos, integración con WhatsApp para atención al cliente, y herramientas de análisis y administración. Los planes de suscripción se describen en la página de precios y pueden variar según la disponibilidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cuentas de Usuario</h2>
              <p className="text-gray-600 leading-relaxed">
                Para utilizar ciertas funciones del Servicio, debe crear una cuenta. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. TiendApp no se hace responsable por el uso no autorizado de su cuenta. Debe proporcionar información veraz y actualizada al registrarse. No está permitido crear múltiples cuentas con el objetivo de evadir las limitaciones del plan gratuito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Contenido del Usuario</h2>
              <p className="text-gray-600 leading-relaxed">
                Usted es el único responsable del contenido que publica en su tienda, incluyendo pero no limitándose a descripciones de productos, imágenes, precios y datos de contacto. Se compromete a no publicar contenido ilegal, fraudulento, difamatorio o que infrinja derechos de terceros. TiendApp se reserva el derecho de eliminar contenido que viole estos términos sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Pagos y Suscripciones</h2>
              <p className="text-gray-600 leading-relaxed">
                Los planes de pago se facturan de forma mensual o anual según la opción seleccionada. Los pagos se procesan a través de pasarelas de pago autorizadas. Las suscripciones se renuevan automáticamente al finalizar el periodo de facturación. Puede cancelar su suscripción en cualquier momento desde su panel de control. No se ofrecen reembolsos parciales por periodos ya facturados, salvo en casos excepcionales a discreción de TiendApp.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Propiedad Intelectual</h2>
              <p className="text-gray-600 leading-relaxed">
                Todo el contenido de la plataforma TiendApp, incluyendo pero no limitándose al diseño, logos, código fuente, textos y elementos gráficos, es propiedad de TiendApp y está protegido por las leyes de propiedad intelectual. El uso de plantillas y herramientas proporcionadas por TiendApp no otorga ningún derecho de propiedad sobre las mismas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitación de Responsabilidad</h2>
              <p className="text-gray-600 leading-relaxed">
                TiendApp proporciona el Servicio &quot;tal cual&quot; sin garantías de ningún tipo. No nos hacemos responsables por pérdidas de datos, interrupciones del servicio, o daños derivados del uso de la plataforma. Nuestra responsabilidad total no excederá el monto pagado por el usuario en los últimos 12 meses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contacto</h2>
              <p className="text-gray-600 leading-relaxed">
                Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos a través de: Email: hola@tiendapp.pe, Teléfono: +51 999 888 777, o a través de nuestro formulario de contacto.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
