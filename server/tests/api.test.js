// server/tests/api.test.js
// Pruebas de integración HTTP de la API REST.
// Usan supertest contra la app de Express sin necesidad de base de datos
// real: solo se ejercitan endpoints sin DB y la validación previa al
// acceso a datos. Cubren RF-13, RF-17 y RNF-07.

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;

before(() => {
  app = createApp();
});

describe('GET /api/health', () => {
  it('responde 200 con estado "ok"', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
    assert.ok(res.body.environment);
  });
});

describe('GET /api/diagrams/matrix', () => {
  it('responde con la matriz, niveles y colores de tolerabilidad', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    assert.equal(res.status, 200);
    assert.ok(res.body.matrix);
    assert.ok(Array.isArray(res.body.probabilityLevels));
    assert.equal(res.body.probabilityLevels.length, 5);
    assert.ok(Array.isArray(res.body.severityLevels));
    assert.equal(res.body.severityLevels.length, 5);
    assert.ok(res.body.tolerabilityColors.Aceptable);
  });

  it('expone las 3 categorías de tolerabilidad SMS', async () => {
    const res = await request(app).get('/api/diagrams/matrix');
    const colors = Object.keys(res.body.tolerabilityColors).sort();
    assert.deepEqual(colors, ['Aceptable', 'Intolerable', 'Tolerable']);
  });
});

describe('POST /api/diagrams/:id/evaluations — validación', () => {
  it('rechaza tipo de evaluación inválido (400)', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'maybe', probability: 3, severity: 'C' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /evaluationType/);
  });

  it('rechaza probabilidad fuera de rango (400)', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'before', probability: 9, severity: 'C' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /probability/);
  });

  it('rechaza gravedad inválida (400)', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .send({ evaluationType: 'after', probability: 3, severity: 'Z' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /severity/);
  });

  it('rechaza body vacío (400)', async () => {
    const res = await request(app).post('/api/diagrams/1/evaluations').send({});
    assert.equal(res.status, 400);
  });
});

describe('Endpoints inexistentes', () => {
  it('GET /api/no-existe → 404', async () => {
    const res = await request(app).get('/api/no-existe');
    assert.equal(res.status, 404);
  });
});
