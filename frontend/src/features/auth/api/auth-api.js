// Capa de acceso a la API de autenticacion
import apiClient from '../../../lib/api-client'

export async function login(email, password) {
  const res = await apiClient.post('/api/auth/login', { email, password })
  return res.data
}
