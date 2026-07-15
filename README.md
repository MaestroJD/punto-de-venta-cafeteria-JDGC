<<<<<<< HEAD
# POS Cafeteria — Backend

API REST construida con Node.js + Express + Supabase.

## Requisitos
- Node.js >= 18
- Cuenta y proyecto en Supabase con `schema.sql` ejecutado

## Instalacion
npm install
cp .env.example .env   # completar con tus credenciales de Supabase

## Uso
npm run dev   # desarrollo con nodemon
npm start     # produccion

## Rutas disponibles
| Metodo | Ruta                              | Descripcion                        |
|--------|-----------------------------------|------------------------------------|
| GET    | /health                           | Health check                       |
| POST   | /api/auth/login                   | Login                              |
| GET    | /api/usuarios                     | Listar usuarios (admin)            |
| POST   | /api/usuarios                     | Crear usuario (admin)              |
| PATCH  | /api/usuarios/:id/deactivate      | Desactivar usuario (admin)         |
| GET    | /api/productos                    | Listar productos                   |
| POST   | /api/productos                    | Crear producto (admin)             |
| PUT    | /api/productos/:id                | Editar producto (admin)            |
| PATCH  | /api/productos/:id/desactivar     | Desactivar producto (admin)        |
| POST   | /api/productos/:id/receta         | Asociar receta (admin)             |
| GET    | /api/productos/:id/receta         | Ver receta del producto            |
| GET    | /api/insumos                      | Listar insumos                     |
| POST   | /api/insumos                      | Crear insumo                       |
| POST   | /api/insumos/:id/entradas         | Registrar entrada de inventario    |
| POST   | /api/insumos/:id/ajustes          | Ajuste manual de inventario        |
| GET    | /api/insumos/alertas              | Insumos con stock bajo             |
| GET    | /api/insumos/movimientos          | Historial de movimientos           |
| POST   | /api/corte-caja/apertura          | Abrir caja                         |
| POST   | /api/corte-caja/:id/cierre        | Cerrar caja                        |
| GET    | /api/corte-caja/mi-caja           | Ver caja abierta del cajero        |
| GET    | /api/corte-caja                   | Historial de cortes (admin)        |
| GET    | /api/corte-caja/:id               | Detalle de un corte (admin)        |
| POST   | /api/ventas                       | Registrar venta                    |
| POST   | /api/ventas/:id/anular            | Anular venta                       |
| GET    | /api/ventas/:id/ticket            | Obtener ticket de venta            |
| GET    | /api/ventas/reportes/ventas       | Reporte de ventas (admin, ?formato=csv) |
=======
# ☕ POS Cafetería — Sistema de Punto de Venta

Sistema de punto de venta desarrollado para cafeterías de tamaño pequeño y mediano. Permite gestionar el catálogo de productos, registrar ventas con control de inventario, realizar cortes de caja por turno y generar reportes exportables.

Desarrollado por **ITH Sistemas y Computación**.

---

## Tecnologías utilizadas

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | >= 18 | Runtime |
| Express | ^4.19 | Framework HTTP |
| Supabase | ^2.43 | Base de datos (PostgreSQL) y autenticación |
| Zod | ^3.23 | Validación de datos de entrada |
| dotenv | ^16.4 | Variables de entorno |
| swagger-ui-express | ^5.0 | Documentación interactiva de la API |
| yamljs | ^0.3 | Lectura del spec OpenAPI |
| bcrypt | ^6.0 | Hash de contraseñas |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | ^18.3 | Librería de UI |
| Vite | ^5.3 | Bundler y servidor de desarrollo |
| React Router | ^6.25 | Enrutamiento de vistas |
| TanStack Query | ^5.51 | Estado del servidor y caché |
| Axios | ^1.7 | Cliente HTTP |
| React Hook Form | ^7.52 | Manejo de formularios |
| Zod | ^3.23 | Validación de formularios |
| Tailwind CSS | ^3.4 | Estilos |

---

## Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado y el esquema `schema.sql` ejecutado

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pos-cafeteria.git
cd pos-cafeteria
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

---

## Variables de entorno

### Backend — `backend/.env`

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SUPABASE_URL` | URL de tu proyecto en Supabase | `https://abcdef.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (service role key) — **nunca exponerla al frontend** | `eyJhbGci...` |
| `PORT` | Puerto del servidor Express | `3000` |
| `NODE_ENV` | Ambiente de ejecución | `development` |

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
```

> ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` tiene acceso total a la base de datos sin restricciones de Row Level Security. Nunca la incluyas en el frontend ni la versiones en Git.

### Frontend — `frontend/.env`

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend (sin barra final) | `http://localhost:3000` |

```env
VITE_API_URL=http://localhost:3000
```

---

## Base de datos

Ejecuta el script `schema.sql` en el editor SQL de tu proyecto de Supabase:

1. Abre tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `database/schema.sql`
4. Haz clic en **Run**

Esto crea las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `usuarios` | Usuarios del sistema con sus roles |
| `productos` | Catálogo de productos vendibles |
| `insumos` | Materia prima e ingredientes |
| `receta` | Relación producto–insumos (N a N) |
| `corte_caja` | Registro de turnos (apertura y cierre) |
| `ventas` | Cabecera de cada venta registrada |
| `detalle_venta` | Líneas de producto por venta |
| `movimientos_inventario` | Historial de entradas, salidas y ajustes |

Después crea el primer usuario administrador:

```sql
INSERT INTO usuarios (nombre, rol, usuario, password_hash, activo)
VALUES ('Admin Principal', 'administrador', 'admin@cafeteria.com', 'managed_by_supabase_auth', true);
```

Y regístralo en Supabase Auth desde **Authentication → Users → Add user** usando el mismo correo.

---

## Correr el proyecto en desarrollo

### Backend

```bash
cd backend
npm run dev
```

El servidor inicia en `http://localhost:3000`.

Rutas disponibles al arrancar:
- `http://localhost:3000/health` — Health check
- `http://localhost:3000/api-docs` — Documentación Swagger interactiva
- `http://localhost:3000/api/...` — Endpoints de la API

### Frontend

```bash
cd frontend
npm run dev
```

La interfaz inicia en `http://localhost:5173`.

### Correr ambos al mismo tiempo (desde la raíz)

Si tienes `concurrently` instalado globalmente:

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `administrador` | Acceso completo: productos, inventario, ventas, corte de caja, reportes y usuarios |
| `cajero` | Registro de ventas y corte de caja |
| `inventario` | Gestión de insumos, entradas y ajustes |

---

## Módulos del sistema

### Productos
Gestión del catálogo: crear, editar y desactivar productos. Asociar recetas con los insumos que cada producto consume al venderse.

### Inventario
Control de insumos con alertas de stock bajo. Registro de entradas por compra a proveedor y ajustes manuales con motivo (mermas, conteos físicos).

### Punto de Venta
Grid de productos filtrable por categoría. Carrito con ajuste de cantidades y soporte para pago en efectivo, tarjeta o mixto. Generación de ticket imprimible al confirmar la venta.

### Corte de Caja
Apertura de turno con fondo inicial. Cierre con cálculo automático de monto esperado, monto declarado y diferencia (sobrante o faltante). Historial de cortes filtrable por fecha y cajero.

### Reportes
Reporte de ventas filtrable por fecha, cajero y categoría. Exportable a CSV con un clic.

---

## Estructura de carpetas

```
pos-cafeteria/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                        # Carga y valida variables de entorno
│   │   │   └── supabase-client.js            # Cliente Supabase (service role)
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth-middleware.js            # Valida JWT de Supabase Auth
│   │   │   ├── role-middleware.js            # Control de acceso por rol (RBAC)
│   │   │   ├── validate-middleware.js        # Validacion de payloads con Zod
│   │   │   └── error-handler-middleware.js   # Manejo centralizado de errores
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                         # Login
│   │   │   ├── users/                        # CRUD de usuarios
│   │   │   ├── products/                     # Catalogo de productos y recetas
│   │   │   ├── inventory/                    # Insumos, entradas, ajustes y movimientos
│   │   │   ├── cash-register/                # Apertura, cierre e historial de caja
│   │   │   └── sales/                        # Ventas, anulaciones, tickets y reportes
│   │   │
│   │   ├── routes/
│   │   │   └── index.js                      # Agregador central de rutas /api
│   │   │
│   │   ├── utils/
│   │   │   ├── app-error.js                  # Clase de error con codigo HTTP
│   │   │   ├── api-response.js               # Helpers de respuesta estandar
│   │   │   ├── async-handler.js              # Wrapper para controladores async
│   │   │   ├── calculations.js               # Calculo monetario sin errores de flotante
│   │   │   └── logger.js                     # Logger centralizado
│   │   │
│   │   └── docs/
│   │       └── swagger-setup.js              # Configuracion de Swagger UI
│   │
│   ├── docs/
│   │   └── openapi.yaml                      # Especificacion OpenAPI 3.0
│   │
│   ├── app.js                                # Configuracion de Express
│   ├── server.js                             # Punto de entrada
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── api-client.js                 # Cliente Axios con interceptores
│   │   │
│   │   ├── context/
│   │   │   ├── auth-context.jsx              # Sesion del usuario
│   │   │   └── caja-context.jsx              # Estado de la caja activa
│   │   │
│   │   ├── routes/
│   │   │   └── app-routes.jsx                # Rutas protegidas por rol
│   │   │
│   │   ├── components/
│   │   │   ├── common/                       # Button, Input, Modal, Table, Badge, Toast
│   │   │   └── layout/                       # Sidebar, Header, ProtectedRoute, MainLayout
│   │   │
│   │   ├── features/
│   │   │   ├── auth/                         # Login
│   │   │   ├── productos/                    # Lista, formulario y receta
│   │   │   ├── inventario/                   # Lista, alertas, entradas y ajustes
│   │   │   ├── corte-caja/                   # Apertura, cierre e historial
│   │   │   ├── ventas/                       # Carrito, cards, ticket
│   │   │   └── reportes/                     # Filtros y descarga CSV
│   │   │
│   │   └── pages/                            # Una pagina por modulo
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql                            # DDL completo de las 8 tablas
│
└── README.md
```

---

## Scripts disponibles

### Backend

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con nodemon (reinicia al guardar) |
| `npm start` | Servidor en modo producción |
| `npm test` | Ejecuta las pruebas Jest |
| `npm run test:watch` | Pruebas en modo watch |
| `npm run test:coverage` | Pruebas con reporte de cobertura |

### Frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:5173` |
| `npm run build` | Compilar para producción en `dist/` |
| `npm run preview` | Previsualizar el build de producción |

---

## Documentación de la API

Con el backend corriendo, accede a la documentación interactiva Swagger en:

```
http://localhost:3000/api-docs
```

Para probar los endpoints autenticados:

1. Ejecuta `POST /api/auth/login` con tus credenciales
2. Copia el `token` de la respuesta
3. Haz clic en el botón **Authorize** (🔒) en la esquina superior derecha
4. Pega el token y confirma
5. Todos los endpoints posteriores enviarán el header automáticamente

---

## Pruebas

El proyecto incluye pruebas unitarias con Jest que cubren los escenarios críticos del spec:

```bash
cd backend
npm test
```

| Archivo de prueba | Escenarios cubiertos |
|---|---|
| `stock-insuficiente.test.js` | Validación de stock antes de vender (HU-05, HU-10) |
| `calculos-venta.test.js` | Cálculo de totales, precio histórico, validación de pagos (HU-05, HU-06) |
| `corte-caja.test.js` | Apertura, cierre, diferencias y trazabilidad (HU-13, HU-14) |

---

## Licencia

MIT © ITH Sistemas y Computación
>>>>>>> 8ed417f (Sistema de punto de venta - Dia 4)
