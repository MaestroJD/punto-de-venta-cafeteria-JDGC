// Rutas del modulo de ventas
import express from 'express'
import authMiddleware from '../../middlewares/auth-middleware.js'
import roleMiddleware from '../../middlewares/role-middleware.js'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { createSaleSchema } from './sale-schema.js'
import * as saleController from './sale-controller.js'

const router = express.Router();

router.use(authMiddleware);

// Registro de ventas: cajero y administrador
router.post('/', roleMiddleware(['cajero', 'administrador']), validateMiddleware(createSaleSchema), saleController.createSale);
router.post('/:id/anular', roleMiddleware(['cajero', 'administrador']), saleController.voidSale);
router.get('/:id/ticket', roleMiddleware(['cajero', 'administrador']), saleController.getSaleTicket);

// Reportes: solo administrador
router.get('/reportes/ventas', roleMiddleware(['administrador']), saleController.getSalesReport);

export default router
