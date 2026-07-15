# Plan.md — Sistema POS Cafetería

> Documento de planeación técnica derivado de `spec.md` y `modelo_datos.md`.
> Define stack tecnológico, estructura de carpetas y convenciones de nombres
> para iniciar el desarrollo del backend y frontend.

---

## 1. Stack Tecnológico

### 1.1 Backend
- **Node.js** (LTS) — runtime de ejecución.
- **Express** — framework HTTP para la API REST.
- **Supabase** — como base de datos (PostgreSQL administrado), autenticación de usuarios y, opcionalmente, almacenamiento de archivos (tickets/comprobantes en PDF).
  - Se usa el SDK `@supabase/supabase-js` desde el backend con la **service role key** (nunca expuesta al frontend) para operaciones administrativas y consultas con reglas de negocio.
  - El esquema de tablas (`productos`, `ventas`, `detalle_venta`, `corte_caja`, `insumos`, `receta`, `movimientos_inventario`, `usuarios`) corresponde al definido en `schema.sql`.
- **Autenticación**: Supabase Auth, integrada con la tabla `usuarios` para manejo de roles (administrador, cajero, inventario), conforme a la sección 4.3 del spec (RBAC).
- **Validación de datos**: `zod` (o `joi`) para validar payloads de entrada en cada endpoint.
- **ORM/Query builder**: cliente de Supabase (`supabase-js`) para queries simples; para queries complejas o transacciones (ej. descuento de inventario al confirmar venta) se usan funciones SQL/RPC en Supabase o consultas parametrizadas.

### 1.2 Frontend
- **React** (v18+) — librería de UI.
- **Vite** — bundler y servidor de desarrollo.
- **React Router** — enrutamiento de vistas (login, ventas, productos, inventario, corte de caja).
- **Supabase Client (`@supabase/supabase-js`)** — para autenticación de sesión en el navegador (usando la **anon key**) y suscripciones en tiempo real si se requieren (ej. alertas de stock bajo).
- **Manejo de estado**: Context API + hooks personalizados para estado global ligero (sesión de usuario, caja abierta); `react-query` / `@tanstack/react-query` para estado de datos del servidor (cacheo, refetch).
- **UI**: Tailwind CSS para estilos, con componentes propios reutilizables (no se define librería de componentes pesada para mantener el bundle ligero, acorde a la restricción de baja latencia del spec 4.1).
- **Formularios**: `react-hook-form` + `zod` (validación compartida de esquema con backend cuando sea posible).

### 1.3 Herramientas transversales
- **JavaScript (ES2022+)** en backend y frontend, con JSDoc opcional para documentar tipos en funciones críticas (ej. montos y estados).
- **ESLint + Prettier** — linting y formato consistente.
- **dotenv** — manejo de variables de entorno (`.env`) tanto en backend como frontend (Vite usa prefijo `VITE_`).
- **Vitest** (o Jest) — pruebas unitarias en backend y frontend.
- **Git** con convención de commits (ver sección 4).

---

## 2. Estructura de Carpetas

### 2.1 Backend (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   ├── supabaseClient.js        # inicialización del cliente Supabase (service role)
│   │   └── env.js                   # carga y validación de variables de entorno
│   │
│   ├── modules/
│   │   ├── productos/
│   │   │   ├── productos.controller.js
│   │   │   ├── productos.service.js
│   │   │   ├── productos.routes.js
│   │   │   └── productos.schema.js   # validaciones zod
│   │   │
│   │   ├── ventas/
│   │   │   ├── ventas.controller.js
│   │   │   ├── ventas.service.js
│   │   │   ├── ventas.routes.js
│   │   │   └── ventas.schema.js
│   │   │
│   │   ├── inventario/
│   │   │   ├── insumos.controller.js
│   │   │   ├── insumos.service.js
│   │   │   ├── insumos.routes.js
│   │   │   ├── insumos.schema.js
│   │   │   ├── recetas.controller.js
│   │   │   ├── recetas.service.js
│   │   │   └── movimientos.service.js
│   │   │
│   │   ├── corte-caja/
│   │   │   ├── corteCaja.controller.js
│   │   │   ├── corteCaja.service.js
│   │   │   ├── corteCaja.routes.js
│   │   │   └── corteCaja.schema.js
│   │   │
│   │   └── usuarios/
│   │       ├── usuarios.controller.js
│   │       ├── usuarios.service.js
│   │       ├── usuarios.routes.js
│   │       └── usuarios.schema.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js        # valida sesión/JWT de Supabase
│   │   ├── role.middleware.js        # RBAC por rol (admin, cajero, inventario)
│   │   ├── errorHandler.middleware.js
│   │   └── validate.middleware.js    # ejecuta esquemas zod sobre req.body
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── apiResponse.js            # formato estándar de respuestas
│   │   └── calculos.js               # ej. cálculo de diferencia de caja
│   │
│   ├── types/
│   │   └── index.js                  # JSDoc typedefs compartidos (Producto, Venta, etc.)
│   │
│   ├── routes/
│   │   └── index.js                  # agregador de todas las rutas /api
│   │
│   ├── app.js                        # configuración de Express (middlewares globales)
│   └── server.js                     # punto de entrada (listen)
│
├── tests/
│   ├── productos.test.js
│   ├── ventas.test.js
│   └── corteCaja.test.js
│
├── .env.example
├── package.json
└── README.md
```

### 2.2 Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── assets/                       # imágenes, íconos, fuentes
│   │
│   ├── components/
│   │   ├── common/                   # botones, inputs, modales reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Table.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Header.jsx
│   │       └── ProtectedRoute.jsx    # control de acceso por rol
│   │
│   ├── features/
│   │   ├── productos/
│   │   │   ├── components/
│   │   │   │   ├── ProductoForm.jsx
│   │   │   │   └── ProductoList.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useProductos.js
│   │   │   └── api/
│   │   │       └── productosApi.js
│   │   │
│   │   ├── ventas/
│   │   │   ├── components/
│   │   │   │   ├── CarritoVenta.jsx
│   │   │   │   ├── ProductoCard.jsx
│   │   │   │   └── TicketPreview.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useVentas.js
│   │   │   └── api/
│   │   │       └── ventasApi.js
│   │   │
│   │   ├── inventario/
│   │   │   ├── components/
│   │   │   │   ├── InsumoList.jsx
│   │   │   │   ├── RecetaForm.jsx
│   │   │   │   └── AlertaStockBajo.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useInventario.js
│   │   │   └── api/
│   │   │       └── inventarioApi.js
│   │   │
│   │   ├── corte-caja/
│   │   │   ├── components/
│   │   │   │   ├── AperturaCajaForm.jsx
│   │   │   │   ├── CierreCajaForm.jsx
│   │   │   │   └── HistorialCortes.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useCorteCaja.js
│   │   │   └── api/
│   │   │       └── corteCajaApi.js
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   └── LoginForm.jsx
│   │       ├── hooks/
│   │       │   └── useAuth.js
│   │       └── api/
│   │           └── authApi.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CajaContext.jsx           # estado de caja abierta/cerrada en sesión actual
│   │
│   ├── lib/
│   │   └── supabaseClient.js         # cliente Supabase (anon key)
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── VentasPage.jsx
│   │   ├── ProductosPage.jsx
│   │   ├── InventarioPage.jsx
│   │   ├── CorteCajaPage.jsx
│   │   └── ReportesPage.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── types/
│   │   └── index.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Convenciones de Nombres

### 3.1 Archivos y carpetas
- **Carpetas**: `kebab-case` (ej. `corte-caja/`, `common/`).
- **Componentes React**: `PascalCase.jsx` (ej. `ProductoForm.jsx`, `TicketPreview.jsx`).
- **Hooks**: `camelCase` con prefijo `use` (ej. `useVentas.js`, `useCorteCaja.js`).
- **Archivos de servicio/controlador backend**: `camelCase` con sufijo descriptivo (ej. `ventas.service.js`, `ventas.controller.js`, `ventas.routes.js`, `ventas.schema.js`).
- **Archivos de utilidades**: `camelCase.js` (ej. `apiResponse.js`, `calculos.js`).

### 3.2 Variables y funciones (JavaScript)
- **Variables y funciones**: `camelCase` (ej. `montoEsperado`, `calcularDiferenciaCaja()`).
- **Constantes globales/configuración**: `UPPER_SNAKE_CASE` (ej. `MAX_REINTENTOS`, `STOCK_MINIMO_DEFAULT`).
- **Clases**: `PascalCase` (ej. `class VentaService`, `class CajaController`).
- **Booleanos**: prefijo `is`/`has`/`puede` (ej. `isCajaAbierta`, `hasStockSuficiente`).
- **Funciones de manejo de eventos (frontend)**: prefijo `handle` (ej. `handleSubmit`, `handleAgregarProducto`).

### 3.3 Base de datos (ya definido en `schema.sql`, se mantiene como referencia)
- **Tablas**: `snake_case`, plural (ej. `productos`, `detalle_venta`, `movimientos_inventario`).
- **Columnas**: `snake_case` (ej. `id_producto`, `fecha_creacion`, `monto_declarado`).
- **Llaves primarias**: `id_<entidad_singular>` (ej. `id_producto`, `id_venta`).
- **Llaves foráneas**: mismo nombre que la PK referenciada (ej. `id_usuario` en `ventas` referencia `usuarios.id_usuario`).
- **Constraints**: prefijo según tipo — `fk_` para llaves foráneas, `chk_` para checks, `uq_` para unique (ej. `fk_venta_usuario`, `chk_pago_coincide`, `uq_receta_producto_insumo`).
- **Índices**: prefijo `idx_` + tabla + columna (ej. `idx_ventas_fecha`).

### 3.4 API REST (endpoints)
- Recursos en plural y `kebab-case` cuando aplique (ej. `/api/productos`, `/api/corte-caja`, `/api/movimientos-inventario`).
- Verbos HTTP estándar: `GET`, `POST`, `PUT`/`PATCH`, `DELETE` — no se usan verbos en la URL.
- Acciones específicas como sub-recurso cuando no son CRUD puro (ej. `POST /api/corte-caja/:id/cerrar`, `POST /api/ventas/:id/anular`).
- Parámetros de query en `camelCase` (ej. `?fechaInicio=...&fechaFin=...`).

### 3.5 Ramas y commits Git
- **Ramas**: `tipo/descripcion-corta` (ej. `feature/corte-caja`, `fix/calculo-diferencia`, `chore/setup-supabase`).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`), en español o inglés consistente con el resto del equipo (ej. `feat: agregar endpoint de apertura de caja`).

### 3.6 Variables de entorno
- **Backend** (`.env`): `UPPER_SNAKE_CASE` (ej. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`).
- **Frontend** (`.env`, Vite): mismo formato con prefijo obligatorio `VITE_` (ej. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

---

## 4. Notas de alineación con `spec.md`

- La separación por **módulos** (`productos`, `ventas`, `inventario`, `corte-caja`, `usuarios`) en backend y **features** en frontend refleja directamente los módulos definidos en la sección 1.1 del spec.
- El middleware `role.middleware.js` implementa el control de acceso por rol exigido en la restricción 4.3 (RBAC).
- La lógica de descuento automático de inventario (HU-10) y reversión por anulación (HU-07) se centraliza en `inventario/movimientos.service.js`, invocado desde `ventas.service.js`, para mantener una sola fuente de verdad sobre cómo se afecta el stock.
- El uso de `DECIMAL`/tipos numéricos exactos en la base de datos (definido en `schema.sql`) se complementa en el código con librerías de precisión decimal si se requieren cálculos complejos en backend (evitar floats nativos de JS para montos), conforme a la restricción 4.2 del spec.

---

## 5. Próximos pasos sugeridos

1. Inicializar repositorios/carpetas `backend` y `frontend` con la estructura aquí definida.
2. Configurar proyecto en Supabase y ejecutar `schema.sql`.
3. Definir contratos de API (endpoints, payloads) por módulo antes de implementar.
4. Implementar autenticación y RBAC como base, antes de los módulos funcionales.
5. Implementar módulo de productos (el más simple) como prueba de la arquitectura, luego ventas, inventario y corte de caja.
