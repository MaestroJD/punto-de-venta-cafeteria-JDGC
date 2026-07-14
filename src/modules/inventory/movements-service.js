// Servicio interno de movimientos de inventario: descuento por venta y reversion por anulacion
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'

async function checkStockSufficiency(items) {
  const productIds = items.map((i) => Number(i.id_producto));

  const { data: recetas, error } = await supabase
    .from('receta')
    .select('id_producto, id_insumo, cantidad_requerida, insumos(id_insumo, nombre, stock_actual)')
    .in('id_producto', productIds);

  if (error) {
    throw new AppError('No se pudo verificar el inventario antes de la venta', 500);
  }

  const consumoTotal = {};
  for (const item of items) {
    const lineasReceta = recetas.filter((r) => r.id_producto === Number(item.id_producto));
    for (const linea of lineasReceta) {
      const idInsumo = linea.id_insumo;
      const consumo = linea.cantidad_requerida * item.cantidad;
      if (!consumoTotal[idInsumo]) {
        consumoTotal[idInsumo] = {
          nombre: linea.insumos.nombre,
          stockActual: Number(linea.insumos.stock_actual),
          requerido: 0,
        };
      }
      consumoTotal[idInsumo].requerido += consumo;
    }
  }

  const insuficientes = Object.entries(consumoTotal)
    .filter(([, v]) => v.requerido > v.stockActual)
    .map(([, v]) => `${v.nombre} (disponible: ${v.stockActual}, requerido: ${v.requerido})`);

  if (insuficientes.length > 0) {
    throw new AppError(`Stock insuficiente para: ${insuficientes.join('; ')}`, 400);
  }

  return consumoTotal;
}

async function deductBySale(idVenta, idUsuario, items) {
  const consumoTotal = await checkStockSufficiency(items);

  for (const [idInsumo, datos] of Object.entries(consumoTotal)) {
    const nuevoStock = datos.stockActual - datos.requerido;

    const { error: updateError } = await supabase
      .from('insumos')
      .update({ stock_actual: nuevoStock })
      .eq('id_insumo', idInsumo);

    if (updateError) {
      throw new AppError(`No se pudo descontar el insumo ${datos.nombre}`, 500);
    }

    const { error: movError } = await supabase.from('movimientos_inventario').insert({
      id_insumo: Number(idInsumo),
      id_usuario: idUsuario,
      tipo_movimiento: 'salida_venta',
      cantidad: -datos.requerido,
      motivo: `Descuento automatico por venta #${idVenta}`,
      id_venta: idVenta,
    });

    if (movError) {
      throw new AppError('No se pudo registrar el movimiento de inventario', 500);
    }
  }
}

async function revertByVoidedSale(idVenta, idUsuario) {
  const { data: movimientos, error } = await supabase
    .from('movimientos_inventario')
    .select('id_insumo, cantidad, insumos(stock_actual, nombre)')
    .eq('id_venta', idVenta)
    .eq('tipo_movimiento', 'salida_venta');

  if (error) {
    throw new AppError('No se pudieron obtener los movimientos de la venta a revertir', 500);
  }

  for (const mov of movimientos) {
    const stockRestaurado = Number(mov.insumos.stock_actual) + Math.abs(Number(mov.cantidad));

    const { error: updateError } = await supabase
      .from('insumos')
      .update({ stock_actual: stockRestaurado })
      .eq('id_insumo', mov.id_insumo);

    if (updateError) {
      throw new AppError(`No se pudo revertir el stock del insumo ${mov.insumos.nombre}`, 500);
    }

    const { error: movError } = await supabase.from('movimientos_inventario').insert({
      id_insumo: mov.id_insumo,
      id_usuario: idUsuario,
      tipo_movimiento: 'entrada',
      cantidad: Math.abs(Number(mov.cantidad)),
      motivo: `Reversion por anulacion de venta #${idVenta}`,
      id_venta: idVenta,
    });

    if (movError) {
      throw new AppError('No se pudo registrar el movimiento de reversion', 500);
    }
  }
}

export { checkStockSufficiency, deductBySale, revertByVoidedSale }
