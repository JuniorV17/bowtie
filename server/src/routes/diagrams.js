// server/src/routes/diagrams.js
import { Router } from 'express';
import {
  getAllDiagrams,
  getDiagramById,
  createDiagram,
  updateDiagram,
  deleteDiagram,
  createRiskEvaluation,
  getRiskEvaluations,
  updateRiskEvaluation,
  deleteRiskEvaluation,
  createControlEscalation,
  deleteControlEscalation,
  createMitigationEscalation,
  deleteMitigationEscalation,
  getTolerabilityMatrix
} from '../controllers/diagramController.js';

const router = Router();

// GET /api/diagrams - List all diagrams
router.get('/', getAllDiagrams);

// GET /api/diagrams/matrix - Get tolerability matrix info
router.get('/matrix', getTolerabilityMatrix);

// GET /api/diagrams/:id - Get single diagram with all relations
router.get('/:id', getDiagramById);

// POST /api/diagrams - Create new diagram
router.post('/', createDiagram);

// PUT /api/diagrams/:id - Update existing diagram
router.put('/:id', updateDiagram);

// DELETE /api/diagrams/:id - Delete diagram
router.delete('/:id', deleteDiagram);

// ============ RISK EVALUATIONS ============
// POST /api/diagrams/:diagramId/evaluations - Create risk evaluation
router.post('/:diagramId/evaluations', createRiskEvaluation);

// GET /api/diagrams/:diagramId/evaluations - Get risk evaluations
router.get('/:diagramId/evaluations', getRiskEvaluations);

// PUT /api/diagrams/evaluations/:id - Update risk evaluation
router.put('/evaluations/:id', updateRiskEvaluation);

// DELETE /api/diagrams/evaluations/:id - Delete risk evaluation
router.delete('/evaluations/:id', deleteRiskEvaluation);

// ============ CONTROL ESCALATIONS ============
// POST /api/diagrams/controls/:controlId/escalations - Create control escalation
router.post('/controls/:controlId/escalations', createControlEscalation);

// DELETE /api/diagrams/control-escalations/:id - Delete control escalation
router.delete('/control-escalations/:id', deleteControlEscalation);

// ============ MITIGATION ESCALATIONS ============
// POST /api/diagrams/mitigations/:mitigationId/escalations - Create mitigation escalation
router.post('/mitigations/:mitigationId/escalations', createMitigationEscalation);

// DELETE /api/diagrams/mitigation-escalations/:id - Delete mitigation escalation
router.delete('/mitigation-escalations/:id', deleteMitigationEscalation);

export default router;
