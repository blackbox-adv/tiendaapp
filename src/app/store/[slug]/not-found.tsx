import Link from 'next/link'

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tienda no encontrada</h2>
        <p className="text-gray-600 mb-6">
          La tienda que buscas no existe o ha sido desactivada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
