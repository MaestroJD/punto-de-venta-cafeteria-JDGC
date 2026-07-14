// Controlador del modulo de ventas
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as saleService from './sale-service.js'

const createSale = asyncHandler(async (req, res) => {
  const venta = await saleService.createSale(req.body, req.user.id);
  return successResponse(res, venta, 201);
});

const voidSale = asyncHandler(async (req, res) => {
  const venta = await saleService.voidSale(req.params.id, req.user.id, req.user.role);
  return successResponse(res, venta, 200);
});

const getSaleTicket = asyncHandler(async (req, res) => {
  const ticket = await saleService.getSaleTicket(req.params.id);
  return successResponse(res, ticket, 200);
});

const getSalesReport = asyncHandler(async (req, res) => {
  const { formato } = req.query;
  const report = await saleService.getSalesReport(req.query);

  if (formato === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.csv"');
    return res.status(200).send(report);
  }

  return successResponse(res, report, 200);
});

export { createSale, voidSale, getSaleTicket, getSalesReport }
