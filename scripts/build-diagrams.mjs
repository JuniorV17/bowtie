// scripts/build-diagrams.mjs
// Extracts every ```mermaid``` block from the docs in `Documentación/`,
// renders each to a black-and-white PDF (formal deliverable) and PNG
// (inline preview), renames the outputs with descriptive titles, and
// rewrites the source `.md` files so each Mermaid block is replaced by
// a Markdown image + PDF link.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'Documentación');
const OUT = path.join(DOCS, 'Diagramas');
const TMP = path.join(ROOT, '.tmp-diagrams');
const isWin = process.platform === 'win32';

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

// Mapping: filename + block index -> descriptive slug + display title.
// Any block not listed here falls back to a generic name.
const NAMES = {
  '04-Casos-de-Uso.md': [
    { slug: '04-01-Casos-de-Uso', title: 'Diagrama de Casos de Uso' },
  ],
  '05-Arquitectura.md': [
    { slug: '05-01-Arquitectura-Tres-Capas', title: 'Arquitectura en Tres Capas' },
    { slug: '05-02-Vista-Logica', title: 'Vista Lógica del Sistema' },
    { slug: '05-03-Despliegue-Resumen', title: 'Vista de Despliegue (Resumen)' },
  ],
  '06-Diagrama-Componentes.md': [
    { slug: '06-01-Componentes-Railway', title: 'Diagrama de Componentes — Despliegue Railway' },
    { slug: '06-02-Componentes-Backend', title: 'Diagrama de Componentes — Detalle Backend' },
  ],
  '07-Diagrama-Clases.md': [
    { slug: '07-01-Clases-Dominio', title: 'Diagrama de Clases — Modelo de Dominio' },
    { slug: '07-02-Clases-Backend', title: 'Diagrama de Clases — Backend' },
    { slug: '07-03-Clases-Frontend', title: 'Diagrama de Clases — Frontend' },
  ],
  '08-Modelo-Datos.md': [
    { slug: '08-01-Modelo-ER', title: 'Diagrama Entidad–Relación' },
  ],
  '09-Diagrama-Secuencia.md': [
    { slug: '09-01-Secuencia-Crear-Diagrama', title: 'Secuencia — Crear Diagrama (CU-01)' },
    { slug: '09-02-Secuencia-Visualizar', title: 'Secuencia — Visualizar Diagrama (CU-03)' },
    { slug: '09-03-Secuencia-Evaluar-Riesgo', title: 'Secuencia — Evaluar Riesgo (CU-06)' },
    { slug: '09-04-Secuencia-Eliminar', title: 'Secuencia — Eliminar Diagrama (CU-05)' },
    { slug: '09-05-Secuencia-Health-Check', title: 'Secuencia — Health Check (CU-09)' },
  ],
  '10-Diagramas-Actividad.md': [
    { slug: '10-01-Logica-General', title: 'Diagrama de Lógica General del Sistema' },
    { slug: '10-02-Flujo-Wizard', title: 'Flujo del Asistente de Creación' },
    { slug: '10-03-Logica-Evaluacion', title: 'Lógica de la Evaluación de Riesgo' },
    { slug: '10-04-Flujo-Despliegue-Railway', title: 'Flujo de Despliegue en Railway' },
    { slug: '10-05-Estados-Diagrama', title: 'Diagrama de Estados de un Diagrama' },
  ],
  '11-Diagrama-Despliegue.md': [
    { slug: '11-01-Topologia-Railway', title: 'Topología de Despliegue en Railway' },
  ],
};

// Mermaid CSS overrides to enforce black & white output.
const CSS = `
svg { background: #ffffff !important; }
.node rect, .node polygon, .node circle, .node ellipse, .node path,
.cluster rect {
  fill: #ffffff !important;
  stroke: #000000 !important;
  stroke-width: 1.2px !important;
}
.label, .nodeLabel, text, .titleText, .actor, .messageText,
.loopText, .noteText, .labelText {
  fill: #000000 !important;
  color: #000000 !important;
  font-family: "Times New Roman", Times, serif !important;
}
.edgePath path, .flowchart-link, line, .messageLine0, .messageLine1,
.actor-line, .relation, .arrowheadPath, marker path {
  stroke: #000000 !important;
  fill: #000000 !important;
}
.edgeLabel, .edgeLabel rect {
  background-color: #ffffff !important;
  fill: #ffffff !important;
  color: #000000 !important;
}
.note { fill: #f5f5f5 !important; stroke: #000000 !important; }
.actor { fill: #ffffff !important; stroke: #000000 !important; }
.classGroup rect, .classGroup line {
  fill: #ffffff !important;
  stroke: #000000 !important;
}
.entityBox { fill: #ffffff !important; stroke: #000000 !important; }
.attributeBoxOdd, .attributeBoxEven {
  fill: #ffffff !important;
  stroke: #000000 !important;
}
.statediagram-state rect, .statediagram-cluster rect {
  fill: #ffffff !important;
  stroke: #000000 !important;
}
`;

const cssPath = path.join(TMP, 'mono.css');
fs.writeFileSync(cssPath, CSS);

const puppeteerCfgPath = path.join(TMP, 'puppeteer.json');
fs.writeFileSync(
  puppeteerCfgPath,
  JSON.stringify({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
);

const mermaidCfgPath = path.join(TMP, 'mermaid-config.json');
fs.writeFileSync(
  mermaidCfgPath,
  JSON.stringify({
    theme: 'neutral',
    themeVariables: {
      background: '#ffffff',
      primaryColor: '#ffffff',
      primaryTextColor: '#000000',
      primaryBorderColor: '#000000',
      lineColor: '#000000',
      secondaryColor: '#ffffff',
      tertiaryColor: '#ffffff',
      mainBkg: '#ffffff',
      nodeBorder: '#000000',
      clusterBkg: '#ffffff',
      clusterBorder: '#000000',
      titleColor: '#000000',
      edgeLabelBackground: '#ffffff',
      noteBkgColor: '#f5f5f5',
      noteBorderColor: '#000000',
      noteTextColor: '#000000',
      actorBkg: '#ffffff',
      actorBorder: '#000000',
      actorTextColor: '#000000',
      labelBoxBkgColor: '#ffffff',
      labelBoxBorderColor: '#000000',
      sequenceNumberColor: '#000000',
    },
  })
);

const mmdc = path.join(
  ROOT,
  'node_modules',
  '.bin',
  isWin ? 'mmdc.cmd' : 'mmdc'
);

function extractBlocks(md) {
  const blocks = [];
  const re = /```mermaid\s*\n([\s\S]*?)```/g;
  let m;
  let i = 0;
  while ((m = re.exec(md)) !== null) {
    i += 1;
    blocks.push({
      index: i,
      source: m[1].trim(),
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
    });
  }
  return blocks;
}

function render(srcPath, outPath, format) {
  const args = [
    '-i', srcPath,
    '-o', outPath,
    '-t', 'neutral',
    '-b', 'white',
    '--cssFile', cssPath,
    '--configFile', mermaidCfgPath,
    '--puppeteerConfigFile', puppeteerCfgPath,
  ];
  if (format === 'pdf') {
    args.push('--pdfFit');
  } else if (format === 'png') {
    args.push('-w', '2000');
  }
  execFileSync(mmdc, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
  });
}

const docs = fs
  .readdirSync(DOCS)
  .filter((f) => /\.md$/.test(f) && f !== 'README.md')
  .sort();

const summary = [];

for (const file of docs) {
  const fullPath = path.join(DOCS, file);
  const md = fs.readFileSync(fullPath, 'utf8');
  const blocks = extractBlocks(md);
  if (blocks.length === 0) continue;

  const mapping = NAMES[file] || [];
  const replacements = [];

  for (const block of blocks) {
    const meta = mapping[block.index - 1] || {
      slug: `${file.replace(/\.md$/, '')}__${String(block.index).padStart(2, '0')}`,
      title: `Diagrama ${block.index}`,
    };

    const tmpFile = path.join(TMP, `${meta.slug}.mmd`);
    const pdfFile = path.join(OUT, `${meta.slug}.pdf`);
    const pngFile = path.join(OUT, `${meta.slug}.png`);
    fs.writeFileSync(tmpFile, block.source);

    process.stdout.write(`Rendering ${meta.slug} ... `);
    try {
      render(tmpFile, pdfFile, 'pdf');
      render(tmpFile, pngFile, 'png');
      console.log('ok');
      summary.push({ file, idx: block.index, meta });

      const replacement =
        `> **${meta.title}** — ` +
        `[descargar PDF](Diagramas/${meta.slug}.pdf)\n\n` +
        `![${meta.title}](Diagramas/${meta.slug}.png)`;
      replacements.push({ start: block.start, end: block.end, replacement });
    } catch (err) {
      console.log('FAILED');
      console.error(err.message);
      process.exitCode = 1;
    }
  }

  // Apply replacements from the bottom up to preserve indices.
  let updated = md;
  replacements.sort((a, b) => b.start - a.start);
  for (const r of replacements) {
    updated = updated.slice(0, r.start) + r.replacement + updated.slice(r.end);
  }
  if (updated !== md) {
    fs.writeFileSync(fullPath, updated);
  }
}

// Clean up legacy generated files (numeric tail names).
for (const f of fs.readdirSync(OUT)) {
  if (/__\d{2}\.(pdf|png)$/.test(f)) {
    fs.rmSync(path.join(OUT, f));
  }
}

const lines = [
  '# Índice de Diagramas',
  '',
  'Cada diagrama del proyecto está disponible en formato **PDF** (entregable',
  'formal, blanco y negro) y **PNG** (vista previa inline). Se generan con',
  '`node scripts/build-diagrams.mjs` desde la raíz del repositorio.',
  '',
  '| # | Diagrama | PDF | PNG |',
  '|---|----------|-----|-----|',
];
for (const item of summary) {
  lines.push(
    `| ${item.idx} | ${item.meta.title} | ` +
      `[${item.meta.slug}.pdf](${item.meta.slug}.pdf) | ` +
      `[${item.meta.slug}.png](${item.meta.slug}.png) |`
  );
}
fs.writeFileSync(path.join(OUT, 'README.md'), lines.join('\n') + '\n');

console.log(`\nGenerados ${summary.length} diagramas (PDF + PNG) en ${OUT}`);
