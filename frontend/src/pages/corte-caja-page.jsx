// Pagina de corte de caja con apertura, cierre e historial
import MainLayout from '../components/layout/main-layout'
import AperturaCajaForm from '../features/corte-caja/components/apertura-caja-form'
import CierreCajaForm from '../features/corte-caja/components/cierre-caja-form'
import HistorialCortes from '../features/corte-caja/components/historial-cortes'
import { useCaja } from '../context/caja-context'
import { useAuth } from '../context/auth-context'

export default function CorteCajaPage() {
  const { isCajaAbierta, isLoadingCaja } = useCaja()
  const { user } = useAuth()
  const isAdmin = user?.rol === 'administrador'

  return (
    <MainLayout title="Corte de Caja">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Panel de apertura / cierre */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {isLoadingCaja ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : isCajaAbierta ? (
            <CierreCajaForm />
          ) : (
            <AperturaCajaForm />
          )}
        </div>

        {/* Historial (solo administrador) */}
        {isAdmin && (
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Historial de cortes</h3>
            <HistorialCortes />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
