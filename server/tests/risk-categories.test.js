// server/tests/risk-categories.test.js
// Pruebas exhaustivas de categorización: cubre las 25 celdas de la matriz
// SMS / OACI verificando categoría e índice de riesgo (RF-13).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTolerability,
  calculateRiskIndex,
  RISK_INDEX_MATRIX,
} from '../src/lib/tolerability.js';

const PROBABILITIES = [1, 2, 3, 4, 5];
const SEVERITIES = ['A', 'B', 'C', 'D', 'E'];

const EXPECTED = {
  Intolerable: ['5A','5B','5C','4A','4B','3A'],
  Tolerable:   ['5D','5E','4C','4D','4E','3B','3C','3D','2A','2B','2C','1A'],
  Aceptable:   ['3E','2D','2E','1B','1C','1D','1E'],
};

describe('Cobertura completa — 25 celdas de la matriz', () => {
  for (const p of PROBABILITIES) {
    for (const s of SEVERITIES) {
      it(`${p}${s} se calcula consistentemente`, () => {
        const cat = calculateTolerability(p, s);
        const idx = calculateRiskIndex(p, s);
        assert.equal(idx, `${p}${s}`);
        assert.ok(['Intolerable','Tolerable','Aceptable'].includes(cat));
        // Coincide con EXPECTED
        const expectedCat = Object.keys(EXPECTED).find(k => EXPECTED[k].includes(idx));
        assert.equal(cat, expectedCat, `Esperado ${expectedCat} para ${idx}`);
      });
    }
  }
});

describe('Conteo y distribución de categorías', () => {
  it('hay exactamente 6 celdas Intolerables', () => {
    let n = 0;
    for (const p of PROBABILITIES) for (const s of SEVERITIES)
      if (RISK_INDEX_MATRIX[p][s] === 'Intolerable') n++;
    assert.equal(n, 6);
  });
  it('hay exactamente 12 celdas Tolerables', () => {
    let n = 0;
    for (const p of PROBABILITIES) for (const s of SEVERITIES)
      if (RISK_INDEX_MATRIX[p][s] === 'Tolerable') n++;
    assert.equal(n, 12);
  });
  it('hay exactamente 7 celdas Aceptables', () => {
    let n = 0;
    for (const p of PROBABILITIES) for (const s of SEVERITIES)
      if (RISK_INDEX_MATRIX[p][s] === 'Aceptable') n++;
    assert.equal(n, 7);
  });
  it('total de celdas = 25', () => {
    let n = 0;
    for (const p of PROBABILITIES) for (const s of SEVERITIES)
      if (RISK_INDEX_MATRIX[p][s]) n++;
    assert.equal(n, 25);
  });
});

describe('Monotonía de la matriz (propiedad SMS)', () => {
  // Para una probabilidad fija, aumentar la severidad NO debe disminuir el riesgo.
  const RANK = { Aceptable: 1, Tolerable: 2, Intolerable: 3 };
  it('a probabilidad fija, A es ≥ que B en riesgo', () => {
    for (const p of PROBABILITIES) {
      for (let i = 0; i < SEVERITIES.length - 1; i++) {
        const high = SEVERITIES[i];      // más severo
        const low  = SEVERITIES[i + 1];  // menos severo
        const r1 = RANK[RISK_INDEX_MATRIX[p][high]];
        const r2 = RANK[RISK_INDEX_MATRIX[p][low]];
        assert.ok(r1 >= r2, `Violación monotonía en ${p}${high} vs ${p}${low}`);
      }
    }
  });
  it('a gravedad fija, mayor probabilidad ≥ menor probabilidad en riesgo', () => {
    for (const s of SEVERITIES) {
      for (let p = 1; p < 5; p++) {
        const r1 = RANK[RISK_INDEX_MATRIX[p + 1][s]];
        const r2 = RANK[RISK_INDEX_MATRIX[p][s]];
        assert.ok(r1 >= r2, `Violación monotonía en ${p + 1}${s} vs ${p}${s}`);
      }
    }
  });
});
