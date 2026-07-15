// Hook de productos: queries y mutaciones con React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProducts, createProduct, updateProduct, deactivateProduct } from '../api/productos-api'
import { toastSuccess } from '../../../components/common/toast'

export function useProductos(params = {}) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: () => fetchProducts(params),
    staleTime: 30000,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      toastSuccess('Producto creado correctamente')
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      toastSuccess('Producto actualizado correctamente')
    },
  })
}

export function useDeactivateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deactivateProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      toastSuccess('Producto desactivado')
    },
  })
}
