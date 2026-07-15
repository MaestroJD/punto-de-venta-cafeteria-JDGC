// Formulario de apertura de caja
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openCashRegister } from '../api/corte-caja-api'
import { useCaja } from '../../../context/caja-context'
import Input from '../../../components/common/input'
import Button from '../../../components/common/button'
import { toastSuccess } from '../../../components/common/toast'

const schema = z.object({
  monto_inicial: z.coerce.number().nonnegative('El monto inicial no puede ser negativo'),
})

export default function AperturaCajaForm() {
  const { abrirCaja } = useCaja()
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { monto_inicial: 0 },
  })

  const mutation = useMutation({
    mutationFn: (data) => openCashRegister(data),
    onSuccess: (caja) => {
      abrirCaja(caja)
      qc.invalidateQueries({ queryKey: ['corte-caja-historial'] })
      toastSuccess('Caja abierta correctamente')
    },
  })

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <span className="text-5xl">💰</span>
        <h3 className="text-lg font-semibold text-gray-800 mt-2">Apertura de caja</h3>
        <p className="text-sm text-gray-500">Declara el efectivo inicial del turno</p>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input
          label="Monto inicial ($)"
          type="number" step="0.01" min="0"
          error={errors.monto_inicial?.message}
          {...register('monto_inicial')}
        />
        <Button type="submit" isLoading={mutation.isPending} className="w-full" size="lg">
          Abrir caja
        </Button>
      </form>
    </div>
  )
}
