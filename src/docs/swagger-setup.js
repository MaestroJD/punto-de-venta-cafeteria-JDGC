// Configuracion e integracion de Swagger UI con la especificacion OpenAPI del POS
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'

// Resuelve la ruta absoluta al archivo YAML (compatible con ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const specPath   = path.join(__dirname, '../../docs/openapi.yaml')

// Carga el YAML de la especificacion
const swaggerDocument = YAML.load(specPath)

// Opciones de visualizacion de Swagger UI
const swaggerOptions = {
  swaggerOptions: {
    // Precarga el token Bearer al abrir Swagger UI si existe en localStorage
    requestInterceptor: (request) => request,
    // Ordena los endpoints por metodo HTTP
    operationsSorter: 'method',
    // Expande las secciones de tags por defecto
    docExpansion: 'list',
    // Muestra la duracion de cada request
    displayRequestDuration: true,
    // Permite probar los endpoints directamente desde la UI
    tryItOutEnabled: true,
    persistAuthorization: true,
  },
  customCss: `
    .swagger-ui .topbar { background-color: #1f2937; }
    .swagger-ui .topbar .link { display: none; }
    .swagger-ui .topbar::before {
      content: 'POS Cafetería — ITH Sistemas y Computación';
      color: #f97316;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 0 16px;
      display: flex;
      align-items: center;
    }
    .swagger-ui .info .title { color: #1f2937; }
  `,
  customSiteTitle: 'POS Cafetería API Docs',
}

/**
 * Registra las rutas de Swagger UI en la aplicacion Express.
 * Llama esta funcion en app.js ANTES de registrar las rutas de la API.
 *
 * @param {import('express').Application} app - Instancia de Express
 */
function setupSwagger(app) {
  // Sirve la documentacion interactiva en /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))

  // Endpoint para descargar el spec en formato JSON (util para herramientas externas)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerDocument)
  })

  console.log('[Swagger] Documentacion disponible en http://localhost:' +
    (process.env.PORT || 3000) + '/api-docs')
}

export default setupSwagger
