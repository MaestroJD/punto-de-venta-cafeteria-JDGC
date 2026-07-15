// Barra lateral con navegacion filtrada segun el rol del usuario
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import AlertaStockBajo from '../../features/inventario/components/alerta-stock-bajo'

const navItems = [
  { to: '/ventas',     label: 'Punto de Venta', icon: '🛒', roles: ['cajero', 'administrador'] },
  { to: '/productos',  label: 'Productos',       icon: '📦', roles: ['administrador'] },
  { to: '/inventario', label: 'Inventario',       icon: '🗃️', roles: ['administrador', 'inventario'] },
  { to: '/corte-caja', label: 'Corte de Caja',   icon: '💰', roles: ['cajero', 'administrador'] },
  { to: '/reportes',   label: 'Reportes',         icon: '📊', roles: ['administrador'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.rol))

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-widest">ITH Sistemas</p>
        <h1 className="text-lg font-bold text-orange-400 mt-0.5">POS Cafetería</h1>
      </div>

      {/* Navegacion */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${isActive
                ? 'bg-orange-500 text-white font-medium'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {/* Badge de alertas solo en inventario */}
            {item.to === '/inventario' && <AlertaStockBajo />}
          </NavLink>
        ))}
      </nav>

      {/* Info de rol */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
        <p className="text-xs text-gray-500 truncate">{user?.nombre}</p>
      </div>
    </aside>
  )
}
