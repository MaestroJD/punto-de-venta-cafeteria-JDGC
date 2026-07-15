# Tasks.md — Backend del Sistema POS Cafetería

> Lista de tareas atómicas derivadas de `spec.md` (historias de usuario y
> criterios de aceptación) y `plan.md` (stack y estructura de carpetas).
> Cada tarea es verificable de forma independiente y tiene un criterio
> explícito de "terminado" (Definition of Done).
>
> Convención de IDs: `T-XX`. Las tareas están ordenadas por fase para
> respetar dependencias (no se puede construir ventas sin productos, no se
> puede hacer corte de caja sin ventas, etc.).

---

## Fase 0 — Setup del proyecto

**T-01: Inicializar proyecto backend**
Crear carpeta `backend/` con `npm init`, instalar `express`, `dotenv`, `cors`, y configurar `package.json` con scripts `dev` y `start`.
*Criterio de terminado:* `npm run dev` levanta un servidor Express en el puerto definido por `.env` y responde `200 OK` en una ruta `GET /health`.

**T-02: Configurar estructura de carpetas base**
Crear la estructura de `src/` (`config/`, `modules/`, `middlewares/`, `utils/`, `types/`, `routes/`) según `plan.md`.
*Criterio de terminado:* la estructura de carpetas existe en el repositorio y `app.js`/`server.js` arrancan sin errores referenciando rutas vacías.

**T-03: Configurar conexión a Supabase**
Crear `src/config/supabaseClient.js` que inicialice el cliente con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde variables de entorno.
*Criterio de terminado:* un script de prueba (`node src/config/supabaseClient.test-connection.js` o test unitario) consulta una tabla existente y recibe respuesta sin error de autenticación.

**T-04: Ejecutar `schema.sql` en el proyecto Supabase**
Ejecutar el script `schema.sql` en el editor SQL de Supabase para crear las 8 tablas (`usuarios`, `productos`, `corte_caja`, `ventas`, `detalle_venta`, `insumos`, `receta`, `movimientos_inventario`).
*Criterio de terminado:* las 8 tablas aparecen en el panel de Supabase con sus columnas, PKs, FKs y constraints tal como están definidos en `schema.sql`, verificable con `\d nombre_tabla` o el inspector visual de Supabase.

**T-05: Configurar variables de entorno**
Crear `.env.example` con todas las variables requeridas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, etc.) y `.env` real (no versionado).
*Criterio de terminado:* `.env.example` existe en el repo, `.env` está en `.gitignore`, y el servidor falla con un mensaje claro si falta una variable obligatoria (validación en `config/env.js`).

**T-06: Configurar middleware global de manejo de errores**
Crear `errorHandler.middleware.js` que capture errores y devuelva respuestas JSON consistentes (`{ error: { message, code } }`).
*Criterio de terminado:* al forzar un error en cualquier ruta de prueba, la respuesta HTTP tiene un código de estado apropiado (4xx/5xx) y body en el formato estándar definido.

**T-07: Configurar middleware de validación de payloads**
Crear `validate.middleware.js` que reciba un esquema `zod` y valide `req.body`/`req.query`/`req.params`.
*Criterio de terminado:* al enviar un payload inválido a una ruta de prueba protegida con este middleware, se responde `400` con el detalle del campo inválido, sin llegar al controlador.

---

## Fase 1 — Autenticación y usuarios (HU transversal, restricción 4.3)

**T-08: Crear modelo y servicio de usuarios**
Implementar `usuarios.service.js` con funciones para crear, obtener por id, listar y desactivar usuarios contra la tabla `usuarios`.
*Criterio de terminado:* pruebas unitarias cubren creación, lectura y desactivación de un usuario contra una base de datos de prueba (o mock de Supabase), todas en verde.

**T-09: Implementar middleware de autenticación**
Crear `auth.middleware.js` que valide el JWT de Supabase Auth en el header `Authorization` y adjunte el usuario autenticado a `req.user`.
*Criterio de terminado:* una ruta protegida de prueba responde `401` sin token o con token inválido, y `200` con un token válido, devolviendo el `id_usuario` correcto en `req.user`.

**T-10: Implementar middleware de control de acceso por rol (RBAC)**
Crear `role.middleware.js` que reciba una lista de roles permitidos y bloquee la petición si `req.user.rol` no está incluido.
*Criterio de terminado:* una ruta protegida con `role.middleware(['administrador'])` responde `403` cuando la prueba usa un usuario con rol `cajero`, y `200` con rol `administrador`.

**T-11: Endpoint de login**
Crear `POST /api/auth/login` que delegue la autenticación a Supabase Auth y devuelva el token de sesión junto con el rol del usuario.
*Criterio de terminado:* con credenciales válidas responde `200` con `{ token, usuario: { id, nombre, rol } }`; con credenciales inválidas responde `401`.

---

## Fase 2 — Módulo de Productos (HU-01 a HU-04)

**T-12: Endpoint crear producto (HU-01)**
Implementar `POST /api/productos` validado con `productos.schema.js` (nombre, categoría, precio > 0, unidad de medida obligatorios).
*Criterio de terminado:* Given/When/Then de HU-01 pasa como prueba de integración: petición válida crea el registro en `productos` y responde `201` con el producto creado; petición con precio ≤ 0 o sin nombre responde `400`.

**T-13: Endpoint listar productos**
Implementar `GET /api/productos` con filtro opcional por `categoria` y por `activo`.
*Criterio de terminado:* la respuesta `200` devuelve solo productos con `activo = true` por defecto, y permite incluir inactivos con `?activo=false` o `?activo=all`.

**T-14: Endpoint editar producto (HU-02)**
Implementar `PUT /api/productos/:id` que actualice nombre, precio, categoría o unidad de medida.
*Criterio de terminado:* al editar el precio de un producto existente, `GET /api/productos/:id` refleja el nuevo precio; editar un id inexistente responde `404`.

**T-15: Endpoint desactivar producto (HU-03)**
Implementar `PATCH /api/productos/:id/desactivar` que cambie `activo` a `false` sin eliminar el registro.
*Criterio de terminado:* tras desactivar, el producto no aparece en `GET /api/productos` (listado por defecto) pero sigue existiendo en la tabla y es consultable por `GET /api/productos/:id`, conforme al criterio de aceptación de HU-03.

**T-16: Endpoint asociar receta a producto (HU-04)**
Implementar `POST /api/productos/:id/receta` que reciba una lista de `{ id_insumo, cantidad_requerida }` y la guarde en la tabla `receta`.
*Criterio de terminado:* tras asociar una receta, `GET /api/productos/:id/receta` devuelve los insumos asociados con sus cantidades; intentar asociar un `id_insumo` inexistente responde `400`/`404`.

---

## Fase 3 — Módulo de Inventario (HU-09 a HU-12)

**T-17: Endpoint crear insumo**
Implementar `POST /api/insumos` con nombre, unidad de medida, stock inicial y stock mínimo.
*Criterio de terminado:* petición válida crea el insumo con `stock_actual` igual al valor inicial enviado y responde `201`.

**T-18: Endpoint listar insumos**
Implementar `GET /api/insumos` con filtro opcional `?stockBajo=true` que devuelva solo insumos donde `stock_actual <= stock_minimo`.
*Criterio de terminado:* con un insumo de prueba en stock bajo, `GET /api/insumos?stockBajo=true` lo incluye en la respuesta; un insumo con stock normal no aparece.

**T-19: Endpoint registrar entrada de inventario (HU-09)**
Implementar `POST /api/insumos/:id/entradas` que registre un movimiento tipo `entrada` y aumente `stock_actual`.
*Criterio de terminado:* tras registrar una entrada de cantidad X, `stock_actual` del insumo aumenta exactamente en X, y existe un registro nuevo en `movimientos_inventario` con `tipo_movimiento = 'entrada'`, `id_usuario` y fecha correctos.

**T-20: Endpoint ajuste manual de inventario (HU-12)**
Implementar `POST /api/insumos/:id/ajustes` que reciba `{ cantidad, motivo }` y registre un movimiento tipo `ajuste`, actualizando `stock_actual`.
*Criterio de terminado:* un ajuste negativo reduce `stock_actual` y un ajuste positivo lo incrementa; el registro en `movimientos_inventario` incluye el `motivo` enviado; intentar dejar el stock en negativo responde `400`.

**T-21: Servicio interno de descuento de inventario por venta (HU-10)**
Implementar `movimientos.service.js` con una función `descontarPorVenta(idVenta, items)` que, por cada producto vendido, recorra su receta y registre movimientos `salida_venta` descontando `stock_actual` de cada insumo.
*Criterio de terminado:* prueba unitaria con un producto cuya receta usa 2 insumos confirma que, tras llamar la función con cantidad vendida = 2, cada insumo se descuenta `2 × cantidad_requerida` y se generan los movimientos correspondientes vinculados al `id_venta`.

**T-22: Validación de stock insuficiente antes de vender**
Implementar en el servicio de ventas una verificación previa que calcule si hay stock suficiente de todos los insumos antes de confirmar la venta.
*Criterio de terminado:* al intentar vender un producto cuya receta requiere más insumo del disponible, la operación se rechaza con `400` y un mensaje indicando qué insumo es insuficiente, sin alterar el stock (criterio de aceptación de HU-05, segundo escenario).

**T-23: Servicio de reversión de inventario por anulación (HU-07)**
Implementar `revertirPorVenta(idVenta)` que genere movimientos de tipo `entrada` compensatorios por cada insumo descontado originalmente, sin borrar los movimientos previos.
*Criterio de terminado:* tras anular una venta de prueba, `stock_actual` de cada insumo regresa a su valor previo a la venta, y existen nuevos registros en `movimientos_inventario` (no se modifican ni eliminan los de `salida_venta` originales).

---

## Fase 4 — Módulo de Corte de Caja (HU-13, HU-14)

> Se implementa antes que Ventas porque toda venta requiere una caja abierta
> (regla de negocio definida en `modelo_datos.md`, sección de notas de diseño).

**T-24: Endpoint apertura de caja (HU-13)**
Implementar `POST /api/corte-caja/apertura` que reciba `monto_inicial` y cree un registro en `corte_caja` con `estado = 'abierta'`.
*Criterio de terminado:* si el cajero no tiene una caja abierta, la petición responde `201` con el nuevo `id_corte`; si ya tiene una caja abierta, responde `409` y muestra el estado de la caja actual (criterio de aceptación de HU-13).

**T-25: Endpoint cierre de caja (HU-14)**
Implementar `POST /api/corte-caja/:id/cierre` que reciba `monto_declarado`, calcule `monto_esperado` (inicial + ventas en efectivo del turno) y `diferencia`, y cambie `estado` a `'cerrada'`.
*Criterio de terminado:* con ventas de prueba registradas en el turno, el cálculo de `monto_esperado` coincide con `monto_inicial + suma(monto_efectivo de ventas confirmadas del corte)`, y `diferencia = monto_declarado - monto_esperado` se guarda correctamente.

**T-26: Bloqueo de ventas sobre caja cerrada**
Asegurar que el servicio de ventas valide que el `id_corte` referenciado tenga `estado = 'abierta'` antes de aceptar una nueva venta.
*Criterio de terminado:* intentar crear una venta sobre una caja con `estado = 'cerrada'` responde `400`/`409` y no crea el registro de venta (segundo escenario de HU-14).

---

## Fase 5 — Módulo de Ventas (HU-05 a HU-08)

**T-27: Endpoint registrar venta (HU-05)**
Implementar `POST /api/ventas` que reciba `id_corte`, lista de `{ id_producto, cantidad }` y calcule `total`, valide stock (T-22), inserte `ventas` + `detalle_venta` en una transacción, y descuente inventario (T-21).
*Criterio de terminado:* una venta válida responde `201` con el detalle completo (productos, cantidades, total); el registro en `detalle_venta` contiene `precio_unitario` igual al precio vigente del producto al momento de la venta (no afectado por cambios posteriores de precio).

**T-28: Endpoint aplicar método de pago (HU-06)**
Incluir en `POST /api/ventas` la validación de `metodo_pago` (`efectivo`, `tarjeta`, `mixto`) y de que `monto_efectivo + monto_tarjeta = total`.
*Criterio de terminado:* una venta con pago mixto cuyos montos no suman el total responde `400`; una venta con montos correctos se guarda con el desglose exacto.

**T-29: Endpoint anular venta (HU-07)**
Implementar `POST /api/ventas/:id/anular` que cambie `estado` a `'anulada'` y dispare `revertirPorVenta` (T-23).
*Criterio de terminado:* anular una venta del turno actual no requiere aprobación adicional y revierte el inventario; anular una venta de un turno ya cerrado responde `403` a menos que el usuario tenga rol `administrador` (criterio de aceptación de HU-07).

**T-30: Endpoint generar ticket de venta (HU-08)**
Implementar `GET /api/ventas/:id/ticket` que devuelva los datos estructurados del comprobante (folio, fecha, productos, cantidades, precios, total, método de pago).
*Criterio de terminado:* la respuesta incluye todos los campos requeridos por el criterio de aceptación de HU-08 y el folio corresponde al `id_venta`.

---

## Fase 6 — Reportes y consultas (HU-15, HU-16, restricción 4.6)

**T-31: Endpoint detalle de un corte de caja (HU-15)**
Implementar `GET /api/corte-caja/:id` que devuelva ventas totales, desglose por método de pago, monto inicial, monto declarado y diferencia.
*Criterio de terminado:* la respuesta incluye los 5 campos exigidos por el criterio de aceptación de HU-15, calculados correctamente contra datos de prueba.

**T-32: Endpoint historial de cortes de caja (HU-16)**
Implementar `GET /api/corte-caja` con filtros `?fechaInicio=&fechaFin=&idUsuario=`.
*Criterio de terminado:* al filtrar por un rango de fechas y/o usuario, solo se devuelven los cortes que cumplen ambos filtros simultáneamente; sin filtros, devuelve todos los cortes paginados.

**T-33: Endpoint de reporte de ventas exportable**
Implementar `GET /api/reportes/ventas?formato=csv` con filtros por fecha, producto, categoría y usuario.
*Criterio de terminado:* la respuesta con `formato=csv` devuelve un archivo descargable con las columnas mínimas (fecha, producto, cantidad, total, método de pago) y respeta todos los filtros aplicados simultáneamente, conforme a la restricción 4.6 del spec.

**T-34: Endpoint de alertas de stock bajo (HU-11)**
Implementar `GET /api/insumos/alertas` que reutilice la lógica de T-18 para exponer únicamente insumos en stock bajo, pensado para consumo del panel de administrador.
*Criterio de terminado:* la respuesta solo contiene insumos donde `stock_actual <= stock_minimo`, y está vacía cuando ningún insumo cumple esa condición.

---

## Fase 7 — Calidad, pruebas e integridad técnica (sección 4 del spec)

**T-35: Pruebas de integridad: stock no negativo**
Escribir prueba que confirme que ninguna operación (venta, ajuste) puede dejar `stock_actual` por debajo de 0 sin autorización explícita.
*Criterio de terminado:* la prueba falla si el constraint o la validación de aplicación permite stock negativo; pasa cuando el sistema lo bloquea con `400`.

**T-36: Pruebas de inmutabilidad de ventas confirmadas**
Escribir prueba que confirme que no existe ningún endpoint que permita editar productos, cantidades o montos de una venta ya confirmada (solo anulación).
*Criterio de terminado:* un intento de `PUT`/`PATCH` directo sobre `/api/ventas/:id` responde `404`/`405` (no implementado), confirmando que la única vía de corrección es `POST /api/ventas/:id/anular`.

**T-37: Pruebas de concurrencia en descuento de inventario**
Escribir prueba que simule dos ventas concurrentes consumiendo el mismo insumo y verifique que el stock final es consistente (sin condición de carrera).
*Criterio de terminado:* tras ejecutar N ventas concurrentes de prueba que consumen el mismo insumo, `stock_actual` final coincide exactamente con `stock_inicial − (N × consumo_por_venta)`, sin pérdidas de actualización.

**T-38: Pruebas de auditoría (usuario, fecha, hora en operaciones críticas)**
Escribir prueba que confirme que cada venta, ajuste de inventario, apertura y cierre de caja queda asociado a un `id_usuario` y timestamp válidos.
*Criterio de terminado:* para cada una de las 4 operaciones, el registro creado en base de datos tiene `id_usuario` no nulo y coincide con el usuario autenticado que ejecutó la petición.

**T-39: Documentación de la API**
Generar documentación de endpoints (OpenAPI/Swagger o README detallado) cubriendo todos los endpoints implementados en las fases 1 a 6.
*Criterio de terminado:* existe un archivo (`docs/api.md` o `openapi.yaml`) que lista cada endpoint con método, ruta, payload esperado, respuestas posibles y código de estado; se valida abriendo el documento y contrastando contra al menos 3 endpoints implementados.

**T-40: Suite de pruebas de integración end-to-end del flujo principal**
Escribir una prueba que recorra el flujo completo: login → apertura de caja → crear producto con receta → registrar entrada de insumo → registrar venta → cierre de caja → consultar reporte de corte.
*Criterio de terminado:* la prueba completa pasa de inicio a fin sin intervención manual, y los valores finales (stock, totales de venta, diferencia de caja) son matemáticamente consistentes entre sí.

---

## Resumen de dependencias entre fases

```
Fase 0 (Setup)
   ↓
Fase 1 (Auth/Usuarios) ──────────────┐
   ↓                                 │
Fase 2 (Productos) ──┐               │
                      ↓               │
Fase 3 (Inventario) ─┤               │
                      ↓               │
Fase 4 (Corte de Caja) ←──────────────┘
   ↓
Fase 5 (Ventas)  [depende de Productos, Inventario y Corte de Caja]
   ↓
Fase 6 (Reportes) [depende de Ventas y Corte de Caja]
   ↓
Fase 7 (Calidad/Pruebas transversales)
```
