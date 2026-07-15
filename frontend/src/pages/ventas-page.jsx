// Pagina principal del punto de venta: grid de productos + carrito
import { useState } from 'react'
import MainLayout from '../components/layout/main-layout'
import ProductoCard from '../features/ventas/components/producto-card'
import CarritoVenta from '../features/ventas/components/carrito-venta'
import TicketPreview from '../features/ventas/components/ticket-preview'
import Modal from '../components/common/modal'
import { useProductos } from '../features/productos/hooks/use-productos'
import { useCarrito, useCreateSale } from '../features/ventas/hooks/use-ventas'
import { getSaleTicket } from '../features/ventas/api/ventas-api'
import { useCaja } from '../context/caja-context'
import { toastSuccess } from '../components/common/toast'

export default function VentasPage() {
  const { cajaActual, isCajaAbierta } = useCaja()
  const [catFilter, setCatFilter]     = useState('')
  const [ticket, setTicket]           = useState(null)
  const [showTicket, setShowTicket]   = useState(false)

  const { data: productos = [], isLoading } = useProductos({ activo: 'true' })
  const { items, addItem, removeItem, updateCantidad, clearCart, total } = useCarrito()
  const saleMutation = useCreateSale()

  const categorias = [...new Set(productos.map((p) => p.categoria))]

  const filteredProducts = catFilter
    ? productos.filter((p) => p.categoria === catFilter)
    : productos

  const handleConfirmar = async ({ metodoPago, montoEfectivo, montoTarjeta }) => {
    if (!isCajaAbierta) return
    const payload = {
      id_corte:       cajaActual.id_corte,
      metodo_pago:    metodoPago,
      monto_efectivo: montoEfectivo,
      monto_tarjeta:  montoTarjeta,
      items: items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
    }
    try {
      const venta = await saleMutation.mutateAsync(payload)
      toastSuccess('Venta registrada correctamente')
      // Obtiene el ticket completo
      const ticketData = await getSaleTicket(venta.id_venta)
      setTicket(ticketData)
      setShowTicket(true)
      clearCart()
    } catch {
      // El error ya es manejado por el interceptor global
    }
  }

  return (
    <MainLayout title="Punto de Venta">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">

        {/* Grid de productos */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filtros por categoria */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setCatFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${!catFilter ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Todos
            </button>
            {categorias.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${catFilter === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-300">
                <div className="text-center">
                  <span className="text-5xl">📦</span>
                  <p className="text-sm mt-2">No hay productos disponibles</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((p) => (
                  <ProductoCard key={p.id_producto} producto={p} onAdd={addItem} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carrito lateral */}
        <div className="w-80 flex-shrink-0">
          <CarritoVenta
            items={items}
            total={total}
            onRemove={removeItem}
            onUpdateCantidad={updateCantidad}
            onConfirmar={handleConfirmar}
            isPending={saleMutation.isPending}
            isCajaAbierta={isCajaAbierta}
          />
        </div>
      </div>

      {/* Modal de ticket */}
      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Ticket de venta" size="sm">
        <TicketPreview ticket={ticket} onClose={() => setShowTicket(false)} />
      </Modal>
    </MainLayout>
  )
}
