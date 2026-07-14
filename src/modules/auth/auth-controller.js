// Controlador de autenticacion (login)
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as authService from './auth-service.js'

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return successResponse(res, result, 200);
});

export { login }
