// Tabla de historial de cortes de caja con filtros por fecha y cajero
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRegisterHistory, getRegisterDetail } from '../api/corte-caja-api'
import Table from '../../../components/common/table'
import Badge from '../../../components/common/badge'
import Modal from '../../../components/common/modal'
import Button from '../../../components/common/button'

function DetalleCorte({ id, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['corte-detalle', id],
    queryFn: () => getRegisterDetail(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <p className="text-gray-500 text-sm text-center py-4">Cargando detalle...</p>
  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Cajero',            value: data.usuarios?.nombre },
          { label: 'Apertura',          value: new Date(data.fecha_apertura).toLocaleString('es-MX') },
          { label: 'Cierre',            value: data.fecha_cierre ? new Date(data.fecha_cierre).toLocaleString('es-MX') : '—' },
          { label: 'Fondo inicial',     value: `$${Number(data.monto_inicial).toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
        {[
          { label: 'Total ventas',     value: `$${Number(data.resumen_ventas?.total || 0).toFixed(2)}` },
          { label: 'Efectivo',         value: `$${Number(data.resumen_ventas?.efectivo || 0).toFixed(2)}` },
          { label: 'Tarjeta',          value: `$${Number(data.resumen_ventas?.tarjeta || 0).toFixed(2)}` },
          { label: 'Ventas confirmadas', value: data.total_ventas },
          { label: 'Ventas anuladas',  value: data.ventas_anuladas },
          { label: 'Monto esperado',   value: `$${Number(data.monto_esperado || 0).toFixed(2)}` },
          { label: 'Monto declarado',  value: `$${Number(data.monto_declarado || 0).toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3">
          <span className="font-semibold text-gray-700">Diferencia</span>
          <span className={`font-bold ${Number(data.diferencia) < 0 ? 'text-red-600' : Number(data.diferencia) > 0 ? 'text-green-600' : 'text-gray-700'}`}>
            {Number(data.diferencia) >= 0 ? '+' : ''}${Number(data.diferencia || 0).toFixed(2)}
          </span>
        </div>
      </div>
      <Button variant="secondary" onClick={onClose} className="w-full">Cerrar</Button>
    </div>
  )
}

export default function HistorialCortes() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [selectedId,  setSelectedId]  = useState(null)

  const params = {}
  if (fechaInicio) params.fechaInicio = fechaInicio
  if (fechaFin)    params.fechaFin    = fechaFin

  const { data: cortes = [], isLoading } = useQuery({
    queryKey: ['corte-caja-historial', params],
    queryFn: () => fetchRegisterHistory(params),
  })

  const columns = [
    { key: 'id_corte',       label: '#' },
    { key: 'cajero',         label: 'Cajero',  render: (r) => r.usuarios?.nombre },
    { key: 'fecha_apertura', label: 'Apertura', render: (r) => new Date(r.fecha_apertura).toLocaleDateString('es-MX') },
    { key: 'monto_esperado', label: 'Esperado', render: (r) => r.monto_esperado ? `$${Number(r.monto_esperado).toFixed(2)}` : '—' },
    { key: 'diferencia',     label: 'Diferencia',
      render: (r) => r.diferencia !== null
        ? <span className={Number(r.diferencia) < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
            {Number(r.diferencia) >= 0 ? '+' : ''}${Number(r.diferencia).toFixed(2)}
          </span>
        : '—'
    },
    { key: 'estado', label: 'Estado',
      render: (r) => <Badge color={r.estado === 'abierta' ? 'green' : 'gray'}>{r.estado}</Badge>
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => { setFechaInicio(''); setFechaFin('') }}>
          Limpiar
        </Button>
      </div>

      <Table
        columns={columns}
        data={cortes.map(c => ({ ...c, id: c.id_corte }))}
        isLoading={isLoading}
        onRowClick={(r) => setSelectedId(r.id_corte)}
      />

      <Modal isOpen={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Detalle del corte">
        <DetalleCorte id={selectedId} onClose={() => setSelectedId(null)} />
      </Modal>
    </div>
  )
}
