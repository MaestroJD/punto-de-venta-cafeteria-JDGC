// Hook de inventario: queries y mutaciones con React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInsumos, createInsumo, registerEntrada, registerAjuste, fetchAlertas } from '../api/inventario-api'
import { toastSuccess } from '../../../components/common/toast'

export function useInsumos(params) {
  return useQuery({ queryKey: ['insumos', params], queryFn: () => fetchInsumos(params), staleTime: 30000 })
}

export function useAlertas() {
  return useQuery({ queryKey: ['insumos-alertas'], queryFn: fetchAlertas, refetchInterval: 60000 })
}

export function useCreateInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInsumo,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insumos'] }); toastSuccess('Insumo creado') },
  })
}

export function useRegisterEntrada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => registerEntrada(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insumos'] }); toastSuccess('Entrada registrada') },
  })
}

export function useRegisterAjuste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => registerAjuste(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insumos'] }); toastSuccess('Ajuste aplicado') },
  })
}
