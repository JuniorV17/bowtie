// server/tests/tolerability.test.js
// Pruebas unitarias del modelo SMS/OACI: probabilidad 1..5, gravedad A..E,
// tres categorías (Intolerable / Tolerable / Aceptable). Verifica RF-13
// (cálculo automático) y RNF-07 (validación de rangos).

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

describe('isValidProbability', () => {
  it('acepta enteros entre 1 y 5', () => {
    for (let i = 1; i <= 5; i++) assert.equal(isValidProbability(i), true);
  });
  it('rechaza valores fuera de rango y no enteros', () => {
    assert.equal(isValidProbability(0), false);
    assert.equal(isValidProbability(6), false);
    assert.equal(isValidProbability(2.5), false);
    assert.equal(isValidProbability('3'), false);
    assert.equal(isValidProbability(null), false);
  });
});

describe('isValidSeverity', () => {
  it('acepta letras A..E', () => {
    for (const c of ['A','B','C','D','E']) assert.equal(isValidSeverity(c), true);
  });
  it('rechaza otras letras o tipos', () => {
    assert.equal(isValidSeverity('F'), false);
    assert.equal(isValidSeverity('a'), false);
    assert.equal(isValidSeverity(1), false);
    assert.equal(isValidSeverity(null), false);
  });
});

describe('calculateRiskIndex', () => {
  it('combina probabilidad y gravedad', () => {
    assert.equal(calculateRiskIndex(5, 'A'), '5A');
    assert.equal(calculateRiskIndex(1, 'E'), '1E');
    assert.equal(calculateRiskIndex(3, 'C'), '3C');
  });
  it('devuelve null para entradas inválidas', () => {
    assert.equal(calculateRiskIndex(0, 'A'), null);
    assert.equal(calculateRiskIndex(3, 'Z'), null);
  });
});

describe('calculateTolerability — celdas Intolerables', () => {
  const intolerables = [
    [5,'A'],[5,'B'],[5,'C'],[4,'A'],[4,'B'],[3,'A']
  ];
  for (const [p,s] of intolerables) {
    it(`(${p},${s}) → Intolerable`, () => {
      assert.equal(calculateTolerability(p, s), 'Intolerable');
    });
  }
});

describe('calculateTolerability — celdas Tolerables', () => {
  const tolerables = [
    [5,'D'],[5,'E'],[4,'C'],[4,'D'],[4,'E'],
    [3,'B'],[3,'C'],[3,'D'],
    [2,'A'],[2,'B'],[2,'C'],
    [1,'A']
  ];
  for (const [p,s] of tolerables) {
    it(`(${p},${s}) → Tolerable`, () => {
      assert.equal(calculateTolerability(p, s), 'Tolerable');
    });
  }
});

describe('calculateTolerability — celdas Aceptables', () => {
  const aceptables = [
    [3,'E'],[2,'D'],[2,'E'],[1,'B'],[1,'C'],[1,'D'],[1,'E']
  ];
  for (const [p,s] of aceptables) {
    it(`(${p},${s}) → Aceptable`, () => {
      assert.equal(calculateTolerability(p, s), 'Aceptable');
    });
  }
});

describe('calculateTolerability — entradas inválidas', () => {
  it('valores fuera de rango → "Desconocido"', () => {
    assert.equal(calculateTolerability(0, 'A'), 'Desconocido');
    assert.equal(calculateTolerability(3, 'Z'), 'Desconocido');
    assert.equal(calculateTolerability(null, undefined), 'Desconocido');
  });
});

describe('Catálogos', () => {
  it('PROBABILITY_LEVELS define 5 niveles 1..5', () => {
    assert.equal(PROBABILITY_LEVELS.length, 5);
    assert.deepEqual(
      PROBABILITY_LEVELS.map((l) => l.level).sort(),
      [1, 2, 3, 4, 5]
    );
  });
  it('SEVERITY_LEVELS define 5 letras A..E', () => {
    assert.equal(SEVERITY_LEVELS.length, 5);
    assert.deepEqual(
      SEVERITY_LEVELS.map((l) => l.code).sort(),
      ['A','B','C','D','E']
    );
  });
  it('la matriz cubre las 25 celdas con categoría válida', () => {
    const valid = new Set(['Intolerable','Tolerable','Aceptable']);
    let total = 0;
    for (let p = 1; p <= 5; p++) {
      for (const s of ['A','B','C','D','E']) {
        const v = RISK_INDEX_MATRIX[p][s];
        assert.ok(valid.has(v), `Celda inválida (${p},${s}) = ${v}`);
        total += 1;
      }
    }
    assert.equal(total, 25);
  });
  it('conteo por categoría coincide con el SMM', () => {
    let intol = 0, tol = 0, ace = 0;
    for (let p = 1; p <= 5; p++) {
      for (const s of ['A','B','C','D','E']) {
        const v = RISK_INDEX_MATRIX[p][s];
        if (v === 'Intolerable') intol++;
        else if (v === 'Tolerable') tol++;
        else if (v === 'Aceptable') ace++;
      }
    }
    assert.equal(intol, 6);
    assert.equal(tol, 12);
    assert.equal(ace, 7);
  });
});
