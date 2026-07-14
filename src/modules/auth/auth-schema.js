// Esquema de validacion para el login
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Debe ser un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export { loginSchema }
