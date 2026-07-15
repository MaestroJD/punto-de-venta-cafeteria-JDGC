// Capa de acceso a la API de reportes
import apiClient from '../../../lib/api-client'

export const fetchSalesReport = (params) =>
  apiClient.get('/api/ventas/reportes/ventas', { params }).then(r => r.data)

// Descarga el reporte en CSV directamente disparando la descarga en el navegador
export async function downloadSalesReportCsv(params) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/ventas/reportes/ventas?${new URLSearchParams({ ...params, formato: 'csv' })}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('pos_token')}` } }
  )
  if (!response.ok) throw new Error('No se pudo generar el reporte CSV')
  const blob = await response.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `reporte-ventas.csv`
  a.click()
  URL.revokeObjectURL(url)
}
