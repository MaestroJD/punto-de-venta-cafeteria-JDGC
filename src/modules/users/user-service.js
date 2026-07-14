// Servicio de usuarios: alta, consulta, listado y desactivacion
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'

async function createUser({ nombre, rol, usuario, password }) {
  // Se crea primero el usuario en Supabase Auth para poder iniciar sesion
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: usuario,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw new AppError(`No se pudo crear el usuario en autenticacion: ${authError.message}`, 400);
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert({ nombre, rol, usuario, password_hash: 'managed_by_supabase_auth' })
    .select()
    .single();

  if (error) {
    // Si falla la insercion en la tabla de negocio, se revierte el usuario de auth
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new AppError(`No se pudo crear el usuario: ${error.message}`, 400);
  }

  return data;
}

async function listUsers({ activo } = {}) {
  let query = supabase.from('usuarios').select('id_usuario, nombre, rol, usuario, activo, fecha_creacion');

  if (activo === 'true') {
    query = query.eq('activo', true);
  } else if (activo === 'false') {
    query = query.eq('activo', false);
  }

  const { data, error } = await query.order('fecha_creacion', { ascending: false });

  if (error) {
    throw new AppError('No se pudo obtener el listado de usuarios', 500);
  }

  return data;
}

async function getUserById(idUsuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, rol, usuario, activo, fecha_creacion')
    .eq('id_usuario', idUsuario)
    .maybeSingle();

  if (error) {
    throw new AppError('No se pudo obtener el usuario', 500);
  }

  if (!data) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return data;
}

async function deactivateUser(idUsuario) {
  await getUserById(idUsuario);

  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id_usuario', idUsuario)
    .select()
    .single();

  if (error) {
    throw new AppError('No se pudo desactivar el usuario', 500);
  }

  return data;
}

export { createUser, listUsers, getUserById, deactivateUser }
