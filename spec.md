# Spec.md — Sistema de Punto de Venta (POS) para Cafetería

## 1. Descripción General

Sistema de punto de venta orientado a una cafetería de tamaño pequeño/mediano, que permite gestionar el catálogo de productos, registrar ventas, controlar inventario de insumos y productos, y realizar el corte de caja al cierre de turno o jornada.

### 1.1 Módulos del sistema
- Gestión de productos
- Ventas (punto de venta)
- Inventario
- Corte de caja
- Usuarios y roles (transversal, soporta los anteriores)

### 1.2 Roles de usuario
- **Administrador**: acceso total, configuración de productos, reportes, gestión de usuarios.
- **Cajero**: registro de ventas, apertura/cierre de caja propio.
- **Encargado de inventario** (opcional/rol combinable): ajustes de stock, registro de entradas de mercancía.

---

## 2. Historias de Usuario

### Módulo: Gestión de Productos

**HU-01: Crear producto**
Como administrador, quiero registrar un nuevo producto con nombre, categoría, precio de venta y unidad de medida, para poder ofrecerlo en el punto de venta.

**HU-02: Editar producto**
Como administrador, quiero modificar el precio, nombre o categoría de un producto existente, para mantener el catálogo actualizado.

**HU-03: Desactivar producto**
Como administrador, quiero desactivar un producto sin eliminarlo del historial, para dejar de venderlo sin perder trazabilidad de ventas pasadas.

**HU-04: Asociar receta/insumos a un producto**
Como administrador, quiero asociar los insumos (ingredientes) y cantidades que consume un producto al venderse, para que el inventario se descuente automáticamente.

---

### Módulo: Ventas

**HU-05: Registrar una venta**
Como cajero, quiero crear una orden agregando productos y cantidades, para registrar la venta de un cliente.

**HU-06: Aplicar método de pago**
Como cajero, quiero indicar si el pago fue en efectivo, tarjeta o mixto, para que la venta quede correctamente clasificada.

**HU-07: Cancelar/anular una venta**
Como cajero o administrador, quiero anular una venta antes o después de cerrada (con autorización), para corregir errores de captura.

**HU-08: Imprimir/generar ticket**
Como cajero, quiero generar un comprobante de venta (ticket), para entregárselo al cliente.

---

### Módulo: Inventario

**HU-09: Registrar entrada de inventario**
Como encargado de inventario, quiero registrar la recepción de insumos o productos (compra a proveedor), para incrementar el stock disponible.

**HU-10: Descuento automático de inventario por venta**
Como sistema, quiero descontar automáticamente del inventario los insumos usados al confirmarse una venta, para mantener el stock actualizado en tiempo real.

**HU-11: Alertas de stock bajo**
Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo configurado, para reabastecer a tiempo.

**HU-12: Ajuste manual de inventario**
Como encargado de inventario, quiero realizar ajustes manuales de stock (mermas, pérdidas, conteos físicos), para que el inventario refleje la realidad.

---

### Módulo: Corte de Caja

**HU-13: Apertura de caja**
Como cajero, quiero declarar un monto inicial de efectivo al abrir mi turno, para tener un punto de partida para el corte.

**HU-14: Cierre/corte de caja**
Como cajero, quiero cerrar mi turno declarando el efectivo contado, para que el sistema calcule diferencias contra lo esperado según las ventas registradas.

**HU-15: Reporte de corte de caja**
Como administrador, quiero consultar el detalle de un corte de caja (ventas por método de pago, diferencias, usuario), para supervisar la operación.

**HU-16: Historial de cortes**
Como administrador, quiero consultar el historial de cortes de caja por fecha y por cajero, para análisis y auditoría.

---

## 3. Criterios de Aceptación (Given/When/Then)

### HU-01: Crear producto
```
Given que soy un administrador autenticado en el módulo de productos
When ingreso nombre, categoría, precio y unidad de medida válidos y confirmo
Then el producto se guarda en el catálogo y aparece disponible en el punto de venta

Given que intento crear un producto sin nombre o con precio negativo/cero
When confirmo el formulario
Then el sistema rechaza la operación y muestra un mensaje de validación específico
```

### HU-03: Desactivar producto
```
Given un producto activo con historial de ventas
When el administrador lo desactiva
Then el producto deja de mostrarse en el punto de venta
And permanece visible en reportes históricos de ventas
```

### HU-04: Asociar receta a un producto
```
Given un producto sin receta asociada
When el administrador agrega uno o más insumos con sus cantidades de consumo
Then la receta queda guardada
And al venderse ese producto, el sistema usa esa receta para descontar inventario
```

### HU-05: Registrar una venta
```
Given una caja abierta y productos activos disponibles
When el cajero agrega productos a la orden y confirma la venta
Then se genera un registro de venta con fecha, hora, cajero, productos, cantidades y total

Given que un producto seleccionado no tiene suficiente inventario de algún insumo
When el cajero intenta confirmar la venta
Then el sistema impide la confirmación y muestra qué insumo está insuficiente
```

### HU-06: Aplicar método de pago
```
Given una orden con productos agregados y total calculado
When el cajero selecciona método de pago (efectivo, tarjeta o mixto) e ingresa los montos correspondientes
Then la venta se registra con el desglose del método de pago

Given un pago mixto
When la suma de montos por método no coincide con el total de la orden
Then el sistema no permite confirmar la venta hasta que los montos coincidan
```

### HU-07: Cancelar/anular una venta
```
Given una venta registrada en el turno actual
When el cajero solicita anularla antes del corte de caja
Then la venta cambia a estado "anulada"
And el inventario consumido por esa venta se revierte (se regresa el stock)

Given una venta de un turno ya cerrado
When se solicita su anulación
Then el sistema requiere autorización de un administrador para proceder
```

### HU-08: Imprimir/generar ticket
```
Given una venta confirmada
When el cajero solicita el ticket
Then el sistema genera un comprobante con folio, fecha, productos, cantidades, precios, total y método de pago
```

### HU-09: Registrar entrada de inventario
```
Given un insumo existente en el catálogo
When el encargado de inventario registra una entrada con cantidad y fecha
Then el stock del insumo se incrementa
And queda un registro del movimiento (tipo "entrada", usuario, fecha, cantidad)
```

### HU-10: Descuento automático de inventario por venta
```
Given una venta confirmada cuyos productos tienen receta asociada
When la venta se registra exitosamente
Then el sistema descuenta automáticamente del stock cada insumo según la receta y cantidad vendida
```

### HU-11: Alertas de stock bajo
```
Given un insumo con un nivel mínimo configurado
When el stock actual del insumo cae igual o por debajo del mínimo
Then el sistema muestra una alerta visible para el administrador (en panel o notificación)
```

### HU-12: Ajuste manual de inventario
```
Given un insumo con stock registrado
When el encargado de inventario realiza un ajuste manual indicando cantidad y motivo (merma, conteo, pérdida)
Then el stock se actualiza según el ajuste
And queda registrado el motivo, usuario y fecha del ajuste
```

### HU-13: Apertura de caja
```
Given que no hay una caja abierta para el cajero en el turno actual
When el cajero declara un monto inicial de efectivo y confirma la apertura
Then se crea un registro de caja abierta asociado a ese cajero, con fecha/hora de apertura y monto inicial

Given que el cajero ya tiene una caja abierta sin cerrar
When intenta abrir otra caja
Then el sistema lo impide y muestra el estado de la caja actualmente abierta
```

### HU-14: Cierre/corte de caja
```
Given una caja abierta con ventas registradas durante el turno
When el cajero declara el efectivo contado y confirma el cierre
Then el sistema calcula el monto esperado (inicial + ventas en efectivo) y compara contra lo declarado
And muestra la diferencia (sobrante o faltante)
And cambia el estado de la caja a "cerrada"

Given una caja cerrada
When se intenta registrar una nueva venta con esa caja
Then el sistema lo rechaza y solicita abrir una nueva caja
```

### HU-15: Reporte de corte de caja
```
Given un corte de caja ya cerrado
When el administrador consulta su detalle
Then el sistema muestra ventas totales, desglose por método de pago, monto inicial, monto declarado y diferencia
```

### HU-16: Historial de cortes
```
Given múltiples cortes de caja registrados en el sistema
When el administrador filtra por rango de fechas y/o cajero
Then el sistema muestra la lista de cortes correspondientes con sus totales y diferencias
```

---

## 4. Restricciones Técnicas

### 4.1 Generales
- El sistema debe operar con baja latencia en el registro de ventas (objetivo: confirmación de venta en menos de 2 segundos bajo condiciones normales de red).
- Debe soportar operación con conexión intermitente o local (consideración de modo offline/sincronización diferida si el entorno de red de la cafetería no es confiable).
- Toda operación crítica (venta, ajuste de inventario, apertura/cierre de caja) debe quedar registrada con usuario, fecha y hora (auditoría).

### 4.2 Datos e integridad
- El stock de insumos no debe permitir valores negativos como resultado de una venta (debe bloquearse o requerir autorización especial para "venta en negativo").
- Toda venta debe ser inmutable una vez confirmada; las correcciones se hacen mediante anulación, no edición directa.
- Los montos monetarios deben manejarse con precisión decimal exacta (no usar tipos de punto flotante binario para evitar errores de redondeo).

### 4.3 Seguridad y control de acceso
- Autenticación obligatoria para todo usuario (cajero, encargado de inventario, administrador).
- Control de acceso basado en roles (RBAC): un cajero no debe poder modificar precios ni eliminar productos.
- Las anulaciones de ventas de turnos cerrados deben requerir autorización explícita de un rol superior.

### 4.4 Concurrencia
- El sistema debe soportar múltiples cajeros operando simultáneamente con cajas independientes.
- Las actualizaciones de inventario deben ser atómicas para evitar condiciones de carrera cuando dos ventas concurrentes consumen el mismo insumo.

### 4.5 Interfaz
- La interfaz de ventas debe estar optimizada para uso rápido con mouse/touch (pantallas táctiles son un escenario común en POS de cafetería).
- Debe soportar impresión de tickets en impresoras térmicas estándar (o generación de PDF/comprobante digital como alternativa).

### 4.6 Reportabilidad
- El sistema debe permitir exportar reportes de ventas, inventario y cortes de caja (formato mínimo: CSV o Excel).
- Los reportes deben poder filtrarse por rango de fechas, producto, categoría y cajero/usuario.

### 4.7 Escalabilidad y mantenimiento
- El modelo de datos debe permitir agregar nuevas categorías de producto y nuevos insumos sin requerir cambios estructurales mayores.
- El sistema debe registrar versión de catálogo de precios para que ventas históricas reflejen el precio vigente al momento de la venta, no el precio actual.

---

## 5. Fuera de Alcance (en esta versión)

- Integración con plataformas de delivery de terceros.
- Manejo de múltiples sucursales/franquicias.
- Facturación electrónica fiscal (CFDI u homólogos) — se considera como posible extensión futura.
- Programas de lealtad/puntos para clientes.

---

## 6. Glosario

- **Insumo**: materia prima o ingrediente usado para preparar un producto (ej. café molido, leche, vaso).
- **Producto**: artículo vendible al cliente (ej. capuchino mediano).
- **Receta**: relación entre un producto y los insumos/cantidades que consume al venderse.
- **Corte de caja**: proceso de cierre de turno donde se compara el efectivo esperado contra el efectivo real contado.
- **Merma**: pérdida de inventario no asociada a una venta (rotura, caducidad, error).
