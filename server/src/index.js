// server/src/index.js
import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] Escuchando en el puerto ${PORT} (${NODE_ENV})`);
});
