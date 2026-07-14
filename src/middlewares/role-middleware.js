// Middleware de control de acceso basado en roles (RBAC)
import AppError from '../utils/app-error.js'

function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No hay un usuario autenticado en la peticion', 401))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta accion', 403))
    }

    return next()
  }
}

export default roleMiddleware
