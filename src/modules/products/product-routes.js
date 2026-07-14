// Rutas del modulo de productos
import express from 'express'
import authMiddleware from '../../middlewares/auth-middleware.js'
import roleMiddleware from '../../middlewares/role-middleware.js'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { createProductSchema, updateProductSchema, recipeSchema } from './product-schema.js'
import * as productController from './product-controller.js'

const router = express.Router();

// Listado y detalle: todos los roles autenticados
router.get('/', authMiddleware, productController.listProducts);
router.get('/:id', authMiddleware, productController.getProductById);
router.get('/:id/receta', authMiddleware, productController.getProductRecipe);

// Escritura: solo administradores
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['administrador']),
  validateMiddleware(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['administrador']),
  validateMiddleware(updateProductSchema),
  productController.updateProduct
);

router.patch(
  '/:id/desactivar',
  authMiddleware,
  roleMiddleware(['administrador']),
  productController.deactivateProduct
);

router.post(
  '/:id/receta',
  authMiddleware,
  roleMiddleware(['administrador']),
  validateMiddleware(recipeSchema),
  productController.setProductRecipe
);

export default router
