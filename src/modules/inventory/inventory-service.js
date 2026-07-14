// Servicio de insumos: CRUD, entradas, ajustes y alertas de stock bajo
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'

async function createInsumo(payload) {
  const { data, error } = await supabase
    .from('insumos')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new AppError(`No se pudo crear el insumo: ${error.message}`, 400);
  }

  return data;
}

async function listInsumos({ stockBajo } = {}) {
  let query = supabase.from('insumos').select('*').eq('activo', true);

  const { data, error } = await query.order('nombre');

  if (error) {
    throw new AppError('No se pudo obtener el listado de insumos', 500);
  }

  // Filtro de stock bajo aplicado en memoria para reutilizar la misma funcion
  if (stockBajo === 'true') {
    return data.filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo));
  }

  return data;
}

async function getInsumoById(idInsumo) {
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .eq('id_insumo', idInsumo)
    .maybeSingle();

  if (error) {
    throw new AppError('No se pudo obtener el insumo', 500);
  }

  if (!data) {
    throw new AppError('Insumo no encontrado', 404);
  }

  return data;
}

async function registerEntrada(idInsumo, idUsuario, { cantidad, motivo }) {
  const insumo = await getInsumoById(idInsumo);
  const nuevoStock = Number(insumo.stock_actual) + cantidad;

  const { error: updateError } = await supabase
    .from('insumos')
    .update({ stock_actual: nuevoStock })
    .eq('id_insumo', idInsumo);

  if (updateError) {
    throw new AppError('No se pudo actualizar el stock del insumo', 500);
  }

  const { data: mov, error: movError } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_insumo: Number(idInsumo),
      id_usuario: idUsuario,
      tipo_movimiento: 'entrada',
      cantidad,
      motivo: motivo || 'Entrada manual de inventario',
    })
    .select()
    .single();

  if (movError) {
    throw new AppError('No se pudo registrar el movimiento de entrada', 500);
  }

  return { ...mov, stock_actual: nuevoStock };
}

async function registerAjuste(idInsumo, idUsuario, { cantidad, motivo }) {
  const insumo = await getInsumoById(idInsumo);
  const nuevoStock = Number(insumo.stock_actual) + cantidad;

  if (nuevoStock < 0) {
    throw new AppError(
      `El ajuste dejaria el stock en negativo (stock actual: ${insumo.stock_actual}, ajuste: ${cantidad})`,
      400
    );
  }

  const { error: updateError } = await supabase
    .from('insumos')
    .update({ stock_actual: nuevoStock })
    .eq('id_insumo', idInsumo);

  if (updateError) {
    throw new AppError('No se pudo aplicar el ajuste al stock', 500);
  }

  const { data: mov, error: movError } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_insumo: Number(idInsumo),
      id_usuario: idUsuario,
      tipo_movimiento: 'ajuste',
      cantidad,
      motivo,
    })
    .select()
    .single();

  if (movError) {
    throw new AppError('No se pudo registrar el movimiento de ajuste', 500);
  }

  return { ...mov, stock_actual: nuevoStock };
}

async function getLowStockAlerts() {
  const { data, error } = await supabase
    .from('insumos')
    .select('id_insumo, nombre, unidad_medida, stock_actual, stock_minimo')
    .eq('activo', true)
    .lte('stock_actual', supabase.raw ? null : undefined);

  // Supabase no soporta comparacion entre columnas directamente en el cliente,
  // se usa una consulta raw via rpc o se filtra en memoria
  const { data: todos, error: err2 } = await supabase
    .from('insumos')
    .select('id_insumo, nombre, unidad_medida, stock_actual, stock_minimo')
    .eq('activo', true);

  if (err2) {
    throw new AppError('No se pudieron obtener las alertas de stock', 500);
  }

  return todos.filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo));
}

async function listMovimientos({ idInsumo, tipo } = {}) {
  let query = supabase
    .from('movimientos_inventario')
    .select('*, insumos(nombre), usuarios(nombre)')
    .order('fecha_movimiento', { ascending: false });

  if (idInsumo) query = query.eq('id_insumo', idInsumo);
  if (tipo) query = query.eq('tipo_movimiento', tipo);

  const { data, error } = await query;

  if (error) {
    throw new AppError('No se pudo obtener el historial de movimientos', 500);
  }

  return data;
}

export { createInsumo,
  listInsumos,
  getInsumoById,
  registerEntrada,
  registerAjuste,
  getLowStockAlerts,
  listMovimientos, }
