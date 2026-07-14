// Controlador del modulo de productos
import asyncHandler from '../../utils/async-handler.js'
import { successResponse } from '../../utils/api-response.js'
import * as productService from './product-service.js'

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return successResponse(res, product, 201);
});

const listProducts = asyncHandler(async (req, res) => {
  const products = await productService.listProducts(req.query);
  return successResponse(res, products, 200);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return successResponse(res, product, 200);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return successResponse(res, product, 200);
});

const deactivateProduct = asyncHandler(async (req, res) => {
  const product = await productService.deactivateProduct(req.params.id);
  return successResponse(res, product, 200);
});

const getProductRecipe = asyncHandler(async (req, res) => {
  const recipe = await productService.getProductRecipe(req.params.id);
  return successResponse(res, recipe, 200);
});

const setProductRecipe = asyncHandler(async (req, res) => {
  const recipe = await productService.setProductRecipe(req.params.id, req.body.insumos);
  return successResponse(res, recipe, 201);
});

export { createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  getProductRecipe,
  setProductRecipe, }
