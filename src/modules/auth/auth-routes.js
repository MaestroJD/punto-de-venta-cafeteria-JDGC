// Rutas publicas de autenticacion
import express from 'express'
import validateMiddleware from '../../middlewares/validate-middleware.js'
import { loginSchema } from './auth-schema.js'
import * as authController from './auth-controller.js'

const router = express.Router();

router.post('/login', validateMiddleware(loginSchema), authController.login);

export default router
