/**
 * Pruebas: Corte de caja (HU-13, HU-14, T-24, T-25, T-26, T-38)
 *
 * CORRECCION: makeChain ya no llama mockResolvedValue sobre eq ni order,
 * lo que rompía el encadenamiento doble .eq('x').eq('y').
 * Ahora eq siempre devuelve chain (continua), solo maybeSingle/single
 * resuelven la promesa.
 */

jest.mock('../src/config/supabase-client')

import supabase from '../src/config/supabase-client'
import {
  openCashRegister,
  closeCashRegister,
  getOpenCashRegister,
} from '../src/modules/cash-register/cash-register-service'

// Cadena Supabase donde los metodos de encadenamiento siempre devuelven
// el mismo objeto y solo los metodos terminales resuelven la promesa.
function makeChain(data, error = null) {
  const chain = {}
  chain.select      = jest.fn().mockReturnValue(chain)
  chain.insert      = jest.fn().mockReturnValue(chain)
  chain.update      = jest.fn().mockReturnValue(chain)
  chain.eq          = jest.fn().mockReturnValue(chain)  // encadena, no resuelve
  chain.gte         = jest.fn().mockReturnValue(chain)
  chain.lte         = jest.fn().mockReturnValue(chain)
  chain.order       = jest.fn().mockResolvedValue({ data, error })
  chain.single      = jest.fn().mockResolvedValue({ data, error })
  chain.maybeSingle = jest.fn().mockResolvedValue({ data, error })
  return chain
}

// Cadena especial para consultas de ventas dentro de closeCashRegister,
// que encadena dos .eq() y resuelve en el segundo
function makeVentasChain(ventasData) {
  const innerChain = {
    eq: jest.fn().mockResolvedValue({ data: ventasData, error: null }),
  }
  const outerChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnValue(innerChain),
  }
  return outerChain
}

// ─── openCashRegister ─────────────────────────────────────────────────────────
describe('openCashRegister — Apertura de caja (HU-13)', () => {

  test('crea un registro de caja con estado "abierta" y el monto inicial declarado', async () => {
    const fecha = new Date().toISOString()
    supabase.from
      // 1. Busca caja abierta previa → no hay
      .mockReturnValueOnce(makeChain(null))
      // 2. Insert de la nueva caja
      .mockReturnValueOnce(makeChain({
        id_corte: 1,
        id_usuario: 5,
        monto_inicial: 300,
        estado: 'abierta',
        fecha_apertura: fecha,
      }))

    const resultado = await openCashRegister(5, 300)

    expect(resultado.estado).toBe('abierta')
    expect(Number(resultado.monto_inicial)).toBe(300)
    expect(resultado.id_usuario).toBe(5)
  })

  test('incluye fecha_apertura en el registro de la caja', async () => {
    const fechaAntes = new Date().toISOString()
    const fechaCaja  = new Date().toISOString()

    supabase.from
      .mockReturnValueOnce(makeChain(null))
      .mockReturnValueOnce(makeChain({
        id_corte: 2,
        id_usuario: 3,
        monto_inicial: 0,
        estado: 'abierta',
        fecha_apertura: fechaCaja,
      }))

    const resultado = await openCashRegister(3, 0)
    const fechaDespues = new Date().toISOString()

    expect(resultado.fecha_apertura).toBeDefined()
    expect(resultado.fecha_apertura >= fechaAntes).toBe(true)
    expect(resultado.fecha_apertura <= fechaDespues).toBe(true)
  })

  test('permite abrir caja con monto inicial de $0', async () => {
    supabase.from
      .mockReturnValueOnce(makeChain(null))
      .mockReturnValueOnce(makeChain({ id_corte: 3, monto_inicial: 0, estado: 'abierta' }))

    const resultado = await openCashRegister(8, 0)
    expect(Number(resultado.monto_inicial)).toBe(0)
  })

  test('lanza AppError 409 si el cajero ya tiene una caja abierta', async () => {
    // Hay una caja abierta previa para el usuario
    supabase.from.mockReturnValueOnce(
      makeChain({ id_corte: 10, fecha_apertura: '2024-01-15T08:00:00Z', monto_inicial: 200 })
    )

    await expect(openCashRegister(5, 300)).rejects.toMatchObject({ statusCode: 409 })
  })

  test('el mensaje de error 409 incluye el id de la caja ya abierta', async () => {
    supabase.from.mockReturnValueOnce(
      makeChain({ id_corte: 77, fecha_apertura: '2024-06-01T09:00:00Z', monto_inicial: 500 })
    )

    const error = await openCashRegister(5, 100).catch(e => e)
    expect(error.statusCode).toBe(409)
    expect(error.message).toMatch(/77/)
  })

})

// ─── closeCashRegister ────────────────────────────────────────────────────────
describe('closeCashRegister — Cierre de caja (HU-14)', () => {

  test('calcula monto_esperado = monto_inicial + ventas en efectivo del turno', async () => {
    // Monto inicial: $200, ventas en efectivo: $150 + $80.50 = $230.50
    // Monto esperado: $430.50
    supabase.from
      .mockReturnValueOnce(makeChain({ id_corte: 1, id_usuario: 5, monto_inicial: '200.00', estado: 'abierta' }))
      .mockReturnValueOnce(makeVentasChain([{ monto_efectivo: '150.00' }, { monto_efectivo: '80.50' }]))
      .mockReturnValueOnce(makeChain({
        id_corte: 1,
        monto_inicial:   200.00,
        monto_esperado:  430.50,
        monto_declarado: 430.50,
        diferencia:      0,
        estado: 'cerrada',
      }))

    const resultado = await closeCashRegister(1, 5, 430.50, 'cajero')
    expect(Number(resultado.monto_esperado)).toBe(430.50)
    expect(resultado.estado).toBe('cerrada')
  })

  test('calcula diferencia negativa (faltante) cuando el cajero declara menos', async () => {
    supabase.from
      .mockReturnValueOnce(makeChain({ id_corte: 2, id_usuario: 5, monto_inicial: '500.00', estado: 'abierta' }))
      .mockReturnValueOnce(makeVentasChain([{ monto_efectivo: '300.00' }]))
      .mockReturnValueOnce(makeChain({
        monto_esperado:  800.00,
        monto_declarado: 750.00,
        diferencia:      -50.00,
        estado: 'cerrada',
      }))

    const resultado = await closeCashRegister(2, 5, 750.00, 'cajero')
    expect(Number(resultado.diferencia)).toBeLessThan(0)
    expect(Math.abs(Number(resultado.diferencia))).toBe(50.00)
  })

  test('calcula diferencia positiva (sobrante) cuando el cajero declara mas', async () => {
    supabase.from
      .mockReturnValueOnce(makeChain({ id_corte: 3, id_usuario: 5, monto_inicial: '100.00', estado: 'abierta' }))
      .mockReturnValueOnce(makeVentasChain([{ monto_efectivo: '200.00' }]))
      .mockReturnValueOnce(makeChain({
        monto_esperado:  300.00,
        monto_declarado: 315.00,
        diferencia:      15.00,
        estado: 'cerrada',
      }))

    const resultado = await closeCashRegister(3, 5, 315.00, 'cajero')
    expect(Number(resultado.diferencia)).toBeGreaterThan(0)
  })

  test('lanza AppError 409 si la caja ya estaba cerrada', async () => {
    supabase.from.mockReturnValueOnce(
      makeChain({ id_corte: 9, id_usuario: 5, estado: 'cerrada' })
    )
    await expect(closeCashRegister(9, 5, 100, 'cajero')).rejects.toMatchObject({ statusCode: 409 })
  })

  test('lanza AppError 404 si el corte no existe', async () => {
    supabase.from.mockReturnValueOnce(makeChain(null))
    await expect(closeCashRegister(999, 5, 100, 'cajero')).rejects.toMatchObject({ statusCode: 404 })
  })

  test('lanza AppError 403 si un cajero intenta cerrar la caja de otro cajero', async () => {
    // La caja pertenece al usuario 99, pero intenta cerrarla el usuario 7
    supabase.from.mockReturnValueOnce(
      makeChain({ id_corte: 5, id_usuario: 99, estado: 'abierta' })
    )
    await expect(closeCashRegister(5, 7, 200, 'cajero')).rejects.toMatchObject({ statusCode: 403 })
  })

  test('un administrador puede cerrar la caja de cualquier cajero', async () => {
    supabase.from
      // La caja pertenece al usuario 99, pero la cierra el admin (id=1)
      .mockReturnValueOnce(makeChain({ id_corte: 5, id_usuario: 99, monto_inicial: '100.00', estado: 'abierta' }))
      .mockReturnValueOnce(makeVentasChain([]))
      .mockReturnValueOnce(makeChain({
        id_corte: 5, monto_esperado: 100, monto_declarado: 100, diferencia: 0, estado: 'cerrada',
      }))

    await expect(closeCashRegister(5, 1, 100, 'administrador'))
      .resolves.toMatchObject({ estado: 'cerrada' })
  })

})

// ─── Trazabilidad ─────────────────────────────────────────────────────────────
describe('Trazabilidad — Operaciones quedan asociadas al usuario (T-38)', () => {

  test('openCashRegister asocia el id_usuario correcto al registro de caja', async () => {
    let datosInsertados = null

    supabase.from
      .mockReturnValueOnce(makeChain(null))
      .mockReturnValueOnce({
        insert: jest.fn().mockImplementation((data) => {
          datosInsertados = data
          return {
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ...data, id_corte: 1 },
              error: null,
            }),
          }
        }),
      })

    await openCashRegister(42, 500)

    expect(datosInsertados).not.toBeNull()
    expect(datosInsertados.id_usuario).toBe(42)
  })

  test('getOpenCashRegister devuelve null si el cajero no tiene caja abierta', async () => {
    supabase.from.mockReturnValueOnce(makeChain(null))
    const resultado = await getOpenCashRegister(5)
    expect(resultado).toBeNull()
  })

  test('getOpenCashRegister devuelve la caja activa del cajero', async () => {
    const cajaActiva = { id_corte: 8, id_usuario: 5, estado: 'abierta', monto_inicial: 250 }
    supabase.from.mockReturnValueOnce(makeChain(cajaActiva))

    const resultado = await getOpenCashRegister(5)
    expect(resultado).toEqual(cajaActiva)
    expect(resultado.estado).toBe('abierta')
  })

})
