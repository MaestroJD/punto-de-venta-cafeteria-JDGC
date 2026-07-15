# Modelo de Datos — POS Cafetería

## 1. Diagrama Entidad-Relación (Mermaid)

> Nota: se incluye la tabla `usuarios` como entidad de apoyo, ya que `ventas`,
> `corte_caja` y `movimientos_inventario` referencian al usuario que las
> generó (requisito de auditoría definido en el spec, secciones 4.1 y 4.3).
> El diagrama cubre productos, ventas, detalle_venta, corte_caja e inventario
> (insumos, receta, movimientos_inventario).

```mermaid
erDiagram
    USUARIOS {
        INT id_usuario PK
        VARCHAR nombre
        VARCHAR rol
        VARCHAR usuario
        VARCHAR password_hash
        BOOLEAN activo
        DATETIME fecha_creacion
    }

    PRODUCTOS {
        INT id_producto PK
        VARCHAR nombre
        VARCHAR categoria
        DECIMAL precio
        VARCHAR unidad_medida
        BOOLEAN activo
        DATETIME fecha_creacion
        DATETIME fecha_actualizacion
    }

    CORTE_CAJA {
        INT id_corte PK
        INT id_usuario FK
        DECIMAL monto_inicial
        DECIMAL monto_esperado
        DECIMAL monto_declarado
        DECIMAL diferencia
        DATETIME fecha_apertura
        DATETIME fecha_cierre
        VARCHAR estado
    }

    VENTAS {
        INT id_venta PK
        INT id_usuario FK
        INT id_corte FK
        DECIMAL total
        VARCHAR metodo_pago
        DECIMAL monto_efectivo
        DECIMAL monto_tarjeta
        VARCHAR estado
        DATETIME fecha_venta
    }

    DETALLE_VENTA {
        INT id_detalle PK
        INT id_venta FK
        INT id_producto FK
        INT cantidad
        DECIMAL precio_unitario
        DECIMAL subtotal
    }

    INSUMOS {
        INT id_insumo PK
        VARCHAR nombre
        VARCHAR unidad_medida
        DECIMAL stock_actual
        DECIMAL stock_minimo
        BOOLEAN activo
        DATETIME fecha_creacion
    }

    RECETA {
        INT id_receta PK
        INT id_producto FK
        INT id_insumo FK
        DECIMAL cantidad_requerida
    }

    MOVIMIENTOS_INVENTARIO {
        INT id_movimiento PK
        INT id_insumo FK
        INT id_usuario FK
        VARCHAR tipo_movimiento
        DECIMAL cantidad
        VARCHAR motivo
        INT id_venta FK
        DATETIME fecha_movimiento
    }

    USUARIOS ||--o{ CORTE_CAJA : "abre/cierra"
    USUARIOS ||--o{ VENTAS : "registra"
    USUARIOS ||--o{ MOVIMIENTOS_INVENTARIO : "registra"
    CORTE_CAJA ||--o{ VENTAS : "agrupa"
    VENTAS ||--|{ DETALLE_VENTA : "contiene"
    PRODUCTOS ||--o{ DETALLE_VENTA : "se vende en"
    PRODUCTOS ||--o{ RECETA : "requiere"
    INSUMOS ||--o{ RECETA : "se usa en"
    INSUMOS ||--o{ MOVIMIENTOS_INVENTARIO : "afecta"
    VENTAS ||--o{ MOVIMIENTOS_INVENTARIO : "genera salida"
```

---

## 2. Script SQL

El script completo de creación de tablas (DDL) se separó al archivo
[`schema.sql`](./schema.sql), que incluye:

- `usuarios` (tabla de apoyo para auditoría)
- `productos`
- `corte_caja`
- `ventas`
- `detalle_venta`
- `insumos`
- `receta`
- `movimientos_inventario`
- Índices recomendados para reportes

---

## 3. Notas de diseño

- **Precio histórico (sección 4.7 del spec):** `detalle_venta.precio_unitario` se captura al momento de la venta y es independiente de `productos.precio`, para que cambios futuros de precio no alteren ventas pasadas.
- **Inmutabilidad de ventas (sección 4.2):** no se incluyen UPDATE de campos críticos de `ventas` vía la app; las correcciones se hacen cambiando `estado` a `'anulada'`, nunca editando montos o productos.
- **Relación venta–corte de caja:** toda venta debe pertenecer a un corte de caja abierto (`id_corte` es `NOT NULL`); esto refleja HU-13/HU-14, donde no puede haber venta sin caja abierta.
- **Tipos decimales:** se usa `DECIMAL(10,2)` en lugar de `FLOAT`/`DOUBLE` para evitar errores de redondeo en montos monetarios, conforme a la restricción 4.2 del spec.
- **Tablas no incluidas en este alcance:** ninguna — el modelo ya cubre productos, ventas, detalle_venta, corte_caja e inventario (insumos, receta, movimientos_inventario), completando todo lo definido en el spec original.

## 4. Notas adicionales del módulo de inventario

- **Trazabilidad de stock (HU-09, HU-10, HU-12):** todo cambio de `insumos.stock_actual` debe quedar reflejado como un registro en `movimientos_inventario` (entrada, salida por venta o ajuste manual), nunca como una actualización "silenciosa" del stock. El campo `stock_actual` en `insumos` actúa como caché del saldo, recalculable a partir del historial de movimientos.
- **Relación con ventas (HU-10):** cuando una venta se confirma, el sistema debe generar automáticamente un movimiento de tipo `salida_venta` por cada insumo de la receta de cada producto vendido, multiplicado por la cantidad vendida. El constraint `chk_movimiento_venta_coherente` obliga a que todo movimiento de tipo `salida_venta` tenga un `id_venta` asociado.
- **Reversión por anulación (HU-07):** si una venta se anula, debe generarse un nuevo movimiento de tipo `entrada` (o un movimiento compensatorio) por los insumos correspondientes, en lugar de borrar el movimiento original — esto preserva el historial de auditoría.
- **Alertas de stock bajo (HU-11):** se calculan comparando `insumos.stock_actual` contra `insumos.stock_minimo`; no requiere una tabla adicional, puede resolverse con una consulta o vista (`stock_actual <= stock_minimo`).
- **Receta como N a N:** la tabla `receta` modela que un producto puede requerir varios insumos y un insumo puede usarse en varios productos, con la cantidad específica de consumo por producto.
