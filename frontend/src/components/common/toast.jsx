// Sistema de notificaciones toast global (escucha evento api:error)
import { useState, useEffect, useCallback } from 'react'

let toastId = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'error') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  // Escucha errores globales del api-client
  useEffect(() => {
    const handleApiError = (e) => addToast(e.detail.message, 'error')
    window.addEventListener('api:error', handleApiError)
    return () => window.removeEventListener('api:error', handleApiError)
  }, [addToast])

  // Permite lanzar toasts de exito desde cualquier parte
  useEffect(() => {
    const handleSuccess = (e) => addToast(e.detail.message, 'success')
    window.addEventListener('toast:success', handleSuccess)
    return () => window.removeEventListener('toast:success', handleSuccess)
  }, [addToast])

  const icons = {
    error:   '✕',
    success: '✓',
    info:    'ℹ',
  }

  const colors = {
    error:   'bg-red-600',
    success: 'bg-green-600',
    info:    'bg-blue-600',
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg min-w-64 max-w-sm ${colors[t.type]}`}>
          <span className="text-lg font-bold">{icons[t.type]}</span>
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-white/80 hover:text-white ml-2">✕</button>
        </div>
      ))}
    </div>
  )
}

// Funcion helper para lanzar toasts de exito desde cualquier componente
export function toastSuccess(message) {
  window.dispatchEvent(new CustomEvent('toast:success', { detail: { message } }))
}
