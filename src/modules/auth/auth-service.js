// Logica de autenticacion delegada a Supabase Auth
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session) {
    throw new AppError('Credenciales invalidas', 401);
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, rol, activo')
    .eq('usuario', email)
    .maybeSingle();

  if (usuarioError || !usuario) {
    throw new AppError('El usuario autenticado no existe en el sistema', 401);
  }

  if (!usuario.activo) {
    throw new AppError('El usuario esta inactivo', 401);
  }

  return {
    token: data.session.access_token,
    usuario: {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  };
}

export { login }
