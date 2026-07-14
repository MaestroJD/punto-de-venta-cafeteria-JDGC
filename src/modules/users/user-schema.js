// Esquemas de validacion para el modulo de usuarios
import { z } from 'zod'

const createUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  rol: z.enum(['administrador', 'cajero', 'inventario'], {
    errorMap: () => ({ message: 'El rol debe ser administrador, cajero o inventario' }),
  }),
  usuario: z.string().email('El campo usuario debe ser un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export { createUserSchema }
