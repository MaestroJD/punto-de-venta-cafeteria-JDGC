// Capa de acceso a la API de productos
import apiClient from '../../../lib/api-client'

export const fetchProducts = (params) => apiClient.get('/api/productos', { params }).then(r => r.data)
export const fetchProductById = (id) => apiClient.get(`/api/productos/${id}`).then(r => r.data)
export const createProduct = (data) => apiClient.post('/api/productos', data).then(r => r.data)
export const updateProduct = (id, data) => apiClient.put(`/api/productos/${id}`, data).then(r => r.data)
export const deactivateProduct = (id) => apiClient.patch(`/api/productos/${id}/desactivar`).then(r => r.data)
export const fetchRecipe = (id) => apiClient.get(`/api/productos/${id}/receta`).then(r => r.data)
export const saveRecipe = (id, insumos) => apiClient.post(`/api/productos/${id}/receta`, { insumos }).then(r => r.data)
