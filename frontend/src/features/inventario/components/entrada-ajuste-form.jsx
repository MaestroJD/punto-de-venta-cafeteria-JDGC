// Formulario para registrar una entrada o ajuste de inventario
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../../components/common/input'
import Button from '../../../components/common/button'
import { useRegisterEntrada, useRegisterAjuste } from '../hooks/use-inventario'

const entradaSchema = z.object({
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a cero'),
  motivo: z.string().optional(),
})

const ajusteSchema = z.object({
  cantidad: z.coerce.number().refine((v) => v !== 0, 'La cantidad no puede ser cero'),
  motivo: z.string().min(1, 'El motivo es obligatorio'),
})

export default function EntradaAjusteForm({ insumo, mode = 'entrada', onClose }) {
  const isEntrada = mode === 'entrada'
  const entradaMutation = useRegisterEntrada()
  const ajusteMutation = useRegisterAjuste()
  const isPending = entradaMutation.isPending || ajusteMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isEntrada ? entradaSchema : ajusteSchema),
  })

  const onSubmit = async (data) => {
    const payload = { ...data, cantidad: Number(data.cantidad) }
    if (isEntrada) await entradaMutation.mutateAsync({ id: insumo.id_insumo, data: payload })
    else await ajusteMutation.mutateAsync({ id: insumo.id_insumo, data: payload })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
        <p className="text-sm font-medium text-orange-800">{insumo?.nombre}</p>
        <p className="text-xs text-orange-600">Stock actual: {insumo?.stock_actual} {insumo?.unidad_medida}</p>
      </div>

      <Input
        label={isEntrada ? 'Cantidad a ingresar' : 'Cantidad (+/-) '}
        type="number"
        step="0.001"
        placeholder={isEntrada ? '0' : 'Positivo suma, negativo resta'}
        error={errors.cantidad?.message}
        {...register('cantidad')}
      />

      <Input
        label={isEntrada ? 'Motivo (opcional)' : 'Motivo del ajuste'}
        placeholder={isEntrada ? 'Ej: Compra a proveedor' : 'Ej: Merma, conteo fisico'}
        error={errors.motivo?.message}
        {...register('motivo')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {isEntrada ? 'Registrar entrada' : 'Aplicar ajuste'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}
