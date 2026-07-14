// Esquemas de validacion para el modulo de inventario
import { z } from 'zod'

const createInsumoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  unidad_medida: z.string().min(1, 'La unidad de medida es obligatoria'),
  stock_actual: z.number().nonnegative('El stock inicial no puede ser negativo'),
  stock_minimo: z.number().nonnegative('El stock minimo no puede ser negativo'),
});

const entradaInventarioSchema = z.object({
  cantidad: z.number().positive('La cantidad de entrada debe ser mayor a cero'),
  motivo: z.string().optional(),
});

const ajusteInventarioSchema = z.object({
  cantidad: z.number().refine((v) => v !== 0, 'La cantidad de ajuste no puede ser cero'),
  motivo: z.string().min(1, 'El motivo del ajuste es obligatorio'),
});

export { createInsumoSchema, entradaInventarioSchema, ajusteInventarioSchema }
