// Protege rutas por autenticacion y rol
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Acceso denegado</h3>
          <p className="text-gray-500">No tienes permiso para ver esta seccion.</p>
        </div>
      </div>
    )
  }

  return children
}
