import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    // Try SUPABASE_URL first, then fall back to NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(`Missing Supabase config: ${!supabaseUrl ? 'SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL' : ''} ${!supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`)
    }
    console.log('[SUPABASE] Initializing client with URL:', supabaseUrl.substring(0, 30) + '...')
    _supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _supabase
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop)
  }
})
