// Rutas del modulo de corte de caja
import express from 'express'
import authMiddleware from '../../middlewares/auth-middleware.js'
import roleMiddleware from '../../middlewares/role-middleware.js'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { aperturaSchema, cierreSchema } from './cash-register-schema.js'
import * as cashRegisterController from './cash-register-controller.js'

const router = express.Router();

router.use(authMiddleware);

// Cajero y administrador
router.get('/mi-caja', cashRegisterController.getMyOpenCashRegister);
router.post('/apertura', validateMiddleware(aperturaSchema), cashRegisterController.openCashRegister);
router.post('/:id/cierre', validateMiddleware(cierreSchema), cashRegisterController.closeCashRegister);

// Solo administrador
router.get('/', roleMiddleware(['administrador']), cashRegisterController.listCashRegisters);
router.get('/:id', roleMiddleware(['administrador']), cashRegisterController.getCashRegisterById);

export default router
