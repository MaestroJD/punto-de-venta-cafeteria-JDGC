// Middleware central de manejo de errores. Nunca expone errores internos al cliente
import logger from '../utils/logger.js'
import * as apiResponse from '../utils/api-response.js'

// eslint-disable-next-line no-unused-vars
function errorHandlerMiddleware(err, req, res, next) {
  const isOperational = err.isOperational === true
  const statusCode = isOperational ? err.statusCode : 500
  const message = isOperational ? err.message : 'Error interno del servidor'

  if (!isOperational) {
    logger.error('Error no controlado:', err)
  } else {
    logger.warn(`Error controlado [${statusCode}]:`, err.message)
  }

  return apiResponse.errorResponse(res, message, statusCode)
}

export default errorHandlerMiddleware
