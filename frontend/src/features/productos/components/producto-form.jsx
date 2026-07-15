// Formulario para crear y editar productos
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import Input from '../../../components/common/input'
import Select from '../../../components/common/select'
import Button from '../../../components/common/button'
import { useCreateProduct, useUpdateProduct } from '../hooks/use-productos'

const schema = z.object({
  nombre:        z.string().min(1, 'El nombre es obligatorio'),
  categoria:     z.string().min(1, 'La categoria es obligatoria'),
  precio:        z.coerce.number().positive('El precio debe ser mayor a cero'),
  unidad_medida: z.string().min(1, 'La unidad de medida es obligatoria'),
})

const categorias = ['Bebidas calientes', 'Bebidas frias', 'Alimentos', 'Postres', 'Otros']
const unidades   = ['pieza', 'porcion', 'vaso', 'taza', 'litro', 'gramo']

export default function ProductoForm({ producto, onClose }) {
  const isEditing = Boolean(producto)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', categoria: '', precio: '', unidad_medida: '' },
  })

  useEffect(() => {
    if (producto) reset(producto)
  }, [producto, reset])

  const onSubmit = async (data) => {
    if (isEditing) await updateMutation.mutateAsync({ id: producto.id_producto, data })
    else await createMutation.mutateAsync(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre del producto" error={errors.nombre?.message} {...register('nombre')} />

      <Select label="Categoria" error={errors.categoria?.message} {...register('categoria')}>
        <option value="">Selecciona una categoria</option>
        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>

      <Input label="Precio ($)" type="number" step="0.01" min="0.01"
        error={errors.precio?.message} {...register('precio')} />

      <Select label="Unidad de medida" error={errors.unidad_medida?.message} {...register('unidad_medida')}>
        <option value="">Selecciona una unidad</option>
        {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
      </Select>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {isEditing ? 'Actualizar' : 'Crear producto'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}
