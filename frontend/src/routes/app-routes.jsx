// Configuracion central de rutas con proteccion por autenticacion y rol
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/layout/protected-route'
import LoginPage      from '../pages/login-page'
import VentasPage     from '../pages/ventas-page'
import ProductosPage  from '../pages/productos-page'
import InventarioPage from '../pages/inventario-page'
import CorteCajaPage  from '../pages/corte-caja-page'
import ReportesPage   from '../pages/reportes-page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/ventas" element={
        <ProtectedRoute allowedRoles={['cajero', 'administrador']}>
          <VentasPage />
        </ProtectedRoute>
      } />

      <Route path="/productos" element={
        <ProtectedRoute allowedRoles={['administrador']}>
          <ProductosPage />
        </ProtectedRoute>
      } />

      <Route path="/inventario" element={
        <ProtectedRoute allowedRoles={['administrador', 'inventario']}>
          <InventarioPage />
        </ProtectedRoute>
      } />

      <Route path="/corte-caja" element={
        <ProtectedRoute allowedRoles={['cajero', 'administrador']}>
          <CorteCajaPage />
        </ProtectedRoute>
      } />

      <Route path="/reportes" element={
        <ProtectedRoute allowedRoles={['administrador']}>
          <ReportesPage />
        </ProtectedRoute>
      } />

      {/* Redirige la raiz al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
