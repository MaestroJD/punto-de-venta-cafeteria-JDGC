import montarSwagger  from './src/docs/swagger-setup.js';
// Configuracion de Express: middlewares globales y registro de rutas
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/index');
const errorHandlerMiddleware = require('./src/middlewares/error-handler-middleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de salud (health check, T-01)
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Rutas de la API
app.use('/api', apiRoutes);

montarSwagger(app);

// Ruta no encontrada (404 generico)
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

// Manejador central de errores (debe ir al final)
app.use(errorHandlerMiddleware);

module.exports = app;
