// Servicio de ventas: registro, anulacion, ticket y reportes
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'
import { deductBySale, revertByVoidedSale } from '../inventory/movements-service.js'
import { roundMoney } from '../../utils/calculations.js'

async function createSale({ id_corte, metodo_pago, monto_efectivo, monto_tarjeta, items }, idUsuario) {
  // Verifica que la caja este abierta
  const { data: corte, error: corteError } = await supabase
    .from('corte_caja')
    .select('id_corte, estado')
    .eq('id_corte', id_corte)
    .maybeSingle();

  if (corteError || !corte) {
    throw new AppError('El corte de caja especificado no existe', 404);
  }

  if (corte.estado !== 'abierta') {
    throw new AppError('No se pueden registrar ventas en una caja cerrada', 409);
  }

  // Obtiene precio actual de cada producto y valida que esten activos
  const productIds = items.map((i) => i.id_producto);

  const { data: productos, error: productosError } = await supabase
    .from('productos')
    .select('id_producto, nombre, precio, activo')
    .in('id_producto', productIds);

  if (productosError) {
    throw new AppError('Error al obtener los productos de la venta', 500);
  }

  const inactivos = [];
  for (const item of items) {
    const producto = productos.find((p) => p.id_producto === item.id_producto);
    if (!producto) {
      throw new AppError(`El producto con id ${item.id_producto} no existe`, 404);
    }
    if (!producto.activo) {
      inactivos.push(producto.nombre);
    }
  }

  if (inactivos.length > 0) {
    throw new AppError(`Los siguientes productos estan inactivos: ${inactivos.join(', ')}`, 400);
  }

  // Calcula el total de la venta con precio historico
  let total = 0;
  const detalles = items.map((item) => {
    const producto = productos.find((p) => p.id_producto === item.id_producto);
    const subtotal = roundMoney(Number(producto.precio) * item.cantidad);
    total = roundMoney(total + subtotal);
    return {
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: Number(producto.precio),
      subtotal,
    };
  });

  // Valida que los montos de pago coincidan con el total
  const sumaPagos = roundMoney(Number(monto_efectivo) + Number(monto_tarjeta));
  if (sumaPagos !== total) {
    throw new AppError(
      `La suma de los montos de pago (${sumaPagos}) no coincide con el total de la venta (${total})`,
      400
    );
  }

  // Registra la venta principal
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      id_usuario: idUsuario,
      id_corte: id_corte,
      total,
      metodo_pago,
      monto_efectivo: Number(monto_efectivo),
      monto_tarjeta: Number(monto_tarjeta),
      estado: 'confirmada',
    })
    .select()
    .single();

  if (ventaError) {
    throw new AppError(`No se pudo registrar la venta: ${ventaError.message}`, 500);
  }

  // Inserta el detalle de la venta
  const detallesConVenta = detalles.map((d) => ({ ...d, id_venta: venta.id_venta }));
  const { error: detalleError } = await supabase.from('detalle_venta').insert(detallesConVenta);

  if (detalleError) {
    throw new AppError('No se pudo guardar el detalle de la venta', 500);
  }

  // Descuenta inventario (si algun producto tiene receta asociada)
  await deductBySale(venta.id_venta, idUsuario, items);

  return { ...venta, detalle: detallesConVenta };
}

async function voidSale(idVenta, idUsuario, userRole) {
  const { data: venta, error } = await supabase
    .from('ventas')
    .select('*, corte_caja(estado)')
    .eq('id_venta', idVenta)
    .maybeSingle();

  if (error || !venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  if (venta.estado === 'anulada') {
    throw new AppError('Esta venta ya fue anulada', 409);
  }

  // Anular venta de un turno cerrado requiere rol administrador
  if (venta.corte_caja.estado === 'cerrada' && userRole !== 'administrador') {
    throw new AppError(
      'Se requiere autorizacion de administrador para anular ventas de turnos cerrados',
      403
    );
  }

  const { data: ventaAnulada, error: updateError } = await supabase
    .from('ventas')
    .update({ estado: 'anulada' })
    .eq('id_venta', idVenta)
    .select()
    .single();

  if (updateError) {
    throw new AppError('No se pudo anular la venta', 500);
  }

  // Revierte el inventario consumido por la venta
  await revertByVoidedSale(idVenta, idUsuario);

  return ventaAnulada;
}

async function getSaleTicket(idVenta) {
  const { data: venta, error } = await supabase
    .from('ventas')
    .select('*, usuarios(nombre), detalle_venta(*, productos(nombre))')
    .eq('id_venta', idVenta)
    .maybeSingle();

  if (error || !venta) {
    throw new AppError('Venta no encontrada', 404);
  }

  return {
    folio: venta.id_venta,
    fecha: venta.fecha_venta,
    cajero: venta.usuarios?.nombre,
    estado: venta.estado,
    metodo_pago: venta.metodo_pago,
    monto_efectivo: venta.monto_efectivo,
    monto_tarjeta: venta.monto_tarjeta,
    total: venta.total,
    productos: venta.detalle_venta.map((d) => ({
      nombre: d.productos.nombre,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.subtotal,
    })),
  };
}

async function getSalesReport({ fechaInicio, fechaFin, idProducto, categoria, idUsuario, formato } = {}) {
  let query = supabase
    .from('ventas')
    .select('id_venta, fecha_venta, total, metodo_pago, estado, usuarios(nombre), detalle_venta(cantidad, precio_unitario, subtotal, productos(nombre, categoria))')
    .order('fecha_venta', { ascending: false });

  if (fechaInicio) query = query.gte('fecha_venta', fechaInicio);
  if (fechaFin) query = query.lte('fecha_venta', fechaFin);
  if (idUsuario) query = query.eq('id_usuario', idUsuario);

  const { data, error } = await query;

  if (error) {
    throw new AppError('No se pudo generar el reporte de ventas', 500);
  }

  // Filtra por producto o categoria en memoria ya que son datos de relacion anidada
  let resultado = data;
  if (idProducto || categoria) {
    resultado = data.filter((v) =>
      v.detalle_venta.some((d) => {
        if (idProducto && d.productos && d.productos.id_producto === Number(idProducto)) return true;
        if (categoria && d.productos && d.productos.categoria === categoria) return true;
        return false;
      })
    );
  }

  if (formato === 'csv') {
    const filas = [];
    filas.push('folio,fecha,cajero,producto,cantidad,precio_unitario,subtotal,total_venta,metodo_pago,estado');
    for (const v of resultado) {
      for (const d of v.detalle_venta) {
        filas.push(
          [
            v.id_venta,
            v.fecha_venta,
            v.usuarios?.nombre || '',
            d.productos?.nombre || '',
            d.cantidad,
            d.precio_unitario,
            d.subtotal,
            v.total,
            v.metodo_pago,
            v.estado,
          ].join(',')
        );
      }
    }
    return filas.join('\n');
  }

  return resultado;
}

export { createSale, voidSale, getSaleTicket, getSalesReport }
