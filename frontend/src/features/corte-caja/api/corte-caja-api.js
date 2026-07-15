// Capa de acceso a la API de corte de caja
import apiClient from '../../../lib/api-client'

export const openCashRegister  = (data)  => apiClient.post('/api/corte-caja/apertura', data).then(r => r.data)
export const closeCashRegister = (id, data) => apiClient.post(`/api/corte-caja/${id}/cierre`, data).then(r => r.data)
export const getMyOpenRegister = ()      => apiClient.get('/api/corte-caja/mi-caja').then(r => r.data)
export const getRegisterDetail = (id)   => apiClient.get(`/api/corte-caja/${id}`).then(r => r.data)
export const fetchRegisterHistory = (params) => apiClient.get('/api/corte-caja', { params }).then(r => r.data)
