// Punto de entrada: levanta el servidor HTTP
import env from './src/config/env.js';
import logger from './src/utils/logger.js';
import app from './app.js';

const PORT = env.port;

app.listen(PORT, () => {
  logger.info(`Servidor POS Cafeteria corriendo en http://localhost:${PORT}`);
  logger.info(`Ambiente: ${env.nodeEnv}`);
});
