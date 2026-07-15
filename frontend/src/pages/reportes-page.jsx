// Pagina de reportes de ventas con filtros y descarga CSV
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
import Table from '../components/common/table'
import Badge from '../components/common/badge'
import Button from '../components/common/button'
import { fetchSalesReport, downloadSalesReportCsv } from '../features/reportes/api/reportes-api'

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [buscar,      setBuscar]      = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const params = {}
  if (fechaInicio) params.fechaInicio = fechaInicio
  if (fechaFin)    params.fechaFin    = fechaFin

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ['reporte-ventas', params],
    queryFn: () => fetchSalesReport(params),
    enabled: buscar,
  })

  const handleBuscar = () => setBuscar(true)
  const handleLimpiar = () => { setFechaInicio(''); setFechaFin(''); setBuscar(false) }
  const handleCSV = async () => {
    setIsDownloading(true)
    try { await downloadSalesReportCsv(params) }
    finally { setIsDownloading(false) }
  }

  // Calcula totales por metodo de pago
  const confirmadas = Array.isArray(ventas) ? ventas.filter(v => v.estado === 'confirmada') : []
  const totalEfectivo = confirmadas.reduce((s, v) => s + Number(v.monto_efectivo || 0), 0)
  const totalTarjeta  = confirmadas.reduce((s, v) => s + Number(v.monto_tarjeta  || 0), 0)
  const totalGeneral  = confirmadas.reduce((s, v) => s + Number(v.total || 0), 0)

  const columns = [
    { key: 'id_venta',    label: 'Folio',   render: (r) => `#${r.id_venta}` },
    { key: 'fecha_venta', label: 'Fecha',   render: (r) => new Date(r.fecha_venta).toLocaleString('es-MX') },
    { key: 'cajero',      label: 'Cajero',  render: (r) => r.usuarios?.nombre },
    { key: 'total',       label: 'Total',   render: (r) => `$${Number(r.total).toFixed(2)}` },
    { key: 'metodo_pago', label: 'Metodo',  render: (r) => <span className="capitalize">{r.metodo_pago}</span> },
    { key: 'estado',      label: 'Estado',
      render: (r) => <Badge color={r.estado === 'confirmada' ? 'green' : 'red'}>{r.estado}</Badge>
    },
  ]

  return (
    <MainLayout title="Reportes">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros de reporte</h3>
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
            <Button onClick={handleBuscar}>Ver reporte</Button>
            <Button variant="secondary" onClick={handleLimpiar}>Limpiar</Button>
            <Button variant="ghost" isLoading={isDownloading} onClick={handleCSV}>⬇ Descargar CSV</Button>
          </div>
        </div>

        {/* Tabla */}
        {buscar && (
          <>
            <Table
              columns={columns}
              data={Array.isArray(ventas) ? ventas.map(v => ({ ...v, id: v.id_venta })) : []}
              isLoading={isLoading}
            />

            {/* Totales */}
            {!isLoading && confirmadas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del periodo</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total efectivo', value: totalEfectivo, color: 'text-green-700' },
                    { label: 'Total tarjeta',  value: totalTarjeta,  color: 'text-blue-700' },
                    { label: 'Total general',  value: totalGeneral,  color: 'text-gray-900' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-gray-50 rounded-lg py-3">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className={`text-xl font-bold mt-1 ${color}`}>${value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!buscar && (
          <div className="flex items-center justify-center py-20 text-gray-300">
            <div className="text-center">
              <span className="text-6xl">📊</span>
              <p className="mt-3 text-sm">Selecciona un rango de fechas y haz clic en "Ver reporte"</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
