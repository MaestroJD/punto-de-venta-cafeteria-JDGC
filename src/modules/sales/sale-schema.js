// Esquemas de validacion para el modulo de ventas
import { z } from 'zod'

const createSaleSchema = z.object({
  id_corte: z.number().int().positive('El id_corte es obligatorio'),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'mixto'], {
    errorMap: () => ({ message: 'El metodo de pago debe ser efectivo, tarjeta o mixto' }),
  }),
  monto_efectivo: z.number().nonnegative().default(0),
  monto_tarjeta: z.number().nonnegative().default(0),
  items: z.array(
    z.object({
      id_producto: z.number().int().positive('El id_producto debe ser un entero positivo'),
      cantidad: z.number().int().positive('La cantidad debe ser mayor a cero'),
    })
  ).min(1, 'La venta debe tener al menos un producto'),
});

export { createSaleSchema }
