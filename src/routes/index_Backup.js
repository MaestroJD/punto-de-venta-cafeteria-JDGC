// Agregador central de rutas — registra todos los modulos bajo /api
const express = require('express');
const authRoutes = require('../modules/auth/auth-routes');
const userRoutes = require('../modules/users/user-routes');
const productRoutes = require('../modules/products/product-routes');
const inventoryRoutes = require('../modules/inventory/inventory-routes');
const cashRegisterRoutes = require('../modules/cash-register/cash-register-routes');
const saleRoutes = require('../modules/sales/sale-routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/productos', productRoutes);
router.use('/insumos', inventoryRoutes);
router.use('/corte-caja', cashRegisterRoutes);
router.use('/ventas', saleRoutes);

module.exports = router;
