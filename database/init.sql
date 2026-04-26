-- Bowtie Diagram Database Schema
-- PostgreSQL

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS mitigation_controls CASCADE;
DROP TABLE IF EXISTS preventive_controls CASCADE;
DROP TABLE IF EXISTS consequences CASCADE;
DROP TABLE IF EXISTS causes CASCADE;
DROP TABLE IF EXISTS diagrams CASCADE;

-- Create diagrams table
CREATE TABLE diagrams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    risk_name VARCHAR(255) NOT NULL,
    top_event VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create causes table
CREATE TABLE causes (
    id SERIAL PRIMARY KEY,
    diagram_id INTEGER NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create preventive_controls table
CREATE TABLE preventive_controls (
    id SERIAL PRIMARY KEY,
    cause_id INTEGER NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consequences table
CREATE TABLE consequences (
    id SERIAL PRIMARY KEY,
    diagram_id INTEGER NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mitigation_controls table
CREATE TABLE mitigation_controls (
    id SERIAL PRIMARY KEY,
    consequence_id INTEGER NOT NULL REFERENCES consequences(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create risk_evaluations table for SMS evaluation
CREATE TABLE risk_evaluations (
    id SERIAL PRIMARY KEY,
    diagram_id INTEGER NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) NOT NULL, -- 'before' o 'after'
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    tolerability VARCHAR(50), -- Calculado: Aceptable, Tolerable, Intolerable, Inaceptable
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create control_escalations table (escalation factor for controls - acts as new threat)
CREATE TABLE control_escalations (
    id SERIAL PRIMARY KEY,
    control_id INTEGER NOT NULL REFERENCES preventive_controls(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mitigation_escalations table (escalation factor for mitigations - acts as new consequence)
CREATE TABLE mitigation_escalations (
    id SERIAL PRIMARY KEY,
    mitigation_id INTEGER NOT NULL REFERENCES mitigation_controls(id) ON DELETE CASCADE,
    label VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_causes_diagram_id ON causes(diagram_id);
CREATE INDEX idx_preventive_controls_cause_id ON preventive_controls(cause_id);
CREATE INDEX idx_consequences_diagram_id ON consequences(diagram_id);
CREATE INDEX idx_mitigation_controls_consequence_id ON mitigation_controls(consequence_id);
CREATE INDEX idx_risk_evaluations_diagram_id ON risk_evaluations(diagram_id);
CREATE INDEX idx_control_escalations_control_id ON control_escalations(control_id);
CREATE INDEX idx_mitigation_escalations_mitigation_id ON mitigation_escalations(mitigation_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for diagrams table
CREATE TRIGGER update_diagrams_updated_at
    BEFORE UPDATE ON diagrams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO diagrams (title, risk_name, top_event, description) VALUES
(
    'Analisis de Riesgo - Data Center',
    'Falla total del sistema electrico',
    'Corte inesperado de energia en Data Center',
    'Analisis completo de riesgos relacionados con fallas electricas en el centro de datos principal.'
);

-- Get the diagram ID
DO $$
DECLARE
    diagram_id INTEGER;
    cause_id INTEGER;
    consequence_id INTEGER;
BEGIN
    SELECT id INTO diagram_id FROM diagrams WHERE title = 'Analisis de Riesgo - Data Center';

    -- Insert causes
    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Sobrecarga o picos en la red externa', 0) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Regulador Voltaje', 0),
        (cause_id, 'UPS Online', 1),
        (cause_id, 'Supresor Picos', 2);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Falla interna del transformador', 1) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Monitoreo Termico', 0),
        (cause_id, 'Mantenimiento Transformador', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Corto circuito por cableado antiguo', 2) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Inspeccion Cableado', 0),
        (cause_id, 'Reemplazo Cables Criticos', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Error humano en subestacion', 3) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Capacitacion Operadores', 0),
        (cause_id, 'Checklist Procedimientos', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Inundacion por lluvia intensa', 4) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Barrera Fisica Anti-Inundacion', 0),
        (cause_id, 'Drenajes Revisados', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Intrusion fisica no autorizada', 5) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Control Acceso Biometrico', 0),
        (cause_id, 'Camaras 24/7', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Mantenimiento mal programado', 6) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Planificacion Calendario Mto', 0),
        (cause_id, 'Notificaciones Previas', 1);

    INSERT INTO causes (diagram_id, label, position) VALUES (diagram_id, 'Mal diseno del sistema de distribucion', 7) RETURNING id INTO cause_id;
    INSERT INTO preventive_controls (cause_id, label, position) VALUES
        (cause_id, 'Revision Diseno Electrico', 0),
        (cause_id, 'Auditoria Terceros', 1),
        (cause_id, 'Redundancia Critica', 2);

    -- Insert consequences
    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Dano fisico de servidores', 0) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Extincion Gas', 0),
        (consequence_id, 'Seguro Equipos', 1);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Paro operativo prolongado', 1) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Generador Diesel', 0),
        (consequence_id, 'Plan DRP', 1),
        (consequence_id, 'Site Alterno', 2);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Perdida de datos criticos', 2) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Backup Nube', 0),
        (consequence_id, 'Backup Offline', 1);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Incumplimiento SLA', 3) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Contratos SLA Revisados', 0);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Costo de reposicion alto', 4) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Inventario Repuestos', 0),
        (consequence_id, 'Proveedor Alterno', 1);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Impacto reputacional', 5) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Comunicado Crisis', 0);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Multas regulatorias', 6) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Asesoria Legal', 0);

    INSERT INTO consequences (diagram_id, label, position) VALUES (diagram_id, 'Riesgo de incendio', 7) RETURNING id INTO consequence_id;
    INSERT INTO mitigation_controls (consequence_id, label, position) VALUES
        (consequence_id, 'Detectores Humo', 0),
        (consequence_id, 'Inspeccion Electrica Regular', 1);
END $$;

-- Verification query
SELECT
    d.id,
    d.title,
    (SELECT COUNT(*) FROM causes WHERE diagram_id = d.id) as causes_count,
    (SELECT COUNT(*) FROM consequences WHERE diagram_id = d.id) as consequences_count
FROM diagrams d;
