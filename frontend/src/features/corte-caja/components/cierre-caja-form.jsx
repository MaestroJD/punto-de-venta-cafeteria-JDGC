// Formulario de cierre de caja con resumen de diferencia
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { closeCashRegister } from '../api/corte-caja-api'
import { useCaja } from '../../../context/caja-context'
import Input from '../../../components/common/input'
import Button from '../../../components/common/button'
import { toastSuccess } from '../../../components/common/toast'

const schema = z.object({
  monto_declarado: z.coerce.number().nonnegative('El monto no puede ser negativo'),
})

export default function CierreCajaForm() {
  const { cajaActual, cerrarCaja } = useCaja()
  const [resultado, setResultado] = useState(null)
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data) => closeCashRegister(cajaActual.id_corte, data),
    onSuccess: (data) => {
      setResultado(data)
      qc.invalidateQueries({ queryKey: ['corte-caja-historial'] })
      toastSuccess('Caja cerrada correctamente')
    },
  })

  const handleConfirmar = () => { cerrarCaja(); setResultado(null) }

  if (resultado) {
    const diferencia = Number(resultado.diferencia)
    const esFaltante = diferencia < 0
    const esSobrante = diferencia > 0
    return (
      <div className="space-y-4">
        <div className="text-center mb-2">
          <span className="text-4xl">{esFaltante ? '⚠️' : '✅'}</span>
          <h3 className="text-lg font-semibold mt-2">Resumen del corte</h3>
        </div>
        <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 border border-gray-200">
          {[
            { label: 'Fondo inicial',     value: resultado.monto_inicial },
            { label: 'Ventas en efectivo',value: (Number(resultado.monto_esperado) - Number(resultado.monto_inicial)).toFixed(2) },
            { label: 'Total esperado',    value: resultado.monto_esperado },
            { label: 'Efectivo declarado',value: resultado.monto_declarado },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-5 py-3 text-sm">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium">${Number(value).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between px-5 py-3">
            <span className="font-semibold">Diferencia</span>
            <span className={`font-bold text-lg ${esFaltante ? 'text-red-600' : esSobrante ? 'text-green-600' : 'text-gray-700'}`}>
              {esFaltante ? '−' : esSobrante ? '+' : ''}${Math.abs(diferencia).toFixed(2)}
              {esFaltante && ' (Faltante)'}
              {esSobrante && ' (Sobrante)'}
              {!esFaltante && !esSobrante && ' (Exacto)'}
            </span>
          </div>
        </div>
        <Button onClick={handleConfirmar} className="w-full" size="lg">Finalizar turno</Button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
        <p className="text-xs text-orange-600 uppercase font-semibold tracking-wide">Caja activa</p>
        <p className="text-sm text-orange-900 mt-1">Abierta: {new Date(cajaActual?.fecha_apertura).toLocaleString('es-MX')}</p>
        <p className="text-sm text-orange-900">Fondo inicial: <strong>${Number(cajaActual?.monto_inicial).toFixed(2)}</strong></p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input
          label="Efectivo contado ($)"
          type="number" step="0.01" min="0"
          placeholder="Cuenta el efectivo en caja"
          error={errors.monto_declarado?.message}
          {...register('monto_declarado')}
        />
        <Button type="submit" variant="danger" isLoading={mutation.isPending} className="w-full" size="lg">
          Cerrar caja
        </Button>
      </form>
    </div>
  )
}
