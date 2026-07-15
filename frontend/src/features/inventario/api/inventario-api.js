// Capa de acceso a la API de inventario
import apiClient from '../../../lib/api-client'

export const fetchInsumos = (params) => apiClient.get('/api/insumos', { params }).then(r => r.data)
export const fetchInsumoById = (id) => apiClient.get(`/api/insumos/${id}`).then(r => r.data)
export const createInsumo = (data) => apiClient.post('/api/insumos', data).then(r => r.data)
export const registerEntrada = (id, data) => apiClient.post(`/api/insumos/${id}/entradas`, data).then(r => r.data)
export const registerAjuste = (id, data) => apiClient.post(`/api/insumos/${id}/ajustes`, data).then(r => r.data)
export const fetchAlertas = () => apiClient.get('/api/insumos/alertas').then(r => r.data)
export const fetchMovimientos = (params) => apiClient.get('/api/insumos/movimientos', { params }).then(r => r.data)
