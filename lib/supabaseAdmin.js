import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRole) {
  // This file is intended to be used server-side only. If env is missing, throw so it's obvious during dev.
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in environment')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)
