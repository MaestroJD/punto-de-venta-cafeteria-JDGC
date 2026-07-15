// Badge que muestra el numero de insumos con stock bajo en el sidebar
import { useAlertas } from '../hooks/use-inventario'
import { useAuth } from '../../../context/auth-context'

export default function AlertaStockBajo() {
  const { user } = useAuth()
  // Solo se consulta si el usuario puede ver inventario
  const canSee = ['administrador', 'inventario'].includes(user?.rol)
  const { data: alertas = [] } = useAlertas()

  if (!canSee || alertas.length === 0) return null

  return (
    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
      {alertas.length > 9 ? '9+' : alertas.length}
    </span>
  )
}
