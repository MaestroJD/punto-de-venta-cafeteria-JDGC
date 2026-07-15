# Tasks Frontend — Sistema POS Cafetería
**Proyecto:** ITH Sistemas y Computación
**Stack:** React 18 + Vite + Tailwind CSS + React Router + React Query

> Tareas atómicas derivadas de `spec.md` (historias de usuario HU-01 a HU-16)
> y `plan.md` (estructura de carpetas y convenciones).
> Cada tarea cubre una pantalla, componente o hook específico y tiene un
> criterio de verificación visual en formato Given/When/Then.
>
> **Convenciones aplicadas (skill-ith-backend.md):**
> - Archivos en inglés, minúsculas, con guión (`login-form.jsx`, `use-auth.js`)
> - Variables y funciones en inglés camelCase (`handleSubmit`, `fetchProducts`)
> - Comentarios en español
> - Respuestas de API esperadas: `{ success: true, data }` / `{ success: false, error }`
>
> ID de tarea: `TF-XX`. Las fases respetan dependencias de la misma forma
> que `tasks.md` del backend.

---

## Fase 0 — Setup del proyecto

**TF-01: Inicializar proyecto con Vite + React**
Crear la carpeta `frontend/` con `npm create vite@latest` (template React), instalar dependencias: `react-router-dom`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`.
*Archivo principal:* `main.jsx`, `vite.config.js`

```
Given que el proyecto acaba de inicializarse
When se ejecuta `npm run dev`
Then el navegador muestra la pantalla de bienvenida de Vite en http://localhost:5173 sin errores en consola
```

---

**TF-02: Configurar Tailwind CSS**
Instalar y configurar `tailwindcss`, `postcss` y `autoprefixer`. Agregar las directivas `@tailwind` en `src/index.css`.
*Archivo principal:* `tailwind.config.js`, `src/index.css`

```
Given que Tailwind está instalado y configurado
When se agrega la clase `bg-blue-500` a cualquier elemento en `App.jsx`
Then el elemento se renderiza con fondo azul en el navegador sin errores de compilación
```

---

**TF-03: Configurar variables de entorno**
Crear `.env.example` con `VITE_API_URL` y `VITE_SUPABASE_ANON_KEY`. Crear `.env` real (no versionado). Verificar que `.env` esté en `.gitignore`.
*Archivo principal:* `.env.example`, `.gitignore`

```
Given que `.env` contiene `VITE_API_URL=http://localhost:3000`
When se imprime `import.meta.env.VITE_API_URL` en cualquier componente
Then el valor mostrado es `http://localhost:3000` y la variable no aparece expuesta en el bundle de producción
```

---

**TF-04: Crear cliente HTTP centralizado**
Crear `src/lib/api-client.js` con una instancia de `axios` que tome `VITE_API_URL` como base, intercepte respuestas para manejar el formato `{ success, data, error }` del backend, e inyecte el token JWT del usuario autenticado en cada petición.
*Archivo:* `src/lib/api-client.js`

```
Given que el usuario tiene un token guardado en contexto
When cualquier módulo llama a `apiClient.get('/productos')`
Then la petición incluye el header `Authorization: Bearer <token>` y en caso de 401 redirige automáticamente al login
```

---

**TF-05: Configurar React Query**
Envolver la app en `<QueryClientProvider>` en `main.jsx` con opciones de `staleTime` y `retry` sensatas para un POS (datos frescos cada 30s, sin reintentos automáticos en errores 4xx).
*Archivo:* `src/main.jsx`

```
Given que React Query está configurado
When un hook de datos (`useQuery`) falla con 401
Then no hace reintentos automáticos y el error llega al componente sin loops de red
```

---

**TF-06: Configurar React Router y estructura de rutas**
Crear `src/routes/app-routes.jsx` con las rutas: `/login`, `/ventas`, `/productos`, `/inventario`, `/corte-caja`, `/reportes`. Rutas privadas redirigen a `/login` si no hay sesión.
*Archivo:* `src/routes/app-routes.jsx`

```
Given que el usuario no está autenticado
When intenta navegar a `/ventas` directamente en la barra del navegador
Then es redirigido a `/login` automáticamente sin ver la pantalla de ventas
```

---

## Fase 1 — Componentes comunes (base reutilizable)

**TF-07: Componente `Button`**
Crear `src/components/common/button.jsx` con variantes `primary`, `secondary`, `danger` y estado `isLoading` (muestra spinner, deshabilita el click).
*Archivo:* `src/components/common/button.jsx`

```
Given que el botón tiene `isLoading={true}`
When se renderiza en cualquier formulario
Then muestra un spinner animado, el texto cambia a "Cargando..." y no es clickeable

Given que el botón tiene variante `danger`
When se renderiza
Then aparece con fondo rojo diferenciable de los botones primarios
```

---

**TF-08: Componente `Input` con manejo de errores**
Crear `src/components/common/input.jsx` que reciba `label`, `error` y sea compatible con `react-hook-form` mediante `register`. Muestra el mensaje de error debajo del campo cuando existe.
*Archivo:* `src/components/common/input.jsx`

```
Given que un campo tiene un error de validación
When el usuario intenta enviar el formulario
Then el borde del input cambia a rojo y el mensaje de error aparece debajo del campo en texto rojo
```

---

**TF-09: Componente `Modal`**
Crear `src/components/common/modal.jsx` con `title`, `children`, `isOpen` y `onClose`. Cierra al hacer click fuera del contenido o en el botón X. Bloquea el scroll del fondo mientras está abierto.
*Archivo:* `src/components/common/modal.jsx`

```
Given que `isOpen={true}`
When se renderiza el Modal
Then aparece centrado en pantalla con fondo oscuro semitransparente y el resto de la UI no es interactuable

Given que el usuario hace click fuera del modal
When el overlay recibe el click
Then el modal se cierra y `onClose` es invocado
```

---

**TF-10: Componente `Table`**
Crear `src/components/common/table.jsx` que reciba `columns` (array de `{ key, label }`) y `data` (array de objetos). Muestra mensaje "Sin resultados" cuando `data` está vacío.
*Archivo:* `src/components/common/table.jsx`

```
Given que `data` es un array vacío
When se renderiza la tabla
Then se muestra el mensaje "Sin resultados" en lugar de una tabla vacía

Given que `data` tiene registros
When se renderiza la tabla
Then cada fila muestra los valores correspondientes a las columnas definidas en el mismo orden
```

---

**TF-11: Componente `Sidebar` (navegación principal)**
Crear `src/components/layout/sidebar.jsx` con los enlaces de navegación según el rol del usuario: cajero ve Ventas y Corte de Caja; administrador ve todos los módulos; inventario ve Inventario.
*Archivo:* `src/components/layout/sidebar.jsx`

```
Given que el usuario autenticado tiene rol `cajero`
When se renderiza el Sidebar
Then solo aparecen los enlaces "Ventas" y "Corte de Caja", sin "Productos", "Inventario" ni "Reportes"

Given que el usuario tiene rol `administrador`
When se renderiza el Sidebar
Then aparecen todos los enlaces de navegación disponibles
```

---

**TF-12: Componente `Header`**
Crear `src/components/layout/header.jsx` que muestre el nombre del usuario autenticado, su rol y un botón de "Cerrar sesión".
*Archivo:* `src/components/layout/header.jsx`

```
Given que el usuario "María García" con rol "cajero" está autenticado
When se renderiza el Header
Then aparece el texto "María García" y la etiqueta "cajero" visible en la parte superior

Given que el usuario hace click en "Cerrar sesión"
When `handleLogout` es invocado
Then el token es eliminado del contexto, la sesión termina y el usuario es redirigido a `/login`
```

---

**TF-13: Componente `ProtectedRoute`**
Crear `src/components/layout/protected-route.jsx` que, además de verificar autenticación, reciba un prop `allowedRoles` y bloquee el acceso si el rol del usuario no está permitido, mostrando una pantalla de "Acceso denegado".
*Archivo:* `src/components/layout/protected-route.jsx`

```
Given que el usuario tiene rol `cajero` e intenta acceder a `/productos`
When `ProtectedRoute` evalúa `allowedRoles={['administrador']}`
Then se renderiza una pantalla "Acceso denegado" en lugar del contenido de la ruta

Given que el usuario tiene rol `administrador` e intenta acceder a `/productos`
When `ProtectedRoute` evalúa `allowedRoles={['administrador']}`
Then se renderiza correctamente la pantalla de Productos
```

---

## Fase 2 — Módulo de Autenticación

**TF-14: API layer de autenticación**
Crear `src/features/auth/api/auth-api.js` con la función `login(email, password)` que llame a `POST /api/auth/login` y devuelva `{ token, usuario }`.
*Archivo:* `src/features/auth/api/auth-api.js`

```
Given que el backend está corriendo y el usuario existe
When `login('admin@pos.com', 'admin123')` es llamado
Then devuelve un objeto con `token` (string no vacío) y `usuario.rol` igual al rol registrado en la base de datos
```

---

**TF-15: Hook `use-auth.js`**
Crear `src/features/auth/hooks/use-auth.js` que exponga `login(email, password)`, `logout()`, `user` (datos del usuario actual) y `isAuthenticated` (booleano). Persiste el token en `localStorage`.
*Archivo:* `src/features/auth/hooks/use-auth.js`

```
Given que el usuario llama a `login()` con credenciales válidas
When la promesa resuelve
Then `isAuthenticated` cambia a `true` y `user.rol` tiene el valor correcto

Given que el usuario llama a `logout()`
When la función ejecuta
Then `isAuthenticated` cambia a `false`, `user` es `null` y el token es eliminado de `localStorage`
```

---

**TF-16: Contexto `AuthContext`**
Crear `src/context/auth-context.jsx` que provea `user`, `isAuthenticated`, `login` y `logout` a toda la app mediante Context API. Recupera la sesión al recargar la página si el token sigue en `localStorage`.
*Archivo:* `src/context/auth-context.jsx`

```
Given que hay un token válido en `localStorage` y el usuario recarga la página
When `AuthContext` inicializa
Then el usuario permanece autenticado sin pasar por el login nuevamente
```

---

**TF-17: Componente `LoginForm`**
Crear `src/features/auth/components/login-form.jsx` con campos `email` y `password`, validados con `zod` + `react-hook-form`. Muestra error inline si las credenciales son incorrectas. Redirige a `/ventas` (cajero) o `/productos` (admin) según el rol tras el login exitoso.
*Archivo:* `src/features/auth/components/login-form.jsx`

```
Given que el usuario ingresa un email con formato inválido
When hace click en "Iniciar sesión" sin perder el foco del campo
Then aparece el mensaje "Debe ser un correo válido" debajo del campo email sin hacer petición al backend

Given que el usuario ingresa credenciales incorrectas
When hace click en "Iniciar sesión"
Then aparece un mensaje de error "Credenciales inválidas" visible en el formulario y el botón vuelve a ser clickeable

Given que las credenciales son correctas y el rol es `cajero`
When el login es exitoso
Then el usuario es redirigido automáticamente a `/ventas`
```

---

**TF-18: Página `LoginPage`**
Crear `src/pages/login-page.jsx` que centre el `LoginForm` en pantalla con el logo/nombre del sistema.
*Archivo:* `src/pages/login-page.jsx`

```
Given que el usuario accede a `/login`
When la página carga
Then se muestra el formulario de login centrado, con el nombre del sistema visible y sin mostrar la barra lateral de navegación
```

---

## Fase 3 — Módulo de Productos (HU-01 a HU-04)

**TF-19: API layer de productos**
Crear `src/features/productos/api/productos-api.js` con funciones: `fetchProducts()`, `createProduct(data)`, `updateProduct(id, data)`, `deactivateProduct(id)`, `fetchRecipe(id)`, `saveRecipe(id, insumos)`.
*Archivo:* `src/features/productos/api/productos-api.js`

```
Given que el backend está corriendo y el token es válido
When `fetchProducts()` es llamado
Then devuelve un array de productos activos con los campos `id_producto`, `nombre`, `precio`, `categoria`
```

---

**TF-20: Hook `use-productos.js`**
Crear `src/features/productos/hooks/use-productos.js` con `useQuery` para listar productos y `useMutation` para crear, editar y desactivar. Invalida el caché automáticamente tras cada mutación.
*Archivo:* `src/features/productos/hooks/use-productos.js`

```
Given que se acaba de crear un producto nuevo
When `createProduct` resuelve exitosamente
Then la lista de productos se actualiza automáticamente en pantalla sin necesidad de recargar la página
```

---

**TF-21: Componente `ProductoList`**
Crear `src/features/productos/components/producto-list.jsx` con tabla de productos (nombre, categoría, precio, estado activo/inactivo) y botones de acción: "Editar" y "Desactivar" (solo visibles para administradores). Incluye buscador por nombre y filtro por categoría.
*Archivo:* `src/features/productos/components/producto-list.jsx`

```
Given que hay 10 productos registrados y el usuario es administrador
When la lista carga
Then aparecen los 10 productos con botones "Editar" y "Desactivar" en cada fila

Given que el usuario escribe "cap" en el buscador
When el input cambia
Then la tabla filtra y muestra solo los productos cuyo nombre contiene "cap" (ej. "Capuchino")

Given que el usuario tiene rol `cajero`
When la lista carga
Then los botones "Editar" y "Desactivar" no son visibles
```

---

**TF-22: Componente `ProductoForm`**
Crear `src/features/productos/components/producto-form.jsx` con campos: nombre, categoría (select), precio (número positivo) y unidad de medida. Funciona tanto para crear como para editar (recibe `producto` como prop opcional para prellenar). Validado con `zod`.
*Archivo:* `src/features/productos/components/producto-form.jsx`

```
Given que el formulario está en modo "crear"
When el usuario deja el precio en blanco y hace submit
Then aparece el mensaje "El precio es obligatorio" bajo el campo precio y no se hace petición al backend

Given que el formulario está en modo "editar" con un producto existente
When el formulario carga
Then los campos nombre, categoría, precio y unidad de medida están prellenados con los datos del producto

Given que el usuario completa todos los campos correctamente y hace submit
When la mutación resuelve sin error
Then el modal se cierra y el nuevo producto aparece en la lista inmediatamente
```

---

**TF-23: Componente `RecetaForm`**
Crear `src/features/productos/components/receta-form.jsx` que, dentro de un modal, permita agregar/quitar insumos a la receta de un producto con su `cantidad_requerida`. Carga el listado de insumos del backend para el selector.
*Archivo:* `src/features/productos/components/receta-form.jsx`

```
Given que el administrador abre la receta de un producto que ya tiene insumos asociados
When el modal carga
Then los insumos actuales aparecen listados con su cantidad correspondiente

Given que el administrador agrega un insumo y hace click en "Guardar receta"
When la mutación resuelve
Then el modal cierra y al reabrirlo el nuevo insumo aparece en la lista de la receta
```

---

**TF-24: Página `ProductosPage`**
Crear `src/pages/productos-page.jsx` que integre `ProductoList` y un botón "Nuevo producto" (solo para admin) que abre `ProductoForm` en un `Modal`. Accesible solo para rol `administrador`.
*Archivo:* `src/pages/productos-page.jsx`

```
Given que el administrador está en `/productos`
When hace click en "Nuevo producto"
Then se abre un modal con el `ProductoForm` vacío listo para captura

Given que el administrador hace click en "Editar" en un producto de la lista
When el modal abre
Then el formulario aparece prellenado con los datos de ese producto
```

---

## Fase 4 — Módulo de Inventario (HU-09 a HU-12)

**TF-25: API layer de inventario**
Crear `src/features/inventario/api/inventario-api.js` con: `fetchInsumos()`, `createInsumo(data)`, `registerEntrada(id, data)`, `registerAjuste(id, data)`, `fetchAlertas()`, `fetchMovimientos(filtros)`.
*Archivo:* `src/features/inventario/api/inventario-api.js`

```
Given que el backend está corriendo
When `fetchAlertas()` es llamado
Then devuelve solo los insumos donde `stock_actual <= stock_minimo`
```

---

**TF-26: Hook `use-inventario.js`**
Crear `src/features/inventario/hooks/use-inventario.js` con queries para listar insumos y alertas, y mutaciones para crear insumo, registrar entrada y ajuste. Invalida caché tras cada mutación.
*Archivo:* `src/features/inventario/hooks/use-inventario.js`

```
Given que se registra una entrada de inventario
When `registerEntrada` resuelve exitosamente
Then el listado de insumos refleja el nuevo `stock_actual` sin recargar la página
```

---

**TF-27: Componente `AlertaStockBajo`**
Crear `src/features/inventario/components/alerta-stock-bajo.jsx` que muestre un banner o badge en el header/sidebar cuando hay insumos con stock bajo. Al hacer click navega al listado de inventario filtrado.
*Archivo:* `src/features/inventario/components/alerta-stock-bajo.jsx`

```
Given que hay 3 insumos con stock bajo
When el componente carga (consulta `GET /api/insumos/alertas`)
Then aparece un badge rojo con el número "3" sobre el ícono de inventario en el sidebar

Given que no hay insumos con stock bajo
When el componente carga
Then el badge no aparece (o muestra cero sin color de alerta)
```

---

**TF-28: Componente `InsumoList`**
Crear `src/features/inventario/components/insumo-list.jsx` con tabla de insumos (nombre, unidad de medida, stock actual, stock mínimo). Las filas con stock bajo se resaltan en amarillo/rojo. Botones "Entrada" y "Ajuste" por fila.
*Archivo:* `src/features/inventario/components/insumo-list.jsx`

```
Given que un insumo tiene `stock_actual <= stock_minimo`
When la tabla renderiza esa fila
Then la fila aparece con fondo amarillo o rojo diferenciado del resto visualmente

Given que el usuario hace click en "Entrada" en un insumo
When el botón es presionado
Then se abre un modal con el formulario de registro de entrada para ese insumo específico
```

---

**TF-29: Componente `EntradaAjusteForm`**
Crear `src/features/inventario/components/entrada-ajuste-form.jsx` que sirva para registrar tanto una entrada (cantidad positiva) como un ajuste (positivo o negativo con motivo obligatorio). El tipo se define por un prop `mode` (`entrada` | `ajuste`).
*Archivo:* `src/features/inventario/components/entrada-ajuste-form.jsx`

```
Given que `mode="ajuste"` y el usuario deja el campo motivo vacío
When hace click en "Guardar"
Then aparece el error "El motivo es obligatorio" y no se envía la petición

Given que `mode="entrada"` y el usuario ingresa cantidad 50
When el formulario es enviado exitosamente
Then el modal cierra y el stock del insumo en la tabla aumenta en 50 unidades
```

---

**TF-30: Página `InventarioPage`**
Integrar en `src/pages/inventario-page.jsx` el listado de insumos, botón "Nuevo insumo" y el banner de alertas. Accesible para roles `administrador` e `inventario`.
*Archivo:* `src/pages/inventario-page.jsx`

```
Given que el usuario con rol `inventario` está en `/inventario`
When la página carga
Then ve la lista de insumos y puede registrar entradas y ajustes, pero no ve las opciones de administración de usuarios ni productos
```

---

## Fase 5 — Módulo de Corte de Caja (HU-13, HU-14, HU-15, HU-16)

**TF-31: API layer de corte de caja**
Crear `src/features/corte-caja/api/corte-caja-api.js` con: `openCashRegister(montoInicial)`, `closeCashRegister(id, montoDeclarado)`, `getMyOpenRegister()`, `fetchRegisterDetail(id)`, `fetchRegisterHistory(filtros)`.
*Archivo:* `src/features/corte-caja/api/corte-caja-api.js`

```
Given que el cajero no tiene caja abierta
When `openCashRegister(500)` es llamado
Then devuelve el objeto de la caja recién creada con `estado: 'abierta'` e `id_corte` válido
```

---

**TF-32: Contexto `CajaContext`**
Crear `src/context/caja-context.jsx` que mantenga en estado global si el cajero tiene una caja abierta (`cajaActual`) y su `id_corte`. Se consulta al inicio de sesión y se actualiza al abrir/cerrar caja.
*Archivo:* `src/context/caja-context.jsx`

```
Given que el cajero inicia sesión y ya tiene una caja abierta en el backend
When `CajaContext` inicializa (llama `GET /api/corte-caja/mi-caja`)
Then `cajaActual` tiene los datos de la caja abierta y está disponible en toda la app sin peticiones adicionales
```

---

**TF-33: Componente `AperturaCajaForm`**
Crear `src/features/corte-caja/components/apertura-caja-form.jsx` con un campo de monto inicial (número ≥ 0) y botón "Abrir caja". Si el cajero ya tiene caja abierta, muestra los datos de la caja activa en lugar del formulario.
*Archivo:* `src/features/corte-caja/components/apertura-caja-form.jsx`

```
Given que el cajero no tiene caja abierta
When accede a la pantalla de Corte de Caja
Then ve el formulario de apertura con el campo de monto inicial y el botón "Abrir caja"

Given que el cajero ya tiene una caja abierta
When accede a la pantalla de Corte de Caja
Then ve los datos de su caja activa (fecha apertura, monto inicial) y el botón "Cerrar caja", sin el formulario de apertura
```

---

**TF-34: Componente `CierreCajaForm`**
Crear `src/features/corte-caja/components/cierre-caja-form.jsx` con campo de monto declarado (efectivo contado físicamente). Al confirmar, muestra un resumen con: ventas del turno, monto esperado, monto declarado y diferencia (sobrante/faltante con color verde/rojo).
*Archivo:* `src/features/corte-caja/components/cierre-caja-form.jsx`

```
Given que el cajero ingresa el monto declarado y confirma el cierre
When la respuesta del backend llega
Then se muestra el resumen del corte con diferencia en verde si es cero o sobrante, en rojo si hay faltante

Given que la diferencia es de -$50 (faltante)
When el resumen se renderiza
Then el valor "-$50.00" aparece en color rojo con etiqueta "Faltante"
```

---

**TF-35: Componente `HistorialCortes`**
Crear `src/features/corte-caja/components/historial-cortes.jsx` con tabla de cortes filtrable por fecha y cajero. Cada fila muestra: fecha, cajero, total ventas, diferencia y estado. Click en una fila abre el detalle del corte.
*Archivo:* `src/features/corte-caja/components/historial-cortes.jsx`

```
Given que el administrador filtra por un rango de fechas específico
When aplica el filtro
Then la tabla muestra solo los cortes dentro de ese rango

Given que el administrador hace click en un corte de la tabla
When la fila es seleccionada
Then se muestra el detalle del corte con el desglose por método de pago (efectivo / tarjeta)
```

---

**TF-36: Página `CorteCajaPage`**
Crear `src/pages/corte-caja-page.jsx` que muestre `AperturaCajaForm` o `CierreCajaForm` según el estado de la caja, y para administradores también el `HistorialCortes`.
*Archivo:* `src/pages/corte-caja-page.jsx`

```
Given que el cajero abre la caja con $300 de monto inicial
When la apertura es exitosa
Then la pantalla cambia automáticamente al estado de caja abierta mostrando los datos de la caja activa y el botón "Cerrar caja"
```

---

## Fase 6 — Módulo de Ventas (HU-05 a HU-08)

**TF-37: API layer de ventas**
Crear `src/features/ventas/api/ventas-api.js` con: `createSale(payload)`, `voidSale(id)`, `getSaleTicket(id)`, `fetchSalesReport(filtros)`.
*Archivo:* `src/features/ventas/api/ventas-api.js`

```
Given que hay una caja abierta y productos activos con stock
When `createSale({ id_corte, metodo_pago, monto_efectivo, monto_tarjeta, items })` es llamado
Then devuelve la venta creada con `id_venta`, `total` y el detalle de productos
```

---

**TF-38: Hook `use-ventas.js`**
Crear `src/features/ventas/hooks/use-ventas.js` con estado local del carrito (productos agregados y sus cantidades), `addItem(producto)`, `removeItem(idProducto)`, `clearCart()`, `submitSale(metodoPago, montos)` y `total` calculado.
*Archivo:* `src/features/ventas/hooks/use-ventas.js`

```
Given que el carrito tiene 2 unidades de "Capuchino" a $45
When `addItem` agrega 1 unidad más del mismo producto
Then la cantidad del producto en el carrito cambia a 3 y el `total` se recalcula a $135

Given que `clearCart()` es llamado
When la función ejecuta
Then el carrito queda vacío y el total regresa a $0
```

---

**TF-39: Componente `ProductoCard`**
Crear `src/features/ventas/components/producto-card.jsx` que muestre nombre, precio y categoría de un producto en un card cuadrado optimizado para touch. Al hacer click agrega 1 unidad al carrito.
*Archivo:* `src/features/ventas/components/producto-card.jsx`

```
Given que el cajero hace tap/click en la card del producto "Café americano"
When el click es registrado
Then el producto aparece en el carrito (o su cantidad incrementa si ya estaba) y hay feedback visual inmediato (animación o borde resaltado)

Given que el producto está inactivo
When la lista de productos filtra por activos
Then la card de ese producto no aparece en el grid de ventas
```

---

**TF-40: Componente `CarritoVenta`**
Crear `src/features/ventas/components/carrito-venta.jsx` que liste los productos agregados con cantidad, precio unitario y subtotal por línea. Permite ajustar cantidad (+/-) o eliminar un producto del carrito. Muestra el total al pie. Incluye selector de método de pago y campos de monto efectivo/tarjeta para pago mixto.
*Archivo:* `src/features/ventas/components/carrito-venta.jsx`

```
Given que el carrito tiene productos y el cajero selecciona "mixto" como método de pago
When el selector cambia
Then aparecen dos campos: "Monto efectivo" y "Monto tarjeta" que deben sumar el total

Given que los montos de pago mixto no suman el total
When el cajero hace click en "Confirmar venta"
Then aparece el mensaje "Los montos no coinciden con el total" y la venta no se envía

Given que el cajero elimina un producto del carrito con el botón de quitar
When el producto es removido
Then desaparece de la lista y el total se recalcula correctamente
```

---

**TF-41: Componente `TicketPreview`**
Crear `src/features/ventas/components/ticket-preview.jsx` que, al confirmarse la venta, muestre el ticket dentro de un modal: folio, fecha, cajero, lista de productos con cantidades y subtotales, total y método de pago. Con botón "Imprimir" que activa `window.print()`.
*Archivo:* `src/features/ventas/components/ticket-preview.jsx`

```
Given que la venta es confirmada exitosamente
When el backend responde con `success: true`
Then el modal del ticket se abre automáticamente con todos los datos de la venta (folio, productos, total)

Given que el cajero hace click en "Imprimir"
When `window.print()` es invocado
Then el navegador abre el diálogo de impresión mostrando solo el ticket (sin la barra lateral ni el header)
```

---

**TF-42: Página `VentasPage`**
Crear `src/pages/ventas-page.jsx` con layout de dos columnas: izquierda = grid de `ProductoCard` (filtrable por categoría), derecha = `CarritoVenta`. Al confirmar venta exitosa, abre `TicketPreview` y limpia el carrito. Bloquea la acción si no hay caja abierta mostrando un aviso prominente.
*Archivo:* `src/pages/ventas-page.jsx`

```
Given que el cajero accede a `/ventas` sin tener una caja abierta
When la página carga
Then aparece un aviso "Debes abrir una caja antes de registrar ventas" y el botón "Confirmar venta" está deshabilitado

Given que hay una caja abierta y el cajero confirma una venta válida
When la venta es procesada exitosamente
Then el carrito se vacía, el ticket aparece en un modal y la pantalla queda lista para la siguiente venta

Given que el cajero filtra productos por la categoría "Bebidas"
When el filtro se aplica
Then el grid muestra solo los productos cuya categoría es "Bebidas"
```

---

## Fase 7 — Módulo de Reportes (HU-15, HU-16, restricción 4.6)

**TF-43: API layer de reportes**
Crear `src/features/reportes/api/reportes-api.js` con `fetchSalesReport(filtros)` que soporte parámetros `fechaInicio`, `fechaFin`, `idUsuario` y `formato=csv` para descarga directa.
*Archivo:* `src/features/reportes/api/reportes-api.js`

```
Given que el administrador solicita el reporte con `formato=csv`
When `fetchSalesReport({ formato: 'csv' })` ejecuta
Then el navegador descarga un archivo `.csv` con las ventas del período solicitado
```

---

**TF-44: Página `ReportesPage`**
Crear `src/pages/reportes-page.jsx` con filtros de fecha (date pickers), selector de cajero y botones "Ver reporte" (tabla en pantalla) y "Descargar CSV". Muestra totales por método de pago al pie de la tabla. Accesible solo para `administrador`.
*Archivo:* `src/pages/reportes-page.jsx`

```
Given que el administrador selecciona un rango de fechas y hace click en "Ver reporte"
When los datos cargan
Then la tabla muestra las ventas del período con columnas: folio, fecha, cajero, total, método de pago y estado

Given que el administrador hace click en "Descargar CSV"
When el botón es presionado
Then el navegador inicia la descarga del archivo `reporte-ventas.csv` sin navegar a otra página
```

---

## Fase 8 — Calidad y cierre

**TF-45: Manejo global de errores de red**
Configurar el interceptor de `api-client.js` para mostrar un toast/notificación cuando el backend responde con `success: false` o hay un error de red (timeout, sin conexión). El toast desaparece automáticamente a los 4 segundos.
*Archivo:* `src/lib/api-client.js` (actualizar)

```
Given que el backend está caído y el usuario intenta registrar una venta
When la petición falla por error de red
Then aparece una notificación roja en la esquina superior derecha con el mensaje "Error de conexión. Intenta de nuevo."
```

---

**TF-46: Estado de carga global (skeletons)**
Agregar estados de carga esqueleto (`skeleton`) en `ProductoList`, `InsumoList` e `HistorialCortes` mientras los datos están siendo obtenidos, en lugar de pantallas en blanco.
*Archivos:* los componentes de lista de cada módulo

```
Given que los datos están siendo cargados desde el backend
When el componente renderiza por primera vez
Then aparecen rectangulos grises animados (skeleton) en lugar de filas vacías o un spinner centrado
```

---

**TF-47: Responsive básico para pantallas táctiles**
Verificar que `VentasPage` y `CorteCajaPage` sean usables en tablets/pantallas táctiles (mínimo 768px). Los botones de `ProductoCard` deben tener área de toque mínima de 44x44px según la restricción 4.5 del spec.
*Archivo:* estilos en los componentes correspondientes

```
Given que la app se abre en una tablet con resolución 1024x768
When el cajero usa la pantalla de ventas
Then las cards de productos tienen tamaño suficiente para ser presionadas con el dedo, el carrito se muestra adecuadamente y no hay scroll horizontal
```

---

**TF-48: Variables de entorno en producción y README**
Completar `README.md` del frontend con instrucciones de instalación, variables de entorno requeridas (`VITE_API_URL`, `VITE_SUPABASE_ANON_KEY`) y comandos `dev` / `build` / `preview`.
*Archivo:* `README.md`, `.env.example`

```
Given que un desarrollador nuevo clona el repositorio y sigue el README
When ejecuta `npm install && npm run dev`
Then la app corre sin errores con las variables de entorno del `.env.example` como guía
```

---

## Resumen de dependencias entre fases

```
Fase 0 (Setup: Vite, Tailwind, Router, React Query, API client)
   ↓
Fase 1 (Componentes comunes: Button, Input, Modal, Table, Sidebar, Header, ProtectedRoute)
   ↓
Fase 2 (Auth: login-form, use-auth, AuthContext, LoginPage)
   ↓
Fase 3 (Productos: lista, form, receta)        Fase 4 (Inventario: lista, entradas, ajustes, alertas)
         ↓                                                       ↓
Fase 5 (Corte de Caja: apertura, cierre, historial, CajaContext)
                           ↓
Fase 6 (Ventas: carrito, cards, ticket, VentasPage) ← depende de Productos, Inventario y CajaContext
                           ↓
Fase 7 (Reportes: filtros, tabla, descarga CSV)
                           ↓
Fase 8 (Calidad: errores globales, skeletons, responsive, README)
```

---

## Tabla resumen de archivos por tarea

| ID    | Archivo principal                                          | HU relacionada     |
|-------|------------------------------------------------------------|--------------------|
| TF-01 | `main.jsx`, `vite.config.js`                               | —                  |
| TF-02 | `tailwind.config.js`, `src/index.css`                      | —                  |
| TF-03 | `.env.example`                                             | Restricción 4.3    |
| TF-04 | `src/lib/api-client.js`                                    | —                  |
| TF-05 | `src/main.jsx`                                             | —                  |
| TF-06 | `src/routes/app-routes.jsx`                                | Restricción 4.3    |
| TF-07 | `src/components/common/button.jsx`                         | —                  |
| TF-08 | `src/components/common/input.jsx`                          | —                  |
| TF-09 | `src/components/common/modal.jsx`                          | —                  |
| TF-10 | `src/components/common/table.jsx`                          | —                  |
| TF-11 | `src/components/layout/sidebar.jsx`                        | Restricción 4.3    |
| TF-12 | `src/components/layout/header.jsx`                         | —                  |
| TF-13 | `src/components/layout/protected-route.jsx`                | Restricción 4.3    |
| TF-14 | `src/features/auth/api/auth-api.js`                        | —                  |
| TF-15 | `src/features/auth/hooks/use-auth.js`                      | —                  |
| TF-16 | `src/context/auth-context.jsx`                             | —                  |
| TF-17 | `src/features/auth/components/login-form.jsx`              | —                  |
| TF-18 | `src/pages/login-page.jsx`                                 | —                  |
| TF-19 | `src/features/productos/api/productos-api.js`              | HU-01 a HU-04     |
| TF-20 | `src/features/productos/hooks/use-productos.js`            | HU-01 a HU-04     |
| TF-21 | `src/features/productos/components/producto-list.jsx`      | HU-02, HU-03       |
| TF-22 | `src/features/productos/components/producto-form.jsx`      | HU-01, HU-02       |
| TF-23 | `src/features/productos/components/receta-form.jsx`        | HU-04              |
| TF-24 | `src/pages/productos-page.jsx`                             | HU-01 a HU-04     |
| TF-25 | `src/features/inventario/api/inventario-api.js`            | HU-09 a HU-12     |
| TF-26 | `src/features/inventario/hooks/use-inventario.js`          | HU-09 a HU-12     |
| TF-27 | `src/features/inventario/components/alerta-stock-bajo.jsx` | HU-11              |
| TF-28 | `src/features/inventario/components/insumo-list.jsx`       | HU-09, HU-11       |
| TF-29 | `src/features/inventario/components/entrada-ajuste-form.jsx`| HU-09, HU-12      |
| TF-30 | `src/pages/inventario-page.jsx`                            | HU-09 a HU-12     |
| TF-31 | `src/features/corte-caja/api/corte-caja-api.js`            | HU-13 a HU-16     |
| TF-32 | `src/context/caja-context.jsx`                             | HU-13, HU-14       |
| TF-33 | `src/features/corte-caja/components/apertura-caja-form.jsx`| HU-13              |
| TF-34 | `src/features/corte-caja/components/cierre-caja-form.jsx`  | HU-14              |
| TF-35 | `src/features/corte-caja/components/historial-cortes.jsx`  | HU-15, HU-16       |
| TF-36 | `src/pages/corte-caja-page.jsx`                            | HU-13 a HU-16     |
| TF-37 | `src/features/ventas/api/ventas-api.js`                    | HU-05 a HU-08     |
| TF-38 | `src/features/ventas/hooks/use-ventas.js`                  | HU-05, HU-06       |
| TF-39 | `src/features/ventas/components/producto-card.jsx`         | HU-05              |
| TF-40 | `src/features/ventas/components/carrito-venta.jsx`         | HU-05, HU-06       |
| TF-41 | `src/features/ventas/components/ticket-preview.jsx`        | HU-08              |
| TF-42 | `src/pages/ventas-page.jsx`                                | HU-05 a HU-08     |
| TF-43 | `src/features/reportes/api/reportes-api.js`                | Restricción 4.6    |
| TF-44 | `src/pages/reportes-page.jsx`                              | HU-15, HU-16       |
| TF-45 | `src/lib/api-client.js` (errores globales)                 | Restricción 4.1    |
| TF-46 | Componentes de lista (skeletons)                           | Restricción 4.1    |
| TF-47 | Estilos responsive en ventas y corte de caja               | Restricción 4.5    |
| TF-48 | `README.md`, `.env.example`                                | —                  |
