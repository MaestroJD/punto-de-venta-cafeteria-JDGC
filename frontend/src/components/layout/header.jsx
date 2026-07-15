// Encabezado con nombre del usuario y boton de logout
import { useAuth } from '../../context/auth-context'
import Button from '../common/button'

export default function Header({ title }) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.nombre}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          Salir
        </Button>
      </div>
    </header>
  )
}
