// Tabla de productos con busqueda, filtro y acciones de editar/desactivar
import { useState } from 'react'
import { useAuth } from '../../../context/auth-context'
import { useProductos, useDeactivateProduct } from '../hooks/use-productos'
import Table from '../../../components/common/table'
import Button from '../../../components/common/button'
import Badge from '../../../components/common/badge'
import Modal from '../../../components/common/modal'
import ProductoForm from './producto-form'
import RecetaForm from './receta-form'

export default function ProductoList() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'administrador'

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [recetaProduct, setRecetaProduct] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: productos = [], isLoading } = useProductos({ activo: 'all' })
  const deactivateMutation = useDeactivateProduct()

  const filtered = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter ? p.categoria === catFilter : true
    return matchSearch && matchCat
  })

  const categorias = [...new Set(productos.map((p) => p.categoria))]

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'precio', label: 'Precio', render: (r) => `$${Number(r.precio).toFixed(2)}` },
    { key: 'unidad_medida', label: 'Unidad' },
    {
      key: 'activo', label: 'Estado',
      render: (r) => <Badge color={r.activo ? 'green' : 'gray'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge>,
    },
    ...(isAdmin ? [{
      key: 'acciones', label: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditProduct(r)}>Editar</Button>
          <Button size="sm" variant="ghost" onClick={() => setRecetaProduct(r)}>Receta</Button>
          {r.activo && (
            <Button size="sm" variant="danger"
              isLoading={deactivateMutation.isPending}
              onClick={() => { if (confirm(`¿Desactivar "${r.nombre}"?`)) deactivateMutation.mutate(r.id_producto) }}>
              Desactivar
            </Button>
          )}
        </div>
      ),
    }] : []),
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="text" placeholder="Buscar producto..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todas las categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Nuevo producto</Button>
        )}
      </div>

      <Table columns={columns} data={filtered} isLoading={isLoading} />

      {/* Modal crear */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo producto">
        <ProductoForm onClose={() => setShowCreate(false)} />
      </Modal>

      {/* Modal editar */}
      <Modal isOpen={Boolean(editProduct)} onClose={() => setEditProduct(null)} title="Editar producto">
        <ProductoForm producto={editProduct} onClose={() => setEditProduct(null)} />
      </Modal>

      {/* Modal receta */}
      <Modal isOpen={Boolean(recetaProduct)} onClose={() => setRecetaProduct(null)} title={`Receta: ${recetaProduct?.nombre}`}>
        <RecetaForm producto={recetaProduct} onClose={() => setRecetaProduct(null)} />
      </Modal>
    </div>
  )
}
