// Lista de insumos con indicador de stock bajo y acciones
import { useState } from 'react'
import { useInsumos, useCreateInsumo } from '../hooks/use-inventario'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Table from '../../../components/common/table'
import Button from '../../../components/common/button'
import Modal from '../../../components/common/modal'
import Input from '../../../components/common/input'
import Select from '../../../components/common/select'
import EntradaAjusteForm from './entrada-ajuste-form'

const schema = z.object({
  nombre:        z.string().min(1, 'El nombre es obligatorio'),
  unidad_medida: z.string().min(1, 'La unidad es obligatoria'),
  stock_actual:  z.coerce.number().nonnegative('No puede ser negativo'),
  stock_minimo:  z.coerce.number().nonnegative('No puede ser negativo'),
})

function NuevoInsumoForm({ onClose }) {
  const createMutation = useCreateInsumo()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const onSubmit = async (data) => { await createMutation.mutateAsync(data); onClose() }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre del insumo" error={errors.nombre?.message} {...register('nombre')} />
      <Select label="Unidad de medida" error={errors.unidad_medida?.message} {...register('unidad_medida')}>
        <option value="">Selecciona</option>
        {['kg', 'g', 'litro', 'ml', 'pieza', 'caja', 'bolsa'].map(u => <option key={u} value={u}>{u}</option>)}
      </Select>
      <Input label="Stock inicial" type="number" step="0.001" min="0" error={errors.stock_actual?.message} {...register('stock_actual')} />
      <Input label="Stock minimo (alerta)" type="number" step="0.001" min="0" error={errors.stock_minimo?.message} {...register('stock_minimo')} />
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={createMutation.isPending} className="flex-1">Crear insumo</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

export default function InsumoList() {
  const { data: insumos = [], isLoading } = useInsumos()
  const [selectedInsumo, setSelectedInsumo] = useState(null)
  const [mode, setMode] = useState('entrada')
  const [showCreate, setShowCreate] = useState(false)

  const openForm = (insumo, m) => { setSelectedInsumo(insumo); setMode(m) }

  const columns = [
    { key: 'nombre', label: 'Insumo' },
    { key: 'unidad_medida', label: 'Unidad' },
    {
      key: 'stock_actual', label: 'Stock actual',
      render: (r) => {
        const isBajo = Number(r.stock_actual) <= Number(r.stock_minimo)
        return (
          <span className={`font-semibold ${isBajo ? 'text-red-600' : 'text-green-700'}`}>
            {Number(r.stock_actual).toFixed(3)}
            {isBajo && ' ⚠️'}
          </span>
        )
      },
    },
    { key: 'stock_minimo', label: 'Minimo', render: (r) => Number(r.stock_minimo).toFixed(3) },
    {
      key: 'acciones', label: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => openForm(r, 'entrada')}>Entrada</Button>
          <Button size="sm" variant="secondary" onClick={() => openForm(r, 'ajuste')}>Ajuste</Button>
        </div>
      ),
    },
  ]

  // Filas con stock bajo resaltadas
  const dataWithClass = insumos.map(i => ({
    ...i,
    id: i.id_insumo,
    _rowClass: Number(i.stock_actual) <= Number(i.stock_minimo) ? 'bg-yellow-50' : '',
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>+ Nuevo insumo</Button>
      </div>

      <Table columns={columns} data={dataWithClass} isLoading={isLoading} />

      <Modal isOpen={Boolean(selectedInsumo)} onClose={() => setSelectedInsumo(null)}
        title={mode === 'entrada' ? 'Registrar entrada' : 'Ajuste de inventario'}>
        <EntradaAjusteForm insumo={selectedInsumo} mode={mode} onClose={() => setSelectedInsumo(null)} />
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo insumo">
        <NuevoInsumoForm onClose={() => setShowCreate(false)} />
      </Modal>
    </div>
  )
}
