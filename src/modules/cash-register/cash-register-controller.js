// Controlador del modulo de corte de caja
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as cashRegisterService from './cash-register-service.js'

const openCashRegister = asyncHandler(async (req, res) => {
  const result = await cashRegisterService.openCashRegister(req.user.id, req.body.monto_inicial);
  return successResponse(res, result, 201);
});

const closeCashRegister = asyncHandler(async (req, res) => {
  const result = await cashRegisterService.closeCashRegister(
    req.params.id,
    req.user.id,
    req.body.monto_declarado,
    req.user.role
  );
  return successResponse(res, result, 200);
});

const getCashRegisterById = asyncHandler(async (req, res) => {
  const result = await cashRegisterService.getCashRegisterById(req.params.id);
  return successResponse(res, result, 200);
});

const listCashRegisters = asyncHandler(async (req, res) => {
  const result = await cashRegisterService.listCashRegisters(req.query);
  return successResponse(res, result, 200);
});

const getMyOpenCashRegister = asyncHandler(async (req, res) => {
  const result = await cashRegisterService.getOpenCashRegister(req.user.id);
  return successResponse(res, result, 200);
});

export { openCashRegister,
  closeCashRegister,
  getCashRegisterById,
  listCashRegisters,
  getMyOpenCashRegister, }
