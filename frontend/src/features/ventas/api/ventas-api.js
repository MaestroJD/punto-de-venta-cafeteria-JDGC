// Capa de acceso a la API de ventas
import apiClient from '../../../lib/api-client'

export const createSale       = (data) => apiClient.post('/api/ventas', data).then(r => r.data)
export const voidSale         = (id)   => apiClient.post(`/api/ventas/${id}/anular`).then(r => r.data)
export const getSaleTicket    = (id)   => apiClient.get(`/api/ventas/${id}/ticket`).then(r => r.data)
export const fetchSalesReport = (params) => apiClient.get('/api/ventas/reportes/ventas', { params }).then(r => r.data)
