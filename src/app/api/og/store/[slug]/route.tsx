import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-response'

export const runtime = 'nodejs'
// Las redes sociales cachean agresivamente; 1 hora de freshness es suficiente
export const revalidate = 3600

// GET /api/og/store/[slug] - Tarjeta Open Graph dinámica por tienda (1200x630).
// Usada en og:image y JSON-LD de /store/[slug] para que al compartir la tienda
// por WhatsApp/Facebook se vea una tarjeta de marca con el nombre y color de la tienda.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // El preflight CORS (OPTIONS) lo resuelve el middleware para todas las rutas /api/*

  const { slug } = await params
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return apiError('Slug inválido', 400, undefined, request)
  }

  let name = 'TiendApp'
  let description = 'Catálogo online con pedidos por WhatsApp'
  let primaryColor = '#7C3AED'
  try {
    const store = await db.store.findUnique({
      where: { slug },
      select: { name: true, description: true, primaryColor: true, isActive: true },
    })
    if (store && store.isActive) {
      name = store.name
      description = store.description || description
      // Validar que el color sea un hex válido para evitar inyección en CSS
      if (/^#[0-9a-fA-F]{6}$/.test(store.primaryColor || '')) {
        primaryColor = store.primaryColor
      }
    }
  } catch {
    // Si la BD falla, devolvemos la tarjeta genérica de TiendApp (mejor que un 500)
  }

  const safeDescription = description.length > 120 ? `${description.slice(0, 117)}...` : description
  const safeName = name.length > 40 ? `${name.slice(0, 37)}...` : name

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 55%, #ede9fe 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: '4px solid #ffffff',
                }}
              />
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: '#1e1b2e' }}>TiendApp</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 84, fontWeight: 700, color: '#17122b', lineHeight: 1.05 }}>
              {safeName}
            </div>
            <div style={{ fontSize: 34, color: '#4b4763', lineHeight: 1.3 }}>{safeDescription}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                backgroundColor: primaryColor,
                color: '#ffffff',
                fontSize: 30,
                fontWeight: 600,
                padding: '18px 34px',
                borderRadius: 999,
              }}
            >
              Ver catálogo online
            </div>
            <div style={{ fontSize: 26, color: '#8b87a0' }}>Pedidos por WhatsApp</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch {
    return apiError('No se pudo generar la imagen', 500, undefined, request)
  }
}
