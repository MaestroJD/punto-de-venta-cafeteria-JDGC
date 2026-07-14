// Carga y valida las variables de entorno requeridas por la aplicacion
import 'dotenv/config'

const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(', ')}`
    )
  }
}

validateEnv()

const env = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
}

export default env
