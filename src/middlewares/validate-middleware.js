// Middleware generico de validacion de payloads usando esquemas zod
import AppError from '../utils/app-error.js'

function validateMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const field = firstIssue.path.join('.') || source;
      const message = `Dato invalido en '${field}': ${firstIssue.message}`;
      return next(new AppError(message, 400));
    }

    req[source] = result.data;
    return next();
  };
}

export default validateMiddleware
