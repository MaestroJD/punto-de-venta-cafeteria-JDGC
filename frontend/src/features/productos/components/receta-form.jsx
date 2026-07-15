// Formulario para asociar insumos a la receta de un producto
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRecipe, saveRecipe } from '../api/productos-api'
import { fetchInsumos } from '../../inventario/api/inventario-api'
import Button from '../../../components/common/button'
import { toastSuccess } from '../../../components/common/toast'

export default function RecetaForm({ producto, onClose }) {
  const qc = useQueryClient()
  const [lineas, setLineas] = useState([])

  const { data: recetaActual = [], isLoading: loadingReceta } = useQuery({
    queryKey: ['receta', producto?.id_producto],
    queryFn: () => fetchRecipe(producto.id_producto),
    enabled: Boolean(producto),
  })

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => fetchInsumos(),
  })

  useEffect(() => {
    if (recetaActual.length > 0) {
      setLineas(recetaActual.map((r) => ({
        id_insumo: r.insumos?.id_insumo || r.id_insumo,
        cantidad_requerida: r.cantidad_requerida,
      })))
    }
  }, [recetaActual])

  const saveMutation = useMutation({
    mutationFn: () => saveRecipe(producto.id_producto, lineas),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receta', producto.id_producto] })
      toastSuccess('Receta guardada correctamente')
      onClose()
    },
  })

  const handleAdd = () => setLineas((prev) => [...prev, { id_insumo: '', cantidad_requerida: 1 }])
  const handleRemove = (idx) => setLineas((prev) => prev.filter((_, i) => i !== idx))
  const handleChange = (idx, field, value) => {
    setLineas((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  if (loadingReceta) return <p className="text-gray-500 text-sm">Cargando receta...</p>

  return (
    <div className="space-y-4">
      {lineas.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Este producto no tiene receta. Agrega insumos.</p>
      )}

      {lineas.map((linea, idx) => (
        <div key={idx} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 block mb-1">Insumo</label>
            <select
              value={linea.id_insumo}
              onChange={(e) => handleChange(idx, 'id_insumo', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Selecciona insumo</option>
              {insumos.map((i) => (
                <option key={i.id_insumo} value={i.id_insumo}>
                  {i.nombre} ({i.unidad_medida})
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs font-medium text-gray-600 block mb-1">Cantidad</label>
            <input type="number" step="0.001" min="0.001"
              value={linea.cantidad_requerida}
              onChange={(e) => handleChange(idx, 'cantidad_requerida', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <Button size="sm" variant="danger" onClick={() => handleRemove(idx)}>✕</Button>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={handleAdd} className="w-full">
        + Agregar insumo
      </Button>

      <div className="flex gap-3 pt-2 border-t">
        <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending} className="flex-1">
          Guardar receta
        </Button>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  )
}
