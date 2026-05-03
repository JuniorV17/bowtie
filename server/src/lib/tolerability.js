// server/src/lib/tolerability.js
// Modelo de evaluación de riesgo SMS / OACI:
//   - Probabilidad: entero 1..5
//   - Gravedad:     letra 'A'..'E'
//   - Índice de riesgo: combinación "<probabilidad><gravedad>" (ej. "4B")
//   - Categoría: Intolerable / Tolerable / Aceptable
//
// La distribución de celdas en la matriz 5x5 reproduce exactamente la tabla
// del Manual de gestión de la seguridad operacional (SMM) de la OACI.

export const PROBABILITY_LEVELS = [
  { level: 5, name: 'Frecuente',            description: 'Es probable que suceda muchas veces (ha ocurrido frecuentemente)' },
  { level: 4, name: 'Ocasional',            description: 'Es probable que suceda algunas veces (ha ocurrido con poca frecuencia)' },
  { level: 3, name: 'Remoto',               description: 'Es poco probable que ocurra, pero no imposible (rara vez ha ocurrido)' },
  { level: 2, name: 'Improbable',           description: 'Es muy poco probable que ocurra (no se sabe que haya ocurrido)' },
  { level: 1, name: 'Sumamente improbable', description: 'Es casi inconcebible que el suceso ocurra' },
];

export const SEVERITY_LEVELS = [
  { code: 'A', name: 'Catastrófico',  description: 'Aeronave o equipo destruidos. Varias muertes.' },
  { code: 'B', name: 'Peligroso',     description: 'Gran reducción de los márgenes de seguridad operacional, lesiones graves, daños importantes al equipo.' },
  { code: 'C', name: 'Grave',         description: 'Reducción importante de los márgenes de seguridad operacional, incidente grave, lesiones a las personas.' },
  { code: 'D', name: 'Leve',          description: 'Molestias, limitaciones operacionales, uso de procedimientos de emergencia, incidente leve.' },
  { code: 'E', name: 'Insignificante', description: 'Pocas consecuencias.' },
];

// Categorías de riesgo (3 niveles).
export const RISK_CATEGORIES = {
  INTOLERABLE: 'Intolerable',
  TOLERABLE:   'Tolerable',
  ACEPTABLE:   'Aceptable',
};

// Distribución de las 25 celdas de la matriz tal como aparece en la tabla
// "Rango del índice de riesgo de seguridad operacional" del SMM.
//   INTOLERABLE: 5A 5B 5C 4A 4B 3A
//   TOLERABLE:   5D 5E 4C 4D 4E 3B 3C 3D 2A 2B 2C 1A
//   ACEPTABLE:   3E 2D 2E 1B 1C 1D 1E
export const RISK_INDEX_MATRIX = {
  5: { A: 'Intolerable', B: 'Intolerable', C: 'Intolerable', D: 'Tolerable',  E: 'Tolerable'  },
  4: { A: 'Intolerable', B: 'Intolerable', C: 'Tolerable',   D: 'Tolerable',  E: 'Tolerable'  },
  3: { A: 'Intolerable', B: 'Tolerable',   C: 'Tolerable',   D: 'Tolerable',  E: 'Aceptable'  },
  2: { A: 'Tolerable',   B: 'Tolerable',   C: 'Tolerable',   D: 'Aceptable',  E: 'Aceptable'  },
  1: { A: 'Tolerable',   B: 'Aceptable',   C: 'Aceptable',   D: 'Aceptable',  E: 'Aceptable'  },
};

// Paleta de colores por categoría — diseñada para ser claramente diciente.
export const TOLERABILITY_COLORS = {
  Intolerable: { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D', solid: '#DC2626' },
  Tolerable:   { bg: '#FFEDD5', border: '#EA580C', text: '#7C2D12', solid: '#F97316' },
  Aceptable:   { bg: '#DCFCE7', border: '#16A34A', text: '#14532D', solid: '#22C55E' },
};

// Mensaje de acción recomendada por categoría (texto fiel al SMM).
export const RISK_ACTIONS = {
  Intolerable: 'Tomar medidas inmediatas para mitigar el riesgo o suspender la actividad. Realizar la mitigación de riesgos de seguridad operacional prioritaria para garantizar que haya controles preventivos o adicionales o mejorados para reducir el índice de riesgos al rango tolerable.',
  Tolerable:   'Puede tolerarse sobre la base de la mitigación de riesgos de seguridad operacional. Puede necesitar una decisión de gestión para aceptar el riesgo.',
  Aceptable:   'Aceptable tal cual. No se necesita una mitigación de riesgo posterior.',
};

// ---------- Validaciones ----------

export function isValidProbability(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function isValidSeverity(value) {
  return typeof value === 'string' && /^[A-E]$/.test(value);
}

// ---------- Cálculos ----------

export function calculateRiskIndex(probability, severity) {
  if (!isValidProbability(probability) || !isValidSeverity(severity)) return null;
  return `${probability}${severity}`;
}

export function calculateTolerability(probability, severity) {
  if (!isValidProbability(probability) || !isValidSeverity(severity)) {
    return 'Desconocido';
  }
  return RISK_INDEX_MATRIX[probability]?.[severity] || 'Desconocido';
}

// Compatibilidad: algunos consumidores antiguos llamaban isValidScore(num).
export function isValidScore(value) {
  return isValidProbability(value);
}
