# POS Cafetería — Frontend

Interfaz de usuario construida con React 18 + Vite + Tailwind CSS.

## Requisitos
- Node.js >= 18
- Backend corriendo (ver `backend/README.md`)

## Instalacion
npm install
cp .env.example .env   # completar con la URL del backend

## Variables de entorno
| Variable       | Descripcion                        | Ejemplo                       |
|----------------|------------------------------------|-------------------------------|
| VITE_API_URL   | URL base del backend Express       | http://localhost:3000         |

## Uso
npm run dev      # desarrollo en http://localhost:5173
npm run build    # compilar para produccion
npm run preview  # previsualizar build

## Modulos
- /login        → Inicio de sesion
- /ventas       → Punto de venta (cajero, administrador)
- /productos    → Gestion de productos (administrador)
- /inventario   → Gestion de insumos (administrador, inventario)
- /corte-caja   → Apertura y cierre de caja (cajero, administrador)
- /reportes     → Reportes y descarga CSV (administrador)

## Estructura
src/
├── lib/            # Cliente HTTP (axios)
├── context/        # AuthContext, CajaContext
├── routes/         # Configuracion de React Router
├── components/     # Componentes comunes y layout
└── features/       # Modulos por dominio (auth, productos, ventas, etc.)
