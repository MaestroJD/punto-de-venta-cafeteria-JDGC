// Rutas del modulo de inventario
import express from 'express'
import authMiddleware from '../../middlewares/auth-middleware.js'
import roleMiddleware from '../../middlewares/role-middleware.js'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { createInsumoSchema,
  entradaInventarioSchema,
  ajusteInventarioSchema, } from './inventory-schema.js'
import * as inventoryController from './inventory-controller.js'

const router = express.Router();

router.use(authMiddleware);

// Alertas y listado: administrador e inventario
router.get('/alertas', roleMiddleware(['administrador', 'inventario']), inventoryController.getLowStockAlerts);
router.get('/movimientos', roleMiddleware(['administrador', 'inventario']), inventoryController.listMovimientos);
router.get('/', roleMiddleware(['administrador', 'inventario', 'cajero']), inventoryController.listInsumos);
router.get('/:id', roleMiddleware(['administrador', 'inventario', 'cajero']), inventoryController.getInsumoById);

// Escritura: administrador e inventario
router.post(
  '/',
  roleMiddleware(['administrador', 'inventario']),
  validateMiddleware(createInsumoSchema),
  inventoryController.createInsumo
);

router.post(
  '/:id/entradas',
  roleMiddleware(['administrador', 'inventario']),
  validateMiddleware(entradaInventarioSchema),
  inventoryController.registerEntrada
);

router.post(
  '/:id/ajustes',
  roleMiddleware(['administrador', 'inventario']),
  validateMiddleware(ajusteInventarioSchema),
  inventoryController.registerAjuste
);

export default router
