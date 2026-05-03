// server/src/controllers/diagramController.js
import pool from '../db/connection.js';
import {
  RISK_INDEX_MATRIX,
  PROBABILITY_LEVELS,
  SEVERITY_LEVELS,
  TOLERABILITY_COLORS,
  RISK_ACTIONS,
  calculateTolerability,
  calculateRiskIndex,
  isValidProbability,
  isValidSeverity,
} from '../lib/tolerability.js';

// GET all diagrams (summary)
export async function getAllDiagrams(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.title,
        d.risk_name,
        d.top_event,
        d.created_at,
        d.updated_at,
        (SELECT COUNT(*) FROM causes WHERE diagram_id = d.id) as causes_count,
        (SELECT COUNT(*) FROM consequences WHERE diagram_id = d.id) as consequences_count
      FROM diagrams d
      ORDER BY d.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    res.status(500).json({ error: 'Failed to fetch diagrams' });
  }
}

// GET single diagram with all relations
export async function getDiagramById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Get diagram
    const diagramResult = await client.query(
      'SELECT * FROM diagrams WHERE id = $1',
      [id]
    );

    if (diagramResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const diagram = diagramResult.rows[0];

    // Helper function to safely query tables that might not exist
    const safeQuery = async (query, params) => {
      try {
        const result = await client.query(query, params);
        return result.rows;
      } catch (err) {
        // Table doesn't exist - return empty array
        if (err.code === '42P01') {
          return [];
        }
        throw err;
      }
    };

    // Get causes with their controls and escalations
    const causesResult = await client.query(`
      SELECT c.id, c.label, c.position
      FROM causes c
      WHERE c.diagram_id = $1
      ORDER BY c.position
    `, [id]);

    const causes = [];
    for (const cause of causesResult.rows) {
      const controlsResult = await client.query(`
        SELECT id, label, position
        FROM preventive_controls
        WHERE cause_id = $1
        ORDER BY position
      `, [cause.id]);

      // Get escalations for each control (table might not exist)
      const controlsWithEscalations = [];
      for (const control of controlsResult.rows) {
        const escalations = await safeQuery(`
          SELECT id, label, position
          FROM control_escalations
          WHERE control_id = $1
          ORDER BY position
        `, [control.id]);

        controlsWithEscalations.push({
          ...control,
          escalations
        });
      }

      causes.push({
        ...cause,
        controls: controlsWithEscalations
      });
    }

    // Get consequences with their mitigations and escalations
    const consequencesResult = await client.query(`
      SELECT c.id, c.label, c.position
      FROM consequences c
      WHERE c.diagram_id = $1
      ORDER BY c.position
    `, [id]);

    const consequences = [];
    for (const consequence of consequencesResult.rows) {
      const mitigationsResult = await client.query(`
        SELECT id, label, position
        FROM mitigation_controls
        WHERE consequence_id = $1
        ORDER BY position
      `, [consequence.id]);

      // Get escalations for each mitigation (table might not exist)
      const mitigationsWithEscalations = [];
      for (const mitigation of mitigationsResult.rows) {
        const escalations = await safeQuery(`
          SELECT id, label, position
          FROM mitigation_escalations
          WHERE mitigation_id = $1
          ORDER BY position
        `, [mitigation.id]);

        mitigationsWithEscalations.push({
          ...mitigation,
          escalations
        });
      }

      consequences.push({
        ...consequence,
        mitigations: mitigationsWithEscalations
      });
    }

    // Get risk evaluations (table might not exist)
    const evaluations = await safeQuery(`
      SELECT id, evaluation_type, probability, severity, tolerability, notes, created_at
      FROM risk_evaluations
      WHERE diagram_id = $1
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      id: diagram.id,
      title: diagram.title,
      riskName: diagram.risk_name,
      topEvent: diagram.top_event,
      description: diagram.description,
      createdAt: diagram.created_at,
      updatedAt: diagram.updated_at,
      causes,
      consequences,
      evaluations
    });
  } catch (error) {
    console.error('Error fetching diagram:', error);
    res.status(500).json({ error: 'Failed to fetch diagram' });
  } finally {
    client.release();
  }
}

// POST create new diagram
export async function createDiagram(req, res) {
  const { title, riskName, topEvent, description, causes, consequences } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert diagram
    const diagramResult = await client.query(`
      INSERT INTO diagrams (title, risk_name, top_event, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [title, riskName, topEvent, description || '']);

    const diagramId = diagramResult.rows[0].id;

    // Insert causes and their controls
    if (causes && causes.length > 0) {
      for (let i = 0; i < causes.length; i++) {
        const cause = causes[i];
        const causeResult = await client.query(`
          INSERT INTO causes (diagram_id, label, position)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [diagramId, cause.label, i]);

        const causeId = causeResult.rows[0].id;

        if (cause.controls && cause.controls.length > 0) {
          for (let j = 0; j < cause.controls.length; j++) {
            await client.query(`
              INSERT INTO preventive_controls (cause_id, label, position)
              VALUES ($1, $2, $3)
            `, [causeId, cause.controls[j].label, j]);
          }
        }
      }
    }

    // Insert consequences and their mitigations
    if (consequences && consequences.length > 0) {
      for (let i = 0; i < consequences.length; i++) {
        const consequence = consequences[i];
        const consequenceResult = await client.query(`
          INSERT INTO consequences (diagram_id, label, position)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [diagramId, consequence.label, i]);

        const consequenceId = consequenceResult.rows[0].id;

        if (consequence.mitigations && consequence.mitigations.length > 0) {
          for (let j = 0; j < consequence.mitigations.length; j++) {
            await client.query(`
              INSERT INTO mitigation_controls (consequence_id, label, position)
              VALUES ($1, $2, $3)
            `, [consequenceId, consequence.mitigations[j].label, j]);
          }
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: diagramId,
      message: 'Diagram created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating diagram:', error);
    res.status(500).json({ error: 'Failed to create diagram' });
  } finally {
    client.release();
  }
}

// PUT update existing diagram
export async function updateDiagram(req, res) {
  const { id } = req.params;
  const { title, riskName, topEvent, description, causes, consequences } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if diagram exists
    const existingDiagram = await client.query(
      'SELECT id FROM diagrams WHERE id = $1',
      [id]
    );

    if (existingDiagram.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Diagram not found' });
    }

    // Update diagram
    await client.query(`
      UPDATE diagrams
      SET title = $1, risk_name = $2, top_event = $3, description = $4, updated_at = NOW()
      WHERE id = $5
    `, [title, riskName, topEvent, description || '', id]);

    // Delete existing causes (cascade will delete controls)
    await client.query('DELETE FROM causes WHERE diagram_id = $1', [id]);

    // Delete existing consequences (cascade will delete mitigations)
    await client.query('DELETE FROM consequences WHERE diagram_id = $1', [id]);

    // Re-insert causes and their controls
    if (causes && causes.length > 0) {
      for (let i = 0; i < causes.length; i++) {
        const cause = causes[i];
        const causeResult = await client.query(`
          INSERT INTO causes (diagram_id, label, position)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [id, cause.label, i]);

        const causeId = causeResult.rows[0].id;

        if (cause.controls && cause.controls.length > 0) {
          for (let j = 0; j < cause.controls.length; j++) {
            await client.query(`
              INSERT INTO preventive_controls (cause_id, label, position)
              VALUES ($1, $2, $3)
            `, [causeId, cause.controls[j].label, j]);
          }
        }
      }
    }

    // Re-insert consequences and their mitigations
    if (consequences && consequences.length > 0) {
      for (let i = 0; i < consequences.length; i++) {
        const consequence = consequences[i];
        const consequenceResult = await client.query(`
          INSERT INTO consequences (diagram_id, label, position)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [id, consequence.label, i]);

        const consequenceId = consequenceResult.rows[0].id;

        if (consequence.mitigations && consequence.mitigations.length > 0) {
          for (let j = 0; j < consequence.mitigations.length; j++) {
            await client.query(`
              INSERT INTO mitigation_controls (consequence_id, label, position)
              VALUES ($1, $2, $3)
            `, [consequenceId, consequence.mitigations[j].label, j]);
          }
        }
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Diagram updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating diagram:', error);
    res.status(500).json({ error: 'Failed to update diagram' });
  } finally {
    client.release();
  }
}

// DELETE diagram
export async function deleteDiagram(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM diagrams WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    res.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    console.error('Error deleting diagram:', error);
    res.status(500).json({ error: 'Failed to delete diagram' });
  }
}

// ============ RISK EVALUATIONS ============

// POST create risk evaluation
export async function createRiskEvaluation(req, res) {
  const { diagramId } = req.params;
  const { evaluationType, probability, severity, notes } = req.body;

  try {
    // Validate input
    if (!evaluationType || !['before', 'after'].includes(evaluationType)) {
      return res.status(400).json({ error: 'evaluationType must be "before" or "after"' });
    }
    if (!isValidProbability(probability)) {
      return res.status(400).json({ error: 'probability debe ser un entero entre 1 y 5' });
    }
    if (!isValidSeverity(severity)) {
      return res.status(400).json({ error: 'severity debe ser una letra entre A y E' });
    }

    const tolerability = calculateTolerability(probability, severity);
    const riskIndex = calculateRiskIndex(probability, severity);

    const result = await pool.query(`
      INSERT INTO risk_evaluations (diagram_id, evaluation_type, probability, severity, tolerability, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [diagramId, evaluationType, probability, severity, tolerability, notes || '']);

    await pool.query('UPDATE diagrams SET updated_at = NOW() WHERE id = $1', [diagramId]);

    res.status(201).json({ ...result.rows[0], risk_index: riskIndex });
  } catch (error) {
    console.error('Error creating risk evaluation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla risk_evaluations no existe. Ejecute el script de actualización de la base de datos.' });
    }
    res.status(500).json({ error: 'Failed to create risk evaluation' });
  }
}

// GET risk evaluations for a diagram
export async function getRiskEvaluations(req, res) {
  const { diagramId } = req.params;

  try {
    const result = await pool.query(`
      SELECT id, evaluation_type, probability, severity, tolerability, notes, created_at
      FROM risk_evaluations
      WHERE diagram_id = $1
      ORDER BY created_at DESC
    `, [diagramId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching risk evaluations:', error);
    if (error.code === '42P01') {
      // Table doesn't exist - return empty array
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch risk evaluations' });
  }
}

// PUT update risk evaluation
export async function updateRiskEvaluation(req, res) {
  const { id } = req.params;
  const { probability, severity, notes } = req.body;

  try {
    if (!isValidProbability(probability)) {
      return res.status(400).json({ error: 'probability debe ser un entero entre 1 y 5' });
    }
    if (!isValidSeverity(severity)) {
      return res.status(400).json({ error: 'severity debe ser una letra entre A y E' });
    }

    const tolerability = calculateTolerability(probability, severity);
    const riskIndex = calculateRiskIndex(probability, severity);

    const result = await pool.query(`
      UPDATE risk_evaluations
      SET probability = $1, severity = $2, tolerability = $3, notes = $4
      WHERE id = $5
      RETURNING *
    `, [probability, severity, tolerability, notes || '', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk evaluation not found' });
    }

    res.json({ ...result.rows[0], risk_index: riskIndex });
  } catch (error) {
    console.error('Error updating risk evaluation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla risk_evaluations no existe.' });
    }
    res.status(500).json({ error: 'Failed to update risk evaluation' });
  }
}

// DELETE risk evaluation
export async function deleteRiskEvaluation(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM risk_evaluations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk evaluation not found' });
    }

    res.json({ message: 'Risk evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk evaluation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla risk_evaluations no existe.' });
    }
    res.status(500).json({ error: 'Failed to delete risk evaluation' });
  }
}

// ============ CONTROL ESCALATIONS ============

// POST create control escalation
export async function createControlEscalation(req, res) {
  const { controlId } = req.params;
  const { label, position } = req.body;

  try {
    if (!label) {
      return res.status(400).json({ error: 'label is required' });
    }

    const result = await pool.query(`
      INSERT INTO control_escalations (control_id, label, position)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [controlId, label, position || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating control escalation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla control_escalations no existe. Ejecute el script de actualización de la base de datos.' });
    }
    res.status(500).json({ error: 'Failed to create control escalation' });
  }
}

// DELETE control escalation
export async function deleteControlEscalation(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM control_escalations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Control escalation not found' });
    }

    res.json({ message: 'Control escalation deleted successfully' });
  } catch (error) {
    console.error('Error deleting control escalation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla control_escalations no existe.' });
    }
    res.status(500).json({ error: 'Failed to delete control escalation' });
  }
}

// ============ MITIGATION ESCALATIONS ============

// POST create mitigation escalation
export async function createMitigationEscalation(req, res) {
  const { mitigationId } = req.params;
  const { label, position } = req.body;

  try {
    if (!label) {
      return res.status(400).json({ error: 'label is required' });
    }

    const result = await pool.query(`
      INSERT INTO mitigation_escalations (mitigation_id, label, position)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [mitigationId, label, position || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating mitigation escalation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla mitigation_escalations no existe. Ejecute el script de actualización de la base de datos.' });
    }
    res.status(500).json({ error: 'Failed to create mitigation escalation' });
  }
}

// DELETE mitigation escalation
export async function deleteMitigationEscalation(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM mitigation_escalations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitigation escalation not found' });
    }

    res.json({ message: 'Mitigation escalation deleted successfully' });
  } catch (error) {
    console.error('Error deleting mitigation escalation:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'La tabla mitigation_escalations no existe.' });
    }
    res.status(500).json({ error: 'Failed to delete mitigation escalation' });
  }
}

// GET tolerability matrix info
export function getTolerabilityMatrix(req, res) {
  res.json({
    matrix: RISK_INDEX_MATRIX,
    probabilityLevels: PROBABILITY_LEVELS,
    severityLevels: SEVERITY_LEVELS,
    tolerabilityColors: TOLERABILITY_COLORS,
    riskActions: RISK_ACTIONS,
  });
}
