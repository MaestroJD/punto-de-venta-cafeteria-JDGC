// Cliente de Supabase inicializado con la service role key (uso exclusivo del backend)
import { createClient } from '@supabase/supabase-js'
import env from './env.js'

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase
