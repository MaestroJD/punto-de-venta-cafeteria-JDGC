-- =========================================================
-- Modelo de datos: Sistema POS Cafetería
-- Tablas: usuarios (apoyo), productos, corte_caja, ventas, detalle_venta,
--         insumos, receta, movimientos_inventario
-- Estándar ANSI / compatible con PostgreSQL y MySQL 8+
-- =========================================================

-- -----------------------------------------------------
-- Tabla: usuarios
-- Soporte para trazabilidad de ventas y cortes de caja
-- -----------------------------------------------------
CREATE TABLE usuarios (
    id_usuario      INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(120)    NOT NULL,
    rol             VARCHAR(30)     NOT NULL CHECK (rol IN ('administrador', 'cajero', 'inventario')),
    usuario         VARCHAR(60)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: productos
-- HU-01, HU-02, HU-03
-- -----------------------------------------------------
CREATE TABLE productos (
    id_producto         INT PRIMARY KEY AUTO_INCREMENT,
    nombre               VARCHAR(150)    NOT NULL,
    categoria            VARCHAR(80)     NOT NULL,
    precio               DECIMAL(10,2)   NOT NULL CHECK (precio > 0),
    unidad_medida        VARCHAR(30)     NOT NULL,
    activo               BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: corte_caja
-- HU-13, HU-14, HU-15, HU-16
-- -----------------------------------------------------
CREATE TABLE corte_caja (
    id_corte         INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario       INT             NOT NULL,
    monto_inicial    DECIMAL(10,2)   NOT NULL CHECK (monto_inicial >= 0),
    monto_esperado   DECIMAL(10,2)   DEFAULT NULL,
    monto_declarado  DECIMAL(10,2)   DEFAULT NULL,
    diferencia       DECIMAL(10,2)   DEFAULT NULL,
    fecha_apertura   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre     TIMESTAMP       DEFAULT NULL,
    estado           VARCHAR(20)     NOT NULL DEFAULT 'abierta'
                         CHECK (estado IN ('abierta', 'cerrada')),

    CONSTRAINT fk_corte_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- -----------------------------------------------------
-- Tabla: ventas
-- HU-05, HU-06, HU-07, HU-08
-- -----------------------------------------------------
CREATE TABLE ventas (
    id_venta        INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario      INT             NOT NULL,
    id_corte        INT             NOT NULL,
    total           DECIMAL(10,2)   NOT NULL CHECK (total >= 0),
    metodo_pago     VARCHAR(20)     NOT NULL
                        CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'mixto')),
    monto_efectivo  DECIMAL(10,2)   NOT NULL DEFAULT 0,
    monto_tarjeta   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'confirmada'
                        CHECK (estado IN ('confirmada', 'anulada')),
    fecha_venta     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_venta_corte
        FOREIGN KEY (id_corte) REFERENCES corte_caja(id_corte),
    CONSTRAINT chk_pago_coincide
        CHECK (monto_efectivo + monto_tarjeta = total)
);

-- -----------------------------------------------------
-- Tabla: detalle_venta
-- HU-05 (líneas de la orden)
-- -----------------------------------------------------
CREATE TABLE detalle_venta (
    id_detalle      INT PRIMARY KEY AUTO_INCREMENT,
    id_venta        INT             NOT NULL,
    id_producto     INT             NOT NULL,
    cantidad        INT             NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2)   NOT NULL CHECK (precio_unitario >= 0),
    subtotal        DECIMAL(10,2)   NOT NULL CHECK (subtotal >= 0),

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- -----------------------------------------------------
-- Tabla: insumos
-- HU-09, HU-11, HU-12
-- -----------------------------------------------------
CREATE TABLE insumos (
    id_insumo       INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    unidad_medida   VARCHAR(30)     NOT NULL,
    stock_actual    DECIMAL(10,3)   NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo    DECIMAL(10,3)   NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: receta
-- HU-04 (relación producto-insumo, N a N con cantidad)
-- -----------------------------------------------------
CREATE TABLE receta (
    id_receta            INT PRIMARY KEY AUTO_INCREMENT,
    id_producto          INT             NOT NULL,
    id_insumo            INT             NOT NULL,
    cantidad_requerida   DECIMAL(10,3)   NOT NULL CHECK (cantidad_requerida > 0),

    CONSTRAINT fk_receta_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE CASCADE,
    CONSTRAINT fk_receta_insumo
        FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT uq_receta_producto_insumo
        UNIQUE (id_producto, id_insumo)
);

-- -----------------------------------------------------
-- Tabla: movimientos_inventario
-- HU-09 (entrada), HU-10 (salida automática por venta), HU-12 (ajuste manual)
-- -----------------------------------------------------
CREATE TABLE movimientos_inventario (
    id_movimiento      INT PRIMARY KEY AUTO_INCREMENT,
    id_insumo           INT             NOT NULL,
    id_usuario          INT             NOT NULL,
    tipo_movimiento     VARCHAR(20)     NOT NULL
                            CHECK (tipo_movimiento IN ('entrada', 'salida_venta', 'ajuste')),
    cantidad             DECIMAL(10,3)   NOT NULL CHECK (cantidad <> 0),
    motivo               VARCHAR(255)    DEFAULT NULL,
    id_venta             INT             DEFAULT NULL,
    fecha_movimiento     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimiento_insumo
        FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_movimiento_venta
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    CONSTRAINT chk_movimiento_venta_coherente
        CHECK (
            (tipo_movimiento = 'salida_venta' AND id_venta IS NOT NULL)
            OR (tipo_movimiento <> 'salida_venta')
        )
);

-- -----------------------------------------------------
-- Índices recomendados para reportes (sección 4.6 del spec)
-- -----------------------------------------------------
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX idx_ventas_corte ON ventas(id_corte);
CREATE INDEX idx_detalle_producto ON detalle_venta(id_producto);
CREATE INDEX idx_corte_usuario ON corte_caja(id_usuario);
CREATE INDEX idx_receta_producto ON receta(id_producto);
CREATE INDEX idx_receta_insumo ON receta(id_insumo);
CREATE INDEX idx_movimiento_insumo ON movimientos_inventario(id_insumo);
CREATE INDEX idx_movimiento_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX idx_movimiento_venta ON movimientos_inventario(id_venta);
