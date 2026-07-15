// Carrito de venta: lineas, metodo de pago y confirmacion
import { useState } from 'react'
import Button from '../../../components/common/button'

const METODOS = ['efectivo', 'tarjeta', 'mixto']

export default function CarritoVenta({ items, total, onRemove, onUpdateCantidad, onConfirmar, isPending, isCajaAbierta }) {
  const [metodoPago, setMetodoPago]       = useState('efectivo')
  const [montoEfectivo, setMontoEfectivo] = useState('')
  const [montoTarjeta, setMontoTarjeta]   = useState('')
  const [pagoError, setPagoError]         = useState('')

  const handleConfirmar = () => {
    setPagoError('')
    let efectivo = 0
    let tarjeta  = 0

    if (metodoPago === 'efectivo') { efectivo = total; tarjeta = 0 }
    else if (metodoPago === 'tarjeta') { efectivo = 0; tarjeta = total }
    else {
      efectivo = parseFloat(montoEfectivo) || 0
      tarjeta  = parseFloat(montoTarjeta)  || 0
      const suma = Math.round((efectivo + tarjeta) * 100) / 100
      if (suma !== Math.round(total * 100) / 100) {
        setPagoError(`La suma ($${suma.toFixed(2)}) no coincide con el total ($${total.toFixed(2)})`)
        return
      }
    }

    onConfirmar({ metodoPago, montoEfectivo: efectivo, montoTarjeta: tarjeta })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Carrito</h3>
        <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
      </div>

      {/* Lista de items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-300">
            <span className="text-4xl">🛒</span>
            <p className="text-sm mt-2">Agrega productos</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id_producto} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                <p className="text-xs text-gray-400">${item.precio_unitario.toFixed(2)} c/u</p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateCantidad(item.id_producto, item.cantidad - 1)}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold flex items-center justify-center">
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center">{item.cantidad}</span>
                <button onClick={() => onUpdateCantidad(item.id_producto, item.cantidad + 1)}
                  className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-bold flex items-center justify-center">
                  +
                </button>
              </div>

              <p className="text-sm font-bold text-gray-800 w-16 text-right">
                ${(item.precio_unitario * item.cantidad).toFixed(2)}
              </p>

              <button onClick={() => onRemove(item.id_producto)}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg ml-1">
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Total y pago */}
      <div className="border-t border-gray-100 px-4 py-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Total</span>
          <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>

        {/* Selector metodo de pago */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {METODOS.map((m) => (
            <button key={m} onClick={() => { setMetodoPago(m); setPagoError('') }}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors capitalize
                ${metodoPago === m ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Campos de pago mixto */}
        {metodoPago === 'mixto' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">Efectivo</label>
              <input type="number" step="0.01" min="0" value={montoEfectivo}
                onChange={(e) => { setMontoEfectivo(e.target.value); setPagoError('') }}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">Tarjeta</label>
              <input type="number" step="0.01" min="0" value={montoTarjeta}
                onChange={(e) => { setMontoTarjeta(e.target.value); setPagoError('') }}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00" />
            </div>
          </div>
        )}

        {pagoError && <p className="text-xs text-red-600">{pagoError}</p>}

        {!isCajaAbierta && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
            ⚠️ Debes abrir una caja antes de registrar ventas
          </p>
        )}

        <Button
          onClick={handleConfirmar}
          isLoading={isPending}
          disabled={items.length === 0 || !isCajaAbierta}
          className="w-full"
          size="lg"
        >
          Confirmar venta
        </Button>
      </div>
    </div>
  )
}
