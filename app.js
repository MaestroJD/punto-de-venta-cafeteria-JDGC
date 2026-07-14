// Configuracion de Express: middlewares globales y registro de rutas
import express from 'express';
import cors from 'cors';
import apiRoutes from './src/routes/index.js';
import errorHandlerMiddleware from './src/middlewares/error-handler-middleware.js';
import montarSwagger from './src/docs/swagger-setup.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Documentacion Swagger en /api-docs
montarSwagger(app);

// Ruta de salud (health check)
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Rutas de la API
app.use('/api', apiRoutes);

// Ruta no encontrada (404 generico)
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

// Manejador central de errores (debe ir al final)
app.use(errorHandlerMiddleware);

export default app;
