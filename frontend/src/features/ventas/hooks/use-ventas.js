// Hook del carrito de venta con estado local y calculo de totales
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createSale } from '../api/ventas-api'

export function useCarrito() {
  const [items, setItems] = useState([])

  // Agrega un producto o incrementa su cantidad si ya existe
  const addItem = useCallback((producto) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id_producto === producto.id_producto)
      if (exists) {
        return prev.map((i) =>
          i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, {
        id_producto:    producto.id_producto,
        nombre:         producto.nombre,
        precio_unitario: Number(producto.precio),
        cantidad:       1,
      }]
    })
  }, [])

  const removeItem = useCallback((id_producto) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id_producto))
  }, [])

  const updateCantidad = useCallback((id_producto, cantidad) => {
    if (cantidad < 1) return
    setItems((prev) => prev.map((i) => i.id_producto === id_producto ? { ...i, cantidad } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0)

  return { items, addItem, removeItem, updateCantidad, clearCart, total }
}

export function useCreateSale() {
  return useMutation({ mutationFn: createSale })
}
