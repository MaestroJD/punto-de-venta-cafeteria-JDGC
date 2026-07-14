// Envuelve un controlador async para enviar cualquier error al errorHandler central
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler
