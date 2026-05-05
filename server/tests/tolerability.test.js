// server/tests/tolerability.test.js
// Pruebas unitarias del modelo SMS / OACI:
//   - Probabilidad: 1..5
//   - Gravedad:     A..E
//   - Categoría:    Intolerable / Tolerable / Aceptable

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTolerability,
  calculateRiskIndex,
  isValidProbability,
  isValidSeverity,
  RISK_INDEX_MATRIX,
  PROBABILITY_LEVELS,
  SEVERITY_LEVELS,
} from '../src/lib/tolerability.js';

describe('Validadores', () => {
  it('isValidProbability acepta 1..5 y rechaza el resto', () => {
    for (let i = 1; i <= 5; i++) assert.equal(isValidProbability(i), true);
    for (const v of [0, 6, 1.5, '3', null, undefined]) {
      assert.equal(isValidProbability(v), false);
    }
  });
  it('isValidSeverity acepta A..E y rechaza el resto', () => {
    for (const c of ['A','B','C','D','E']) assert.equal(isValidSeverity(c), true);
    for (const v of ['F', 'a', '1', 1, null, undefined, '']) {
      assert.equal(isValidSeverity(v), false);
    }
  });
});

describe('Cálculo de índice y categoría', () => {
  it('calculateRiskIndex combina P y G', () => {
    assert.equal(calculateRiskIndex(5, 'A'), '5A');
    assert.equal(calculateRiskIndex(1, 'E'), '1E');
  });
  it('calculateRiskIndex devuelve null para entradas inválidas', () => {
    assert.equal(calculateRiskIndex(0, 'A'), null);
    assert.equal(calculateRiskIndex(3, 'Z'), null);
  });
  it('Esquinas de la matriz', () => {
    assert.equal(calculateTolerability(5, 'A'), 'Intolerable');
    assert.equal(calculateTolerability(1, 'E'), 'Aceptable');
    assert.equal(calculateTolerability(5, 'E'), 'Tolerable');
    assert.equal(calculateTolerability(1, 'A'), 'Tolerable');
  });
  it('Celdas representativas de cada categoría', () => {
    assert.equal(calculateTolerability(4, 'B'), 'Intolerable');
    assert.equal(calculateTolerability(3, 'C'), 'Tolerable');
    assert.equal(calculateTolerability(2, 'D'), 'Aceptable');
  });
  it('Entradas inválidas devuelven "Desconocido"', () => {
    assert.equal(calculateTolerability(0, 'A'), 'Desconocido');
    assert.equal(calculateTolerability(3, 'Z'), 'Desconocido');
  });
});

describe('Integridad de la matriz SMS', () => {
  it('Catálogos exponen 5 niveles 1..5 y letras A..E', () => {
    assert.deepEqual(PROBABILITY_LEVELS.map((l) => l.level).sort(), [1,2,3,4,5]);
    assert.deepEqual(SEVERITY_LEVELS.map((l) => l.code).sort(), ['A','B','C','D','E']);
  });
  it('Las 25 celdas tienen categoría válida y suman 6/12/7', () => {
    const allowed = new Set(['Intolerable','Tolerable','Aceptable']);
    let intol = 0, tol = 0, ace = 0, total = 0;
    for (let p = 1; p <= 5; p++) {
      for (const s of ['A','B','C','D','E']) {
        const v = RISK_INDEX_MATRIX[p][s];
        assert.ok(allowed.has(v), `Celda ${p}${s} inválida: ${v}`);
        total++;
        if (v === 'Intolerable') intol++;
        else if (v === 'Tolerable') tol++;
        else ace++;
      }
    }
    assert.equal(total, 25);
    assert.equal(intol, 6);
    assert.equal(tol, 12);
    assert.equal(ace, 7);
  });
});
