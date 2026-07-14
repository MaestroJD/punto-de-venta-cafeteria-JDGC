// Servicio de corte de caja: apertura, cierre, historial y detalle
import supabase from '../../config/supabase-client.js'
import AppError from '../../utils/app-error.js'
import { calculateCashDifference, roundMoney } from '../../utils/calculations.js'

async function openCashRegister(idUsuario, montoInicial) {
  // Verifica que el usuario no tenga ya una caja abierta
  const { data: cajaAbierta, error: buscarError } = await supabase
    .from('corte_caja')
    .select('id_corte, fecha_apertura, monto_inicial')
    .eq('id_usuario', idUsuario)
    .eq('estado', 'abierta')
    .maybeSingle();

  if (buscarError) {
    throw new AppError('Error al verificar el estado de la caja', 500);
  }

  if (cajaAbierta) {
    throw new AppError(
      `Ya tienes una caja abierta (id: ${cajaAbierta.id_corte}, abierta el ${cajaAbierta.fecha_apertura})`,
      409
    );
  }

  const { data, error } = await supabase
    .from('corte_caja')
    .insert({ id_usuario: idUsuario, monto_inicial: montoInicial, estado: 'abierta' })
    .select()
    .single();

  if (error) {
    throw new AppError(`No se pudo abrir la caja: ${error.message}`, 400);
  }

  return data;
}

async function closeCashRegister(idCorte, idUsuario, montoDeclarado, userRole) {
  const { data: corte, error: corteError } = await supabase
    .from('corte_caja')
    .select('*')
    .eq('id_corte', idCorte)
    .maybeSingle();

  if (corteError || !corte) {
    throw new AppError('Corte de caja no encontrado', 404);
  }

  // Solo el cajero dueno o un administrador puede cerrar la caja
  if (corte.id_usuario !== idUsuario && userRole !== 'administrador') {
    throw new AppError('No tienes permiso para cerrar esta caja', 403);
  }

  if (corte.estado === 'cerrada') {
    throw new AppError('Esta caja ya fue cerrada', 409);
  }

  // Suma las ventas en efectivo del turno para calcular el monto esperado
  const { data: ventas, error: ventasError } = await supabase
    .from('ventas')
    .select('monto_efectivo')
    .eq('id_corte', idCorte)
    .eq('estado', 'confirmada');

  if (ventasError) {
    throw new AppError('No se pudo calcular el monto esperado de la caja', 500);
  }

  const totalEfectivoVentas = ventas.reduce((sum, v) => sum + Number(v.monto_efectivo), 0);
  const montoEsperado = roundMoney(Number(corte.monto_inicial) + totalEfectivoVentas);
  const diferencia = calculateCashDifference(montoEsperado, montoDeclarado);

  const { data, error } = await supabase
    .from('corte_caja')
    .update({
      monto_esperado: montoEsperado,
      monto_declarado: montoDeclarado,
      diferencia,
      fecha_cierre: new Date().toISOString(),
      estado: 'cerrada',
    })
    .eq('id_corte', idCorte)
    .select()
    .single();

  if (error) {
    throw new AppError(`No se pudo cerrar la caja: ${error.message}`, 500);
  }

  return data;
}

async function getCashRegisterById(idCorte) {
  const { data: corte, error } = await supabase
    .from('corte_caja')
    .select('*, usuarios(nombre)')
    .eq('id_corte', idCorte)
    .maybeSingle();

  if (error || !corte) {
    throw new AppError('Corte de caja no encontrado', 404);
  }

  // Detalle de ventas del turno agrupado por metodo de pago
  const { data: ventas, error: ventasError } = await supabase
    .from('ventas')
    .select('total, metodo_pago, monto_efectivo, monto_tarjeta, estado')
    .eq('id_corte', idCorte);

  if (ventasError) {
    throw new AppError('No se pudo obtener el detalle de ventas del corte', 500);
  }

  const resumenPorMetodo = ventas
    .filter((v) => v.estado === 'confirmada')
    .reduce(
      (acc, v) => {
        acc.efectivo = roundMoney(acc.efectivo + Number(v.monto_efectivo));
        acc.tarjeta = roundMoney(acc.tarjeta + Number(v.monto_tarjeta));
        acc.total = roundMoney(acc.total + Number(v.total));
        return acc;
      },
      { efectivo: 0, tarjeta: 0, total: 0 }
    );

  return {
    ...corte,
    resumen_ventas: resumenPorMetodo,
    total_ventas: ventas.filter((v) => v.estado === 'confirmada').length,
    ventas_anuladas: ventas.filter((v) => v.estado === 'anulada').length,
  };
}

async function listCashRegisters({ fechaInicio, fechaFin, idUsuario } = {}) {
  let query = supabase
    .from('corte_caja')
    .select('*, usuarios(nombre)')
    .order('fecha_apertura', { ascending: false });

  if (fechaInicio) query = query.gte('fecha_apertura', fechaInicio);
  if (fechaFin) query = query.lte('fecha_apertura', fechaFin);
  if (idUsuario) query = query.eq('id_usuario', idUsuario);

  const { data, error } = await query;

  if (error) {
    throw new AppError('No se pudo obtener el historial de cortes de caja', 500);
  }

  return data;
}

async function getOpenCashRegister(idUsuario) {
  const { data, error } = await supabase
    .from('corte_caja')
    .select('*')
    .eq('id_usuario', idUsuario)
    .eq('estado', 'abierta')
    .maybeSingle();

  if (error) {
    throw new AppError('Error al verificar la caja abierta', 500);
  }

  return data;
}

export { openCashRegister,
  closeCashRegister,
  getCashRegisterById,
  listCashRegisters,
  getOpenCashRegister, }
