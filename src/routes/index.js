// Agregador central de rutas — registra todos los modulos bajo /api
import express from 'express';
import authRoutes from '../modules/auth/auth-routes.js';
import userRoutes from '../modules/users/user-routes.js';
import productRoutes from '../modules/products/product-routes.js';
import inventoryRoutes from '../modules/inventory/inventory-routes.js';
import cashRegisterRoutes from '../modules/cash-register/cash-register-routes.js';
import saleRoutes from '../modules/sales/sale-routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/productos', productRoutes);
router.use('/insumos', inventoryRoutes);
router.use('/corte-caja', cashRegisterRoutes);
router.use('/ventas', saleRoutes);

export default router;
