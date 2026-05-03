// server/tests/matrix.test.js
// Pruebas funcionales del endpoint /api/diagrams/matrix.
// Verifica que el catálogo expuesto al cliente coincida exactamente con el
// modelo SMS / OACI implementado en el backend.

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;
before(() => { app = createApp(); });

describe('GET /api/diagrams/matrix — contrato del catálogo', () => {
  it('retorna estructura completa del modelo', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    assert.equal(res.status, 200);
    assert.ok(res.body.matrix);
    assert.ok(res.body.probabilityLevels);
    assert.ok(res.body.severityLevels);
    assert.ok(res.body.tolerabilityColors);
    assert.ok(res.body.riskActions);
  });

  it('probabilidades expuestas son 1..5 con nombres SMS', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    const names = Object.fromEntries(res.body.probabilityLevels.map(p => [p.level, p.name]));
    assert.equal(names[5], 'Frecuente');
    assert.equal(names[4], 'Ocasional');
    assert.equal(names[3], 'Remoto');
    assert.equal(names[2], 'Improbable');
    assert.equal(names[1], 'Sumamente improbable');
  });

  it('gravedades expuestas son A..E con nombres SMS', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    const names = Object.fromEntries(res.body.severityLevels.map(s => [s.code, s.name]));
    assert.equal(names.A, 'Catastrófico');
    assert.equal(names.B, 'Peligroso');
    assert.equal(names.C, 'Grave');
    assert.equal(names.D, 'Leve');
    assert.equal(names.E, 'Insignificante');
  });

  it('matriz expone exactamente las 25 celdas con categorías válidas', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    const allowed = new Set(['Intolerable', 'Tolerable', 'Aceptable']);
    let count = 0;
    for (const p of [1, 2, 3, 4, 5]) {
      for (const s of ['A', 'B', 'C', 'D', 'E']) {
        const v = res.body.matrix[p][s];
        assert.ok(allowed.has(v), `Celda ${p}${s} inválida: ${v}`);
        count++;
      }
    }
    assert.equal(count, 25);
  });

  it('contiene mensaje de acción para cada categoría', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    assert.ok(res.body.riskActions.Intolerable.length > 20);
    assert.ok(res.body.riskActions.Tolerable.length > 20);
    assert.ok(res.body.riskActions.Aceptable.length > 10);
  });

  it('paleta de colores incluye 3 categorías con bg/border/text/solid', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    for (const cat of ['Intolerable', 'Tolerable', 'Aceptable']) {
      const c = res.body.tolerabilityColors[cat];
      assert.ok(c && c.bg && c.border && c.text && c.solid, `falta paleta ${cat}`);
    }
  });
});
