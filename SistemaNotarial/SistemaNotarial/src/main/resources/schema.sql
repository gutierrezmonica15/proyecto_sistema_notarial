-- ══════════════════════════════════════════════════════════
--  Sistema Notarial — schema.sql
--  Ejecutar manualmente en MySQL una sola vez:
--    mysql -u root -p < schema.sql
-- ══════════════════════════════════════════════════════════

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sistema_notarial
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_notarial;

-- ── Tabla: escrituras ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrituras (
    id                INT           AUTO_INCREMENT PRIMARY KEY,
    numero            VARCHAR(20)   NOT NULL UNIQUE COMMENT 'Ej: ESC-2025-0418',
    acto              VARCHAR(100)  NOT NULL COMMENT 'Tipo de acto notarial',
    protocolista      VARCHAR(100)  NOT NULL,
    estado            ENUM(
                        'Validado_por_Notario',
                        'Escaneado',
                        'Devuelto'
                      )             NOT NULL DEFAULT 'Escaneado',
    ced_comprador     VARCHAR(20)   NULL COMMENT 'Cédula o NIT del comprador',
    ced_vendedor      VARCHAR(20)   NULL COMMENT 'Cédula o NIT del vendedor',
    observaciones     TEXT          NULL,
    fecha_radicacion  DATE          NOT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: boletas ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS boletas (
    id                INT           AUTO_INCREMENT PRIMARY KEY,
    num_escritura     VARCHAR(20)   NOT NULL COMMENT 'Referencia al número de escritura',
    fecha_liquidacion DATE          NOT NULL,
    valor             DECIMAL(15,2) NOT NULL,
    estado            ENUM(
                        'Liquidado',
                        'Pagado'
                      )             NOT NULL DEFAULT 'Liquidado',
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boleta_escritura
        FOREIGN KEY (num_escritura)
        REFERENCES escrituras(numero)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: usuarios ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT           AUTO_INCREMENT PRIMARY KEY,
    nombres     VARCHAR(100)  NOT NULL,
    apellidos   VARCHAR(100)  NOT NULL,
    correo      VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(32)   NOT NULL DEFAULT 'e740a4cff24ec5be7296cb210dc983b4' COMMENT 'Hash MD5 de la contraseña (MD5 de Monik2026@)',
    rol         ENUM(
                  'Notario',
                  'Liquidador',
                  'Protocolista',
                  'Operador_de_Escaner'
                )             NOT NULL,
    activo      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Script para agregar la columna en BD existente (ejecutar sólo si la tabla ya existe):
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password VARCHAR(32) NOT NULL DEFAULT 'e740a4cff24ec5be7296cb210dc983b4' COMMENT 'Hash MD5 de la contraseña';
