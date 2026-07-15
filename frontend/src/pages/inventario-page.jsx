// Pagina de gestion de inventario
import MainLayout from '../components/layout/main-layout'
import InsumoList from '../features/inventario/components/insumo-list'

export default function InventarioPage() {
  return (
    <MainLayout title="Inventario">
      <InsumoList />
    </MainLayout>
  )
}
