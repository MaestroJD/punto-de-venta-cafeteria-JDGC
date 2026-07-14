// Rutas del modulo de usuarios (solo administradores)
import express from 'express'
import authMiddleware from '../../middlewares/auth-middleware.js'
import roleMiddleware from '../../middlewares/role-middleware.js'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { createUserSchema } from './user-schema.js'
import * as userController from './user-controller.js'

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['administrador']));

router.post('/', validateMiddleware(createUserSchema), userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/deactivate', userController.deactivateUser);

export default router
