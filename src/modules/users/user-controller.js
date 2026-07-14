// Controlador del modulo de usuarios
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as userService from './user-service.js'

const createUser = asyncHandler(async (req, res) => {
  const usuario = await userService.createUser(req.body);
  return successResponse(res, usuario, 201);
});

const listUsers = asyncHandler(async (req, res) => {
  const usuarios = await userService.listUsers(req.query);
  return successResponse(res, usuarios, 200);
});

const getUserById = asyncHandler(async (req, res) => {
  const usuario = await userService.getUserById(req.params.id);
  return successResponse(res, usuario, 200);
});

const deactivateUser = asyncHandler(async (req, res) => {
  const usuario = await userService.deactivateUser(req.params.id);
  return successResponse(res, usuario, 200);
});

export { createUser, listUsers, getUserById, deactivateUser }
