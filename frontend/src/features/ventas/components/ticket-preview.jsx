// Vista previa del ticket de venta con opcion de impresion
import Button from '../../../components/common/button'

export default function TicketPreview({ ticket, onClose }) {
  if (!ticket) return null

  const handlePrint = () => window.print()

  return (
    <div>
      {/* Contenido del ticket (visible en impresion) */}
      <div id="ticket-print" className="font-mono text-sm space-y-2">
        <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
          <p className="font-bold text-base">POS CAFETERIA — ITH</p>
          <p className="text-xs text-gray-500">Ticket de venta</p>
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          <p><span className="font-semibold">Folio:</span> #{ticket.folio}</p>
          <p><span className="font-semibold">Fecha:</span> {new Date(ticket.fecha).toLocaleString('es-MX')}</p>
          <p><span className="font-semibold">Cajero:</span> {ticket.cajero}</p>
        </div>

        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-1">
          {ticket.productos.map((p, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="flex-1 text-left">
                {p.nombre} <span className="text-gray-400">x{p.cantidad}</span>
              </span>
              <span className="font-medium">${Number(p.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 pt-3 mt-3 space-y-1">
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL</span>
            <span>${Number(ticket.total).toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 capitalize">Pago: {ticket.metodo_pago}</p>
          {Number(ticket.monto_efectivo) > 0 && (
            <p className="text-xs text-gray-500">Efectivo: ${Number(ticket.monto_efectivo).toFixed(2)}</p>
          )}
          {Number(ticket.monto_tarjeta) > 0 && (
            <p className="text-xs text-gray-500">Tarjeta: ${Number(ticket.monto_tarjeta).toFixed(2)}</p>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 border-t border-dashed border-gray-300 pt-3 mt-3">
          <p>¡Gracias por su compra!</p>
        </div>
      </div>

      {/* Botones (ocultos en impresion) */}
      <div className="flex gap-3 mt-6 print:hidden">
        <Button onClick={handlePrint} variant="secondary" className="flex-1">🖨️ Imprimir</Button>
        <Button onClick={onClose} className="flex-1">Nueva venta</Button>
      </div>
    </div>
  )
}
