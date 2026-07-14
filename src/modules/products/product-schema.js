// Esquemas de validacion para el modulo de productos
import { z } from 'zod'

const createProductSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  categoria: z.string().min(1, 'La categoria es obligatoria'),
  precio: z.number({ invalid_type_error: 'El precio debe ser un numero' }).positive('El precio debe ser mayor a cero'),
  unidad_medida: z.string().min(1, 'La unidad de medida es obligatoria'),
});

const updateProductSchema = z.object({
  nombre: z.string().min(1).optional(),
  categoria: z.string().min(1).optional(),
  precio: z.number().positive('El precio debe ser mayor a cero').optional(),
  unidad_medida: z.string().min(1).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un campo para actualizar',
});

const recipeSchema = z.object({
  insumos: z.array(
    z.object({
      id_insumo: z.number().int().positive('El id_insumo debe ser un entero positivo'),
      cantidad_requerida: z.number().positive('La cantidad requerida debe ser mayor a cero'),
    })
  ).min(1, 'La receta debe tener al menos un insumo'),
});

export { createProductSchema, updateProductSchema, recipeSchema }
