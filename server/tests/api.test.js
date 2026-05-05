// server/tests/api.test.js
// Pruebas de integración HTTP esenciales: contrato del catálogo SMS,
// validación de entrada de evaluaciones y robustez del servidor.
// Ejecutadas contra Express en memoria (no requieren base de datos).

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;
before(() => { app = createApp(); });

describe('Salud y rutas', () => {
  it('GET /api/health responde 200 con estado "ok"', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(!Number.isNaN(Date.parse(res.body.timestamp)));
  });
  it('Rutas inexistentes responden 404', async () => {
    const res = await request(app).get('/api/no-existe');
    assert.equal(res.status, 404);
  });
});

describe('GET /api/diagrams/matrix', () => {
  it('Expone catálogo SMS completo (3 categorías, 25 celdas)', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    assert.equal(res.status, 200);
    assert.equal(res.body.probabilityLevels.length, 5);
    assert.equal(res.body.severityLevels.length, 5);

    const cats = Object.keys(res.body.tolerabilityColors).sort();
    assert.deepEqual(cats, ['Aceptable', 'Intolerable', 'Tolerable']);

    const sev = Object.fromEntries(res.body.severityLevels.map(s => [s.code, s.name]));
    assert.equal(sev.C, 'Grave'); // nomenclatura solicitada
  });
});

describe('POST /api/diagrams/:id/evaluations — validación', () => {
  it('Rechaza evaluationType inválido', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'maybe', probability: 3, severity: 'C' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /evaluationType/);
  });
  it('Rechaza probabilidad fuera de rango', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'before', probability: 9, severity: 'C' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /probability/);
  });
  it('Rechaza gravedad inválida', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'after', probability: 3, severity: 'Z' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /severity/);
  });
});

describe('Robustez', () => {
  it('JSON malformado responde 400 (no 500)', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .set('Content-Type', 'application/json')
      .send('{not json');
    assert.equal(res.status, 400);
  });
});
