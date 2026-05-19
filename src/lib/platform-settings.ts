import { db } from '@/lib/db'

// Cache settings for 60 seconds to avoid hitting DB on every SSR request
let cachedSettings: Record<string, string> | null = null
let cacheExpiry = 0

const DEFAULTS: Record<string, string> = {
  name: 'TiendApp',
  contactEmail: 'hola@tiendapp.pe',
  contactPhone: '+51999888777',
}

export async function getPlatformContact(): Promise<{ contactEmail: string; contactPhone: string }> {
  const now = Date.now()
  if (cachedSettings && now < cacheExpiry) {
    return {
      contactEmail: cachedSettings.contactEmail || DEFAULTS.contactEmail,
      contactPhone: cachedSettings.contactPhone || DEFAULTS.contactPhone,
    }
  }

  try {
    const dbSettings = await db.platformSetting.findMany({
      where: { key: { in: ['contactEmail', 'contactPhone'] } },
    })
    const settings: Record<string, string> = { ...DEFAULTS }
    for (const s of dbSettings) {
      settings[s.key] = s.value
    }
    cachedSettings = settings
    cacheExpiry = now + 60_000 // 60 seconds
    return {
      contactEmail: settings.contactEmail || DEFAULTS.contactEmail,
      contactPhone: settings.contactPhone || DEFAULTS.contactPhone,
    }
  } catch {
    return {
      contactEmail: DEFAULTS.contactEmail,
      contactPhone: DEFAULTS.contactPhone,
    }
  }
}
