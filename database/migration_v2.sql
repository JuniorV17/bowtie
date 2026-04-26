-- Migration Script v2: Add Risk Evaluations and Escalation Tables
-- Este script agrega las nuevas tablas sin eliminar datos existentes
-- Ejecutar: psql -U tu_usuario -d bowtie_db -f database/migration_v2.sql

-- Create risk_evaluations table if not exists
CREATE TABLE IF NOT EXISTS risk_evaluations (
    id SERIAL PRIMARY KEY,
    diagram_id INTEGER NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) NOT NULL, -- 'before' o 'after'
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    tolerability VARCHAR(50), -- Calculado: Aceptable, Tolerable, Intolerable, Inaceptable
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create control_escalations table if not exists
CREATE TABLE IF NOT EXISTS control_escalations (
    id SERIAL PRIMARY KEY,
    control_id INTEGER NOT NULL REFERENCES preventive_controls(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mitigation_escalations table if not exists
CREATE TABLE IF NOT EXISTS mitigation_escalations (
    id SERIAL PRIMARY KEY,
    mitigation_id INTEGER NOT NULL REFERENCES mitigation_controls(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_risk_evaluations_diagram_id ON risk_evaluations(diagram_id);
CREATE INDEX IF NOT EXISTS idx_control_escalations_control_id ON control_escalations(control_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_escalations_mitigation_id ON mitigation_escalations(mitigation_id);

-- Verification
SELECT 'Tablas creadas exitosamente:' as mensaje;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('risk_evaluations', 'control_escalations', 'mitigation_escalations');
