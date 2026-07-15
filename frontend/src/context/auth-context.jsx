// Contexto global de autenticacion: sesion, rol y funciones de login/logout
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api-client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Recupera la sesion guardada al recargar la pagina
  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user')
    const storedToken = localStorage.getItem('pos_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Escucha el evento de token expirado emitido por api-client
  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      navigate('/login')
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [navigate])

  const login = useCallback(async (email, password) => {
    const res = await apiClient.post('/api/auth/login', { email, password })
    const { token, usuario } = res.data
    localStorage.setItem('pos_token', token)
    localStorage.setItem('pos_user', JSON.stringify(usuario))
    setUser(usuario)
    return usuario
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const isAuthenticated = Boolean(user)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
