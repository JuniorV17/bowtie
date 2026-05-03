-- server/sql/schema.sql
-- Esquema completo de la base de datos Bowtie con el modelo SMS/OACI:
--   - probability INT 1..5
--   - severity    CHAR(1) 'A'..'E'
--   - tolerability VARCHAR ('Intolerable' | 'Tolerable' | 'Aceptable')
--
-- Este script borra y recrea el esquema. Está pensado para inicializar el
-- entorno o para resetear datos antes de comenzar la recolección.

BEGIN;

DROP TABLE IF EXISTS mitigation_escalations CASCADE;
DROP TABLE IF EXISTS control_escalations    CASCADE;
DROP TABLE IF EXISTS risk_evaluations       CASCADE;
DROP TABLE IF EXISTS mitigation_controls    CASCADE;
DROP TABLE IF EXISTS preventive_controls    CASCADE;
DROP TABLE IF EXISTS consequences           CASCADE;
DROP TABLE IF EXISTS causes                 CASCADE;
DROP TABLE IF EXISTS diagrams               CASCADE;

-- =====================================================
--  Tablas principales
-- =====================================================

CREATE TABLE diagrams (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    risk_name   VARCHAR(255) NOT NULL,
    top_event   VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE causes (
    id         SERIAL PRIMARY KEY,
    diagram_id INT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    position   INT NOT NULL DEFAULT 0
);

CREATE TABLE preventive_controls (
    id       SERIAL PRIMARY KEY,
    cause_id INT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
    label    TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE consequences (
    id         SERIAL PRIMARY KEY,
    diagram_id INT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    position   INT NOT NULL DEFAULT 0
);

CREATE TABLE mitigation_controls (
    id             SERIAL PRIMARY KEY,
    consequence_id INT NOT NULL REFERENCES consequences(id) ON DELETE CASCADE,
    label          TEXT NOT NULL,
    position       INT NOT NULL DEFAULT 0
);

CREATE TABLE control_escalations (
    id         SERIAL PRIMARY KEY,
    control_id INT NOT NULL REFERENCES preventive_controls(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    position   INT NOT NULL DEFAULT 0
);

CREATE TABLE mitigation_escalations (
    id            SERIAL PRIMARY KEY,
    mitigation_id INT NOT NULL REFERENCES mitigation_controls(id) ON DELETE CASCADE,
    label         TEXT NOT NULL,
    position      INT NOT NULL DEFAULT 0
);

-- =====================================================
--  Evaluaciones de riesgo (modelo SMS/OACI)
-- =====================================================

CREATE TABLE risk_evaluations (
    id              SERIAL PRIMARY KEY,
    diagram_id      INT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(10) NOT NULL CHECK (evaluation_type IN ('before','after')),
    probability     INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
    severity        CHAR(1) NOT NULL CHECK (severity IN ('A','B','C','D','E')),
    tolerability    VARCHAR(20) NOT NULL CHECK (tolerability IN ('Intolerable','Tolerable','Aceptable')),
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_evaluations_diagram ON risk_evaluations(diagram_id);
CREATE INDEX idx_causes_diagram            ON causes(diagram_id);
CREATE INDEX idx_consequences_diagram      ON consequences(diagram_id);

-- =====================================================
--  Datos de ejemplo
-- =====================================================

-- Diagrama 1 — Pérdida de control en vuelo
INSERT INTO diagrams (id, title, risk_name, top_event, description) VALUES
  (1, 'Pérdida de control en vuelo', 'Pérdida de control en vuelo (LOC-I)',
   'Aeronave entra en condición de pérdida de control en vuelo',
   'Análisis bowtie del riesgo de pérdida de control durante operaciones en ruta.');

INSERT INTO causes (id, diagram_id, label, position) VALUES
  (1, 1, 'Entrada en pérdida aerodinámica',  0),
  (2, 1, 'Falla de instrumentos de actitud', 1),
  (3, 1, 'Turbulencia severa en ruta',       2);

INSERT INTO preventive_controls (cause_id, label, position) VALUES
  (1, 'Entrenamiento recurrente en recuperación de stall',         0),
  (1, 'Sistema de alerta de aproximación a pérdida (stick shaker)', 1),
  (2, 'Redundancia triple de sensores de actitud',                 0),
  (2, 'Procedimientos de cross-check de instrumentos',             1),
  (3, 'Briefing meteorológico previo al vuelo',                    0),
  (3, 'Uso de radar meteorológico de a bordo',                     1);

INSERT INTO consequences (id, diagram_id, label, position) VALUES
  (1, 1, 'Accidente con pérdida total del avión', 0),
  (2, 1, 'Daños estructurales mayores',           1);

INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
  (1, 'Sistema de protección de envolvente de vuelo',     0),
  (1, 'Procedimiento estandarizado de recuperación UPRT', 1),
  (2, 'Inspección estructural post-evento severo',        0);

INSERT INTO risk_evaluations (diagram_id, evaluation_type, probability, severity, tolerability, notes) VALUES
  (1, 'before', 3, 'A', 'Intolerable', 'Sin controles, escenario LOC-I clasifica catastrófico remoto.'),
  (1, 'after',  2, 'B', 'Tolerable',   'Con entrenamiento UPRT y redundancia, severidad y probabilidad bajan.');

-- Diagrama 2 — Incursión en pista
INSERT INTO diagrams (id, title, risk_name, top_event, description) VALUES
  (2, 'Incursión en pista', 'Incursión en pista no autorizada',
   'Aeronave o vehículo ingresa a pista activa sin autorización',
   'Riesgo operacional típico en aeropuertos con alta densidad de tráfico.');

INSERT INTO causes (id, diagram_id, label, position) VALUES
  (4, 2, 'Confusión de fraseología ATC',     0),
  (5, 2, 'Señalización de pista deficiente', 1);

INSERT INTO preventive_controls (cause_id, label, position) VALUES
  (4, 'Uso obligatorio de fraseología OACI estándar', 0),
  (4, 'Read-back y hear-back en todas las clearances', 1),
  (5, 'Auditoría anual de señalización horizontal',   0),
  (5, 'Iluminación LED en barras de parada',          1);

INSERT INTO consequences (id, diagram_id, label, position) VALUES
  (3, 2, 'Colisión en pista', 0),
  (4, 2, 'Go-around forzado', 1);

INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
  (3, 'Sistema ASDE-X de detección de incursiones', 0),
  (4, 'Procedimientos publicados de motor y al aire', 0);

INSERT INTO risk_evaluations (diagram_id, evaluation_type, probability, severity, tolerability, notes) VALUES
  (2, 'before', 4, 'B', 'Intolerable', 'Sin controles, ocasional y peligroso.'),
  (2, 'after',  2, 'C', 'Tolerable',   'Con ASDE-X y fraseología estándar baja a tolerable.');

-- Diagrama 3 — FOD en plataforma
INSERT INTO diagrams (id, title, risk_name, top_event, description) VALUES
  (3, 'FOD en plataforma', 'Daño por objetos extraños (FOD)',
   'Objeto extraño es ingerido o impacta una aeronave en plataforma',
   'Gestión del riesgo de FOD durante operaciones en rampa.');

INSERT INTO causes (id, diagram_id, label, position) VALUES
  (6, 3, 'Restos de carga mal asegurados',           0),
  (7, 3, 'Herramienta olvidada tras mantenimiento',  1);

INSERT INTO preventive_controls (cause_id, label, position) VALUES
  (6, 'Inspección visual de plataforma cada turno', 0),
  (7, 'Control de herramientas tipo shadow board',  0);

INSERT INTO consequences (id, diagram_id, label, position) VALUES
  (5, 3, 'Daño a motor por ingestión',  0);

INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
  (5, 'Inspección boroscópica de motor', 0);

INSERT INTO risk_evaluations (diagram_id, evaluation_type, probability, severity, tolerability, notes) VALUES
  (3, 'before', 4, 'C', 'Tolerable', 'Riesgo importante por la frecuencia esperada de FOD.'),
  (3, 'after',  2, 'D', 'Aceptable', 'Con barridos y control de herramientas el riesgo es aceptable.');

-- Mantener las secuencias alineadas con los IDs insertados manualmente.
SELECT setval('diagrams_id_seq',            (SELECT MAX(id) FROM diagrams));
SELECT setval('causes_id_seq',              (SELECT MAX(id) FROM causes));
SELECT setval('consequences_id_seq',        (SELECT MAX(id) FROM consequences));
SELECT setval('preventive_controls_id_seq', (SELECT MAX(id) FROM preventive_controls));
SELECT setval('mitigation_controls_id_seq', (SELECT MAX(id) FROM mitigation_controls));
SELECT setval('risk_evaluations_id_seq',    (SELECT MAX(id) FROM risk_evaluations));

COMMIT;
