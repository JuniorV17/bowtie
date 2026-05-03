// server/tests/validation.test.js
// Pruebas de validación HTTP exhaustivas para las evaluaciones de riesgo.
// No requieren conexión a BD: el controller valida ANTES de tocar datos.

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;
before(() => { app = createApp(); });

describe('Validación de probabilidad', () => {
  const badProbs = [0, 6, -1, 1.5, 'tres', null, undefined];
  for (const p of badProbs) {
    it(`rechaza probabilidad inválida: ${JSON.stringify(p)}`, async () => {
      const res = await request(app)
        .post('/api/diagrams/1/evaluations')
        .send({ evaluationType: 'before', probability: p, severity: 'C' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /probability/);
    });
  }
});

describe('Validación de gravedad', () => {
  const badSevs = ['F', 'a', '1', 1, 0, null, undefined, '', 'AB'];
  for (const s of badSevs) {
    it(`rechaza gravedad inválida: ${JSON.stringify(s)}`, async () => {
      const res = await request(app)
        .post('/api/diagrams/1/evaluations')
        .send({ evaluationType: 'before', probability: 3, severity: s });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /severity/);
    });
  }
});

describe('Validación de tipo de evaluación', () => {
  const badTypes = ['', 'BEFORE', 'pre', 'post', 'maybe', null, 1];
  for (const t of badTypes) {
    it(`rechaza evaluationType inválido: ${JSON.stringify(t)}`, async () => {
      const res = await request(app)
        .post('/api/diagrams/1/evaluations')
        .send({ evaluationType: t, probability: 3, severity: 'C' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /evaluationType/);
    });
  }
});

describe('Validación de PUT /api/diagrams/evaluations/:id', () => {
  it('rechaza probabilidad fuera de rango en update (400)', async () => {
    const res = await request(app)
      .put('/api/diagrams/evaluations/9999')
      .send({ probability: 0, severity: 'A' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /probability/);
  });
  it('rechaza gravedad inválida en update (400)', async () => {
    const res = await request(app)
      .put('/api/diagrams/evaluations/9999')
      .send({ probability: 3, severity: 'Z' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /severity/);
  });
});

describe('Robustez del servidor', () => {
  it('rechaza JSON malformado (400)', async () => {
    const res = await request(app)
      .post('/api/diagrams/1/evaluations')
      .set('Content-Type', 'application/json')
      .send('{not json');
    assert.equal(res.status, 400);
  });

  it('responde 404 para rutas inexistentes', async () => {
    const res = await request(app).get('/api/no-existe');
    assert.equal(res.status, 404);
  });

  it('CORS habilitado: header Access-Control-Allow-Origin presente', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    assert.equal(res.headers['access-control-allow-origin'], '*');
  });

  it('respuesta health incluye timestamp ISO válido', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(!Number.isNaN(Date.parse(res.body.timestamp)));
  });
});
