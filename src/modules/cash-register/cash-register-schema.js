// Esquemas de validacion para el modulo de corte de caja
import { z } from 'zod'

const aperturaSchema = z.object({
  monto_inicial: z
    .number({ invalid_type_error: 'El monto inicial debe ser un numero' })
    .nonnegative('El monto inicial no puede ser negativo'),
});

const cierreSchema = z.object({
  monto_declarado: z
    .number({ invalid_type_error: 'El monto declarado debe ser un numero' })
    .nonnegative('El monto declarado no puede ser negativo'),
});

export { aperturaSchema, cierreSchema }
