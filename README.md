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
