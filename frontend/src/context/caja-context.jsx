// Contexto global del estado de la caja registradora del cajero activo
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/api-client'
import { useAuth } from './auth-context'

const CajaContext = createContext(null)

export function CajaProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cajaActual, setCajaActual] = useState(null)
  const [isLoadingCaja, setIsLoadingCaja] = useState(false)

  // Consulta si hay una caja abierta al iniciar sesion
  const fetchCajaAbierta = useCallback(async () => {
    setIsLoadingCaja(true)
    try {
      const res = await apiClient.get('/api/corte-caja/mi-caja')
      setCajaActual(res.data || null)
    } catch {
      setCajaActual(null)
    } finally {
      setIsLoadingCaja(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchCajaAbierta()
    else setCajaActual(null)
  }, [isAuthenticated, fetchCajaAbierta])

  const abrirCaja = useCallback((caja) => setCajaActual(caja), [])
  const cerrarCaja = useCallback(() => setCajaActual(null), [])
  const isCajaAbierta = Boolean(cajaActual)

  return (
    <CajaContext.Provider value={{ cajaActual, isCajaAbierta, isLoadingCaja, abrirCaja, cerrarCaja, fetchCajaAbierta }}>
      {children}
    </CajaContext.Provider>
  )
}

export function useCaja() {
  const ctx = useContext(CajaContext)
  if (!ctx) throw new Error('useCaja debe usarse dentro de CajaProvider')
  return ctx
}
