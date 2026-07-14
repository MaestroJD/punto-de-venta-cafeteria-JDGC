// Controlador del modulo de inventario
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as inventoryService from './inventory-service.js'

const createInsumo = asyncHandler(async (req, res) => {
  const insumo = await inventoryService.createInsumo(req.body);
  return successResponse(res, insumo, 201);
});

const listInsumos = asyncHandler(async (req, res) => {
  const insumos = await inventoryService.listInsumos(req.query);
  return successResponse(res, insumos, 200);
});

const getInsumoById = asyncHandler(async (req, res) => {
  const insumo = await inventoryService.getInsumoById(req.params.id);
  return successResponse(res, insumo, 200);
});

const registerEntrada = asyncHandler(async (req, res) => {
  const result = await inventoryService.registerEntrada(req.params.id, req.user.id, req.body);
  return successResponse(res, result, 201);
});

const registerAjuste = asyncHandler(async (req, res) => {
  const result = await inventoryService.registerAjuste(req.params.id, req.user.id, req.body);
  return successResponse(res, result, 201);
});

const getLowStockAlerts = asyncHandler(async (req, res) => {
  const alerts = await inventoryService.getLowStockAlerts();
  return successResponse(res, alerts, 200);
});

const listMovimientos = asyncHandler(async (req, res) => {
  const movimientos = await inventoryService.listMovimientos(req.query);
  return successResponse(res, movimientos, 200);
});

export { createInsumo,
  listInsumos,
  getInsumoById,
  registerEntrada,
  registerAjuste,
  getLowStockAlerts,
  listMovimientos, }
