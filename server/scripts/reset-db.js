// server/scripts/reset-db.js
// Ejecuta server/sql/schema.sql contra la base de datos configurada.
// Uso:  node scripts/reset-db.js   (desde la carpeta server/)
//
// ¡ATENCIÓN! Este script es DESTRUCTIVO: borra todas las tablas del
// dominio y las recrea con datos de ejemplo. Pensado para inicializar
// el entorno o para resetear datos antes de comenzar la recolección.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pool from '../src/db/connection.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '..', 'sql', 'schema.sql');

async function main() {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log(`[reset-db] Ejecutando ${schemaPath} ...`);
  await pool.query(sql);
  console.log('[reset-db] Esquema recreado y datos de ejemplo cargados.');
  await pool.end();
}

main().catch((err) => {
  console.error('[reset-db] Error:', err);
  process.exit(1);
});
