// Valida el JWT de Supabase Auth enviado en el header Authorization y adjunta el usuario a req.user
import supabase from '../config/supabase-client.js'
import AppError from '../utils/app-error.js'
import asyncHandler from '../utils/async-handler.js'

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('No se proporciono un token de autenticacion valido', 401)
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authData?.user) {
    throw new AppError('Token de autenticacion invalido o expirado', 401)
  }

  // Se asume que la columna "usuario" de la tabla usuarios almacena el correo
  // utilizado para iniciar sesion en Supabase Auth
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, rol, activo')
    .eq('usuario', authData.user.email)
    .maybeSingle()

  if (usuarioError) {
    throw new AppError('Error al validar el usuario autenticado', 500)
  }

  if (!usuario || !usuario.activo) {
    throw new AppError('El usuario no existe o esta inactivo', 401)
  }

  req.user = {
    id: usuario.id_usuario,
    name: usuario.nombre,
    role: usuario.rol,
  }

  return next()
})

export default authMiddleware
