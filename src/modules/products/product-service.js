// Servicio de productos: CRUD y gestion de recetas
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'

async function createProduct(payload) {
  const { data, error } = await supabase
    .from('productos')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new AppError(`No se pudo crear el producto: ${error.message}`, 400);
  }

  return data;
}

async function listProducts({ activo, categoria } = {}) {
  let query = supabase.from('productos').select('*');

  // Por defecto solo se muestran los productos activos
  if (!activo || activo === 'true') {
    query = query.eq('activo', true);
  } else if (activo === 'false') {
    query = query.eq('activo', false);
  }
  // activo=all devuelve todos sin filtro

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query.order('nombre');

  if (error) {
    throw new AppError('No se pudo obtener el listado de productos', 500);
  }

  return data;
}

async function getProductById(idProducto) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_producto', idProducto)
    .maybeSingle();

  if (error) {
    throw new AppError('No se pudo obtener el producto', 500);
  }

  if (!data) {
    throw new AppError('Producto no encontrado', 404);
  }

  return data;
}

async function updateProduct(idProducto, payload) {
  await getProductById(idProducto);

  const { data, error } = await supabase
    .from('productos')
    .update({ ...payload, fecha_actualizacion: new Date().toISOString() })
    .eq('id_producto', idProducto)
    .select()
    .single();

  if (error) {
    throw new AppError(`No se pudo actualizar el producto: ${error.message}`, 400);
  }

  return data;
}

async function deactivateProduct(idProducto) {
  await getProductById(idProducto);

  const { data, error } = await supabase
    .from('productos')
    .update({ activo: false, fecha_actualizacion: new Date().toISOString() })
    .eq('id_producto', idProducto)
    .select()
    .single();

  if (error) {
    throw new AppError('No se pudo desactivar el producto', 500);
  }

  return data;
}

async function getProductRecipe(idProducto) {
  await getProductById(idProducto);

  const { data, error } = await supabase
    .from('receta')
    .select('id_receta, cantidad_requerida, insumos(id_insumo, nombre, unidad_medida)')
    .eq('id_producto', idProducto);

  if (error) {
    throw new AppError('No se pudo obtener la receta del producto', 500);
  }

  return data;
}

async function setProductRecipe(idProducto, insumos) {
  await getProductById(idProducto);

  // Verifica que todos los insumos existan antes de guardar
  const ids = insumos.map((i) => i.id_insumo);
  const { data: existingInsumos, error: insumosError } = await supabase
    .from('insumos')
    .select('id_insumo')
    .in('id_insumo', ids);

  if (insumosError) {
    throw new AppError('Error al validar los insumos de la receta', 500);
  }

  if (existingInsumos.length !== ids.length) {
    const foundIds = existingInsumos.map((i) => i.id_insumo);
    const missing = ids.filter((id) => !foundIds.includes(id));
    throw new AppError(`Los siguientes insumos no existen: ${missing.join(', ')}`, 400);
  }

  // Reemplaza la receta completa (delete + insert para simplificar)
  const { error: deleteError } = await supabase
    .from('receta')
    .delete()
    .eq('id_producto', idProducto);

  if (deleteError) {
    throw new AppError('No se pudo actualizar la receta del producto', 500);
  }

  const rows = insumos.map((i) => ({
    id_producto: Number(idProducto),
    id_insumo: i.id_insumo,
    cantidad_requerida: i.cantidad_requerida,
  }));

  const { data, error } = await supabase.from('receta').insert(rows).select();

  if (error) {
    throw new AppError(`No se pudo guardar la receta: ${error.message}`, 400);
  }

  return data;
}

export { createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  getProductRecipe,
  setProductRecipe, }
