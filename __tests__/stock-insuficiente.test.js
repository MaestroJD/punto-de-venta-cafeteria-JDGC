/**
 * Pruebas: Stock insuficiente al vender (HU-05, HU-10, T-22, T-35)
 *
 * CORRECCION: mockChain ya no llama mockResolvedValue sobre select,
 * lo que rompía la cadena .select().in(). Ahora:
 *   - select  → mockReturnValue(chain)  (continúa la cadena)
 *   - eq      → mockReturnValue(chain)  (continúa la cadena)
 *   - in      → mockResolvedValue(...)  (termina la cadena, resuelve datos)
 */

jest.mock('../src/config/supabase-client')

import supabase from '../src/config/supabase-client'
import { checkStockSufficiency, deductBySale } from '../src/modules/inventory/movements-service'
import AppError from '../src/utils/app-error'

// Construye una cadena Supabase mock donde cada metodo de encadenamiento
// devuelve el mismo objeto (chain), y solo los metodos terminales resuelven.
function mockChain(resolvedValue) {
  const chain = {}
  chain.select      = jest.fn().mockReturnValue(chain)
  chain.eq          = jest.fn().mockReturnValue(chain)
  chain.insert      = jest.fn().mockReturnValue(chain)
  chain.update      = jest.fn().mockReturnValue(chain)
  chain.order       = jest.fn().mockReturnValue(chain)
  // Metodos terminales: resuelven la promesa
  chain.in          = jest.fn().mockResolvedValue(resolvedValue)
  chain.single      = jest.fn().mockResolvedValue(resolvedValue)
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue)
  return chain
}

// ─── checkStockSufficiency ────────────────────────────────────────────────────
describe('checkStockSufficiency — Validacion de stock antes de vender', () => {

  test('no lanza error cuando hay stock suficiente para todos los insumos', async () => {
    supabase.from.mockReturnValue(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 0.02,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '1.000' },
        },
        {
          id_producto: 1,
          id_insumo: 2,
          cantidad_requerida: 0.15,
          insumos: { id_insumo: 2, nombre: 'Leche', stock_actual: '2.000' },
        },
      ],
      error: null,
    }))

    // 2 capuchinos: consume 0.04 kg cafe y 0.30 l leche — hay stock
    const items = [{ id_producto: 1, cantidad: 2 }]
    await expect(checkStockSufficiency(items)).resolves.toBeDefined()
  })

  test('lanza AppError 400 cuando un insumo no tiene stock suficiente', async () => {
    // Solo hay 0.01 kg de cafe, la receta requiere 0.02 kg por unidad
    supabase.from.mockReturnValue(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 0.02,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.010' },
        },
      ],
      error: null,
    }))

    await expect(checkStockSufficiency([{ id_producto: 1, cantidad: 1 }]))
      .rejects.toMatchObject({
        message: expect.stringContaining('Cafe molido'),
        statusCode: 400,
      })
  })

  test('permite la venta cuando el stock disponible es exactamente igual al requerido', async () => {
    // Stock: 0.04 kg. Requerido para 2 unidades: 2 × 0.02 = 0.04 kg — limite exacto
    supabase.from.mockReturnValue(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 0.02,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.040' },
        },
      ],
      error: null,
    }))

    await expect(checkStockSufficiency([{ id_producto: 1, cantidad: 2 }]))
      .resolves.toBeDefined()
  })

  test('acumula el consumo cuando varios productos usan el mismo insumo', async () => {
    // Dos productos comparten cafe molido: 0.02 + 0.03 = 0.05 — stock exacto
    supabase.from.mockReturnValue(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 0.02,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.050' },
        },
        {
          id_producto: 2,
          id_insumo: 1,
          cantidad_requerida: 0.03,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.050' },
        },
      ],
      error: null,
    }))

    const items = [
      { id_producto: 1, cantidad: 1 },
      { id_producto: 2, cantidad: 1 },
    ]
    await expect(checkStockSufficiency(items)).resolves.toBeDefined()
  })

  test('el mensaje de error menciona todos los insumos insuficientes', async () => {
    supabase.from.mockReturnValue(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 0.5,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.100' },
        },
        {
          id_producto: 1,
          id_insumo: 2,
          cantidad_requerida: 0.3,
          insumos: { id_insumo: 2, nombre: 'Leche', stock_actual: '0.050' },
        },
      ],
      error: null,
    }))

    const error = await checkStockSufficiency([{ id_producto: 1, cantidad: 1 }]).catch(e => e)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toContain('Cafe molido')
    expect(error.message).toContain('Leche')
    expect(error.statusCode).toBe(400)
  })

  test('lanza AppError 500 si Supabase devuelve un error al consultar recetas', async () => {
    supabase.from.mockReturnValue(mockChain({ data: null, error: { message: 'Connection refused' } }))

    await expect(checkStockSufficiency([{ id_producto: 1, cantidad: 1 }]))
      .rejects.toMatchObject({ statusCode: 500 })
  })

})

// ─── deductBySale ─────────────────────────────────────────────────────────────
describe('deductBySale — Descuento automatico de inventario al confirmar venta', () => {

  test('descuenta el stock correcto y registra movimiento salida_venta', async () => {
    supabase.from
      // 1. checkStockSufficiency → consulta receta
      .mockReturnValueOnce(mockChain({
        data: [
          {
            id_producto: 1,
            id_insumo: 1,
            cantidad_requerida: 0.02,
            insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '1.000' },
          },
        ],
        error: null,
      }))
      // 2. update de stock en insumos
      .mockReturnValueOnce(mockChain({ data: {}, error: null }))
      // 3. insert de movimiento_inventario
      .mockReturnValueOnce(mockChain({ data: {}, error: null }))

    const items = [{ id_producto: 1, cantidad: 1 }]
    await expect(deductBySale(42, 7, items)).resolves.toBeUndefined()

    // Verifica que se consultó receta, luego insumos, luego movimientos
    expect(supabase.from).toHaveBeenCalledWith('receta')
    expect(supabase.from).toHaveBeenCalledWith('insumos')
    expect(supabase.from).toHaveBeenCalledWith('movimientos_inventario')
  })

  test('no altera el inventario cuando el stock es insuficiente', async () => {
    supabase.from.mockReturnValueOnce(mockChain({
      data: [
        {
          id_producto: 1,
          id_insumo: 1,
          cantidad_requerida: 1.0,
          insumos: { id_insumo: 1, nombre: 'Cafe molido', stock_actual: '0.100' },
        },
      ],
      error: null,
    }))

    await expect(deductBySale(99, 7, [{ id_producto: 1, cantidad: 1 }]))
      .rejects.toMatchObject({ statusCode: 400 })

    // El update de insumos NO debe haberse llamado tras el fallo de stock
    const tablas = supabase.from.mock.calls.map(c => c[0])
    expect(tablas).not.toContain('insumos')
  })

})
