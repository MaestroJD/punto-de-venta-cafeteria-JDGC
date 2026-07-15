// Pagina de gestion de productos (solo administrador)
import MainLayout from '../components/layout/main-layout'
import ProductoList from '../features/productos/components/producto-list'

export default function ProductosPage() {
  return (
    <MainLayout title="Productos">
      <ProductoList />
    </MainLayout>
  )
}
