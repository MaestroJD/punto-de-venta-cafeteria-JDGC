# Integración de Swagger UI — POS Cafetería

## Archivos incluidos en el zip

```
docs/
└── openapi.yaml          ← Especificacion OpenAPI 3.0 completa
src/
└── docs/
    └── swagger-setup.js  ← Configuracion de swagger-ui-express
```

## Pasos de integración (2 lineas en app.js)

Abre tu `app.js` existente y agrega las dos lineas marcadas con ← AGREGAR:

```js
import express from 'express'
import cors from 'cors'
import setupSwagger from './src/docs/swagger-setup.js'   // ← AGREGAR (1)
import apiRoutes from './src/routes/index.js'
import errorHandlerMiddleware from './src/middlewares/error-handler-middleware.js'

const app = express()

app.use(cors())
app.use(express.json())

setupSwagger(app)   // ← AGREGAR (2) — antes de las rutas de la API

app.get('/health', (req, res) => { ... })
app.use('/api', apiRoutes)
app.use(errorHandlerMiddleware)

export default app
```

## Dependencias requeridas

Ya estan instaladas en tu proyecto:
- `swagger-ui-express`
- `yamljs`

Si por alguna razon no estan, instalalas con:
```bash
npm install swagger-ui-express yamljs
```

## Acceder a la documentacion

Con el servidor corriendo:
```
http://localhost:3000/api-docs        ← Swagger UI interactivo
http://localhost:3000/api-docs.json   ← Spec en formato JSON
```

## Usar el boton "Authorize" en Swagger UI

1. Inicia sesion via `POST /api/auth/login` desde la misma UI
2. Copia el `token` de la respuesta
3. Haz clic en el boton **Authorize** (candado) en la esquina superior derecha
4. Pega el token en el campo `bearerAuth` (sin escribir "Bearer", solo el token)
5. Haz clic en **Authorize** y cierra el dialogo
6. Ahora todos los endpoints enviaran el header `Authorization: Bearer <token>` automaticamente

## Endpoints documentados (39 total)

| Modulo        | Endpoints |
|---------------|-----------|
| Health        | 1         |
| Auth          | 1         |
| Usuarios      | 4         |
| Productos     | 7         |
| Inventario    | 7         |
| Corte de Caja | 5         |
| Ventas        | 3         |
| Reportes      | 1         |
