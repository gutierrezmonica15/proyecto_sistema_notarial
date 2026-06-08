-- ══════════════════════════════════════════════════════════
--  Sistema Notarial — data.sql
--  Datos iniciales de prueba. Ejecutar DESPUÉS de schema.sql
-- ══════════════════════════════════════════════════════════

USE sistema_notarial;

-- ── Usuarios ──────────────────────────────────────────────
INSERT INTO usuarios (nombres, apellidos, correo, rol, activo) VALUES
  ('Roberto', 'Navarro',  'r.navarro@notaria.co',  'Notario',              TRUE),
  ('Juan',    'Pérez',    'j.perez@notaria.co',    'Protocolista',         TRUE),
  ('María',   'Gómez',    'm.gomez@notaria.co',    'Liquidador',           TRUE),
  ('Ana',     'Torres',   'a.torres@notaria.co',   'Protocolista',         TRUE),
  ('Carlos',  'Ruiz',     'c.ruiz@notaria.co',     'Operador_de_Escaner',  FALSE);

-- ── Escrituras ────────────────────────────────────────────
INSERT INTO escrituras (numero, acto, protocolista, estado, ced_comprador, ced_vendedor, fecha_radicacion) VALUES
  ('ESC-2025-0418', 'Compraventa',       'Juan Pérez',   'Validado_por_Notario', '10203040', '50607080', '2025-06-15'),
  ('ESC-2025-0412', 'Hipoteca',          'María Gómez',  'Escaneado',            '11223344', '55667788', '2025-06-10'),
  ('ESC-2025-0407', 'Sucesión',          'Carlos Ruiz',  'Devuelto',             '99887766', '44332211', '2025-06-05'),
  ('ESC-2025-0401', 'Poder especial',    'Ana Torres',   'Validado_por_Notario', '12345678', '87654321', '2025-06-01'),
  ('ESC-2025-0398', 'Constitución SAS',  'Juan Pérez',   'Escaneado',            '11112222', '33334444', '2025-05-28'),
  ('ESC-2025-0385', 'Compraventa',       'María Gómez',  'Devuelto',             '55556666', '77778888', '2025-05-20');

-- ── Boletas ───────────────────────────────────────────────
INSERT INTO boletas (num_escritura, fecha_liquidacion, valor, estado) VALUES
  ('ESC-2025-0418', '2025-07-10', 1240000.00, 'Liquidado'),
  ('ESC-2025-0412', '2025-07-05',  890000.00, 'Liquidado'),
  ('ESC-2025-0407', '2025-06-28', 2690000.00, 'Liquidado'),
  ('ESC-2025-0401', '2025-06-15',  430000.00, 'Pagado'),
  ('ESC-2025-0398', '2025-06-01',  760000.00, 'Pagado');
