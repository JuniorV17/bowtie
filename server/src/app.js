// server/src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import diagramsRouter from './routes/diagrams.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  const NODE_ENV = process.env.NODE_ENV || 'development';

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use('/api/diagrams', diagramsRouter);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  if (NODE_ENV === 'production') {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use((err, req, res, next) => {
    // body-parser produce SyntaxError con type 'entity.parse.failed' cuando
    // el cliente envía JSON malformado: responder 400 en lugar de 500.
    if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSON malformado' });
    }
    console.error('[server] Error no controlado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
