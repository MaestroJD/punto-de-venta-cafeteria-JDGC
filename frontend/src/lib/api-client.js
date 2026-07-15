// Cliente HTTP centralizado con interceptores de autenticacion y errores
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token JWT en cada peticion
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normaliza respuestas y maneja errores globales
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error || 'Error de conexion con el servidor'

    // Redirige al login si el token expiro
    if (status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    // Emite evento global de error para el sistema de notificaciones
    window.dispatchEvent(new CustomEvent('api:error', { detail: { message, status } }))

    return Promise.reject({ message, status })
  }
)

export default apiClient
