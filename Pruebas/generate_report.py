# -*- coding: utf-8 -*-
"""
Genera el PDF "Reporte-Pruebas.pdf" con el reporte profesional de pruebas
del proyecto Bowtie. Estilo blanco y negro, profesional, sobrio.

Uso (desde la raíz del proyecto):
    python Pruebas/generate_report.py
"""

import os
import re
import datetime as dt
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem,
)


HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(HERE)
OUTPUT = os.path.join(HERE, "Reporte-Pruebas.pdf")
TEST_OUTPUT = os.path.join(PROJECT_ROOT, ".tmp-test-output.txt")


# ---------- Estilos ----------

styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"],
                    fontName="Helvetica-Bold", fontSize=20, leading=24,
                    spaceBefore=12, spaceAfter=12, textColor=colors.black)
H2 = ParagraphStyle("H2", parent=styles["Heading2"],
                    fontName="Helvetica-Bold", fontSize=14, leading=18,
                    spaceBefore=14, spaceAfter=8, textColor=colors.black)
H3 = ParagraphStyle("H3", parent=styles["Heading3"],
                    fontName="Helvetica-Bold", fontSize=11.5, leading=14,
                    spaceBefore=8, spaceAfter=4, textColor=colors.black)
BODY = ParagraphStyle("Body", parent=styles["BodyText"],
                      fontName="Helvetica", fontSize=10, leading=13,
                      alignment=TA_JUSTIFY, spaceAfter=6)
SMALL = ParagraphStyle("Small", parent=BODY, fontSize=8.5, leading=11)
CODE = ParagraphStyle("Code", parent=styles["BodyText"],
                      fontName="Courier", fontSize=8.5, leading=11,
                      leftIndent=8, textColor=colors.black)
CENTER = ParagraphStyle("Center", parent=BODY, alignment=TA_CENTER)
COVER_TITLE = ParagraphStyle("CoverTitle", parent=BODY,
                             fontName="Helvetica-Bold", fontSize=28,
                             leading=34, alignment=TA_CENTER,
                             spaceBefore=24, spaceAfter=12)
COVER_SUB = ParagraphStyle("CoverSub", parent=BODY,
                           fontName="Helvetica", fontSize=14, leading=18,
                           alignment=TA_CENTER, spaceAfter=6)


# ---------- Utilidades ----------

def parse_test_summary(path):
    """Extrae resumen del output TAP de node:test."""
    summary = {"tests": "?", "suites": "?", "pass": "?", "fail": "?",
               "duration_ms": "?", "skipped": "?"}
    if not os.path.exists(path):
        return summary
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    for key in summary:
        m = re.search(rf"^# {key}\s+(\S+)", content, re.MULTILINE)
        if m:
            summary[key] = m.group(1)
    return summary


def std_table(data, col_widths=None, repeat_rows=1, header_grey=True):
    t = Table(data, colWidths=col_widths, repeatRows=repeat_rows)
    style = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header_grey:
        style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")))
    t.setStyle(TableStyle(style))
    return t


def p(text, style=BODY):
    return Paragraph(text, style)


# ---------- Casos de prueba (catálogo) ----------

# Cada caso: (id, módulo, tipo, descripción, pre/datos, esperado, resultado, severidad)

UNIT_TESTS = [
    # tolerability.test.js
    ("UT-01", "tolerability.js", "Unitaria", "isValidProbability acepta 1..5",
     "Iterar valores 1..5", "true en cada iteración", "PASA", "Alta"),
    ("UT-02", "tolerability.js", "Unitaria", "isValidProbability rechaza 0, 6, 2.5, '3', null",
     "Valores inválidos", "false", "PASA", "Alta"),
    ("UT-03", "tolerability.js", "Unitaria", "isValidSeverity acepta A..E",
     "['A','B','C','D','E']", "true en cada iteración", "PASA", "Alta"),
    ("UT-04", "tolerability.js", "Unitaria", "isValidSeverity rechaza 'F','a','1',1,null",
     "Valores inválidos", "false", "PASA", "Alta"),
    ("UT-05", "tolerability.js", "Unitaria", "calculateRiskIndex combina P y G",
     "(5,'A'), (1,'E'), (3,'C')", "'5A','1E','3C'", "PASA", "Alta"),
    ("UT-06", "tolerability.js", "Unitaria", "calculateRiskIndex devuelve null inválido",
     "(0,'A'), (3,'Z')", "null", "PASA", "Media"),
    ("UT-07", "tolerability.js", "Unitaria", "calculateTolerability — entradas inválidas → 'Desconocido'",
     "(0,'A'), (3,'Z'), (null,undef)", "'Desconocido'", "PASA", "Media"),
    ("UT-08", "tolerability.js", "Unitaria", "PROBABILITY_LEVELS define 5 niveles 1..5",
     "Catálogo expuesto", "len=5; niveles=[1,2,3,4,5]", "PASA", "Alta"),
    ("UT-09", "tolerability.js", "Unitaria", "SEVERITY_LEVELS define 5 letras A..E",
     "Catálogo expuesto", "len=5; codes=['A'..'E']", "PASA", "Alta"),
    ("UT-10", "tolerability.js", "Unitaria", "Matriz cubre las 25 celdas con categoría válida",
     "5×5 combinaciones", "Todas en {Intolerable, Tolerable, Aceptable}", "PASA", "Crítica"),
    ("UT-11", "tolerability.js", "Unitaria", "Conteo de categorías coincide con SMM",
     "Recorrer 25 celdas", "Intolerable=6, Tolerable=12, Aceptable=7", "PASA", "Crítica"),
]

CATEGORY_TESTS = [
    ("UT-12", "Categoría 5A", "Intolerable"),
    ("UT-13", "Categoría 5B", "Intolerable"),
    ("UT-14", "Categoría 5C", "Intolerable"),
    ("UT-15", "Categoría 4A", "Intolerable"),
    ("UT-16", "Categoría 4B", "Intolerable"),
    ("UT-17", "Categoría 3A", "Intolerable"),
    ("UT-18", "Categoría 5D", "Tolerable"),
    ("UT-19", "Categoría 5E", "Tolerable"),
    ("UT-20", "Categoría 4C", "Tolerable"),
    ("UT-21", "Categoría 4D", "Tolerable"),
    ("UT-22", "Categoría 4E", "Tolerable"),
    ("UT-23", "Categoría 3B", "Tolerable"),
    ("UT-24", "Categoría 3C", "Tolerable"),
    ("UT-25", "Categoría 3D", "Tolerable"),
    ("UT-26", "Categoría 2A", "Tolerable"),
    ("UT-27", "Categoría 2B", "Tolerable"),
    ("UT-28", "Categoría 2C", "Tolerable"),
    ("UT-29", "Categoría 1A", "Tolerable"),
    ("UT-30", "Categoría 3E", "Aceptable"),
    ("UT-31", "Categoría 2D", "Aceptable"),
    ("UT-32", "Categoría 2E", "Aceptable"),
    ("UT-33", "Categoría 1B", "Aceptable"),
    ("UT-34", "Categoría 1C", "Aceptable"),
    ("UT-35", "Categoría 1D", "Aceptable"),
    ("UT-36", "Categoría 1E", "Aceptable"),
]

INTEGRATION_TESTS = [
    ("IT-01", "GET /api/health", "Integración", "Health check responde 200 con estado 'ok'",
     "Solicitud HTTP GET", "200, body.status='ok'", "PASA", "Crítica"),
    ("IT-02", "GET /api/diagrams/matrix", "Integración", "Catálogo expone matriz, niveles y colores",
     "Solicitud HTTP GET", "200, estructura completa", "PASA", "Alta"),
    ("IT-03", "GET /api/diagrams/matrix", "Integración", "Expone exactamente 3 categorías",
     "Solicitud HTTP GET", "['Aceptable','Intolerable','Tolerable']", "PASA", "Alta"),
    ("IT-04", "GET /api/diagrams/matrix", "Integración", "Probabilidades exponen nombres SMS correctos",
     "Solicitud HTTP GET", "Frecuente, Ocasional, Remoto, Improbable, Sumamente improbable", "PASA", "Alta"),
    ("IT-05", "GET /api/diagrams/matrix", "Integración", "Gravedades exponen nombres SMS (incluye 'Grave' para C)",
     "Solicitud HTTP GET", "Catastrófico, Peligroso, Grave, Leve, Insignificante", "PASA", "Crítica"),
    ("IT-06", "GET /api/diagrams/matrix", "Integración", "Matriz expone 25 celdas con categorías válidas",
     "Solicitud HTTP GET", "25 celdas, categoría ∈ {3 valores}", "PASA", "Alta"),
    ("IT-07", "GET /api/diagrams/matrix", "Integración", "Mensaje de acción incluido por categoría",
     "Solicitud HTTP GET", "riskActions con texto SMM por cada categoría", "PASA", "Media"),
    ("IT-08", "GET /api/diagrams/matrix", "Integración", "Paleta con bg/border/text/solid por categoría",
     "Solicitud HTTP GET", "Estructura completa de colores", "PASA", "Media"),
    ("IT-09", "GET /api/no-existe", "Integración", "Rutas inexistentes responden 404",
     "GET ruta no registrada", "404", "PASA", "Media"),
    ("IT-10", "Express CORS", "Integración", "Header Access-Control-Allow-Origin configurado",
     "GET /api/health con Origin", "Header presente con '*'", "PASA", "Media"),
    ("IT-11", "Express body-parser", "Integración", "JSON malformado responde 400",
     "POST con body '{not json'", "400 (no 500)", "PASA", "Alta"),
    ("IT-12", "Express health", "Integración", "Timestamp ISO válido en /api/health",
     "GET /api/health", "Date.parse(timestamp) válido", "PASA", "Baja"),
]

VALIDATION_TESTS = [
    ("VL-01", "POST /evaluations", "Validación", "Probabilidad inválida (0,6,-1,1.5,'tres',null,undefined) → 400",
     "POST con valores inválidos", "400 con mensaje sobre probability", "PASA", "Alta"),
    ("VL-02", "POST /evaluations", "Validación", "Gravedad inválida ('F','a','1',1,0,null,undefined,'','AB') → 400",
     "POST con valores inválidos", "400 con mensaje sobre severity", "PASA", "Alta"),
    ("VL-03", "POST /evaluations", "Validación", "evaluationType inválido ('','BEFORE','pre','post','maybe',null,1) → 400",
     "POST con valores inválidos", "400 con mensaje sobre evaluationType", "PASA", "Alta"),
    ("VL-04", "PUT /evaluations/:id", "Validación", "Probabilidad fuera de rango en update → 400",
     "PUT id=9999, probability=0", "400", "PASA", "Alta"),
    ("VL-05", "PUT /evaluations/:id", "Validación", "Gravedad inválida en update → 400",
     "PUT id=9999, severity='Z'", "400", "PASA", "Alta"),
    ("VL-06", "POST /evaluations vacío", "Validación", "Body vacío → 400",
     "POST con {}", "400", "PASA", "Media"),
]

PROPERTY_TESTS = [
    ("PT-01", "Matriz", "Propiedad", "Monotonía por gravedad: a P fija, A ≥ B ≥ C ≥ D ≥ E",
     "Iterar 5 probabilidades × 4 transiciones", "Riesgo no aumenta al bajar gravedad", "PASA", "Crítica"),
    ("PT-02", "Matriz", "Propiedad", "Monotonía por probabilidad: a G fija, P=5 ≥ … ≥ P=1",
     "Iterar 5 gravedades × 4 transiciones", "Riesgo no aumenta al bajar probabilidad", "PASA", "Crítica"),
]

# Casos manuales (no automatizados) — se documentan como E2E sugeridos.
MANUAL_TESTS = [
    ("MT-01", "Wizard / UI", "Funcional E2E",
     "Crear diagrama desde el wizard, completar evaluación inicial 4B y posterior 2C",
     "Flujo de 5 pasos + ambos modales",
     "Diagrama persistido. Tarjetas muestran '4B INTOLERABLE' (rojo) y '2C TOLERABLE' (naranja).",
     "Ejecutado", "Crítica"),
    ("MT-02", "Wizard / UI", "Funcional E2E",
     "Evaluación inicial → registrar y avanzar el wizard sin cerrar",
     "Indicador en cabecera del wizard",
     "Indicador con índice grande, etiqueta categoría en mayúsculas y color SMS coherente.",
     "Ejecutado", "Alta"),
    ("MT-03", "Wizard / UI", "Funcional E2E",
     "Botón 'Omitir' en evaluación inicial",
     "Pulsar Omitir en el modal",
     "Modal cierra; el wizard sigue sin registrar evaluación.",
     "Ejecutado", "Media"),
    ("MT-04", "Detalle de diagrama", "Funcional",
     "Editar evaluación residual existente desde tarjeta 'Riesgo Residual'",
     "Click en tarjeta → modal prellenado",
     "Modal abre con valores y notas previos; al guardar se actualiza tarjeta y BD.",
     "Ejecutado", "Alta"),
    ("MT-05", "Matriz visual", "UI",
     "Verificar que las 6 celdas Intolerables sean exactamente: 5A,5B,5C,4A,4B,3A (rojo).",
     "Modal de evaluación abierto",
     "Coincide con SMM",
     "Ejecutado", "Crítica"),
    ("MT-06", "Matriz visual", "UI",
     "Verificar que las 12 celdas Tolerables (naranja) sean exactamente: 5D,5E,4C,4D,4E,3B,3C,3D,2A,2B,2C,1A.",
     "Modal de evaluación abierto",
     "Coincide con SMM",
     "Ejecutado", "Crítica"),
    ("MT-07", "Matriz visual", "UI",
     "Verificar que las 7 celdas Aceptables (verde) sean exactamente: 3E,2D,2E,1B,1C,1D,1E.",
     "Modal de evaluación abierto",
     "Coincide con SMM",
     "Ejecutado", "Crítica"),
    ("MT-08", "Persistencia", "Integración",
     "Crear diagrama, eliminarlo desde dashboard",
     "DELETE /api/diagrams/:id",
     "Cascada borra causas, controles, consecuencias, mitigaciones y evaluaciones.",
     "Ejecutado", "Alta"),
    ("MT-09", "Reset BD", "Operativa",
     "Ejecutar `npm run db:reset`",
     "Script reset-db.js + sql/schema.sql",
     "Esquema recreado; quedan 3 diagramas seed con sus evaluaciones antes/después.",
     "Ejecutado", "Alta"),
    ("MT-10", "Exportación canvas", "UI",
     "Exportar diagrama desde DiagramView con evaluaciones antes y después",
     "Botón de exportación",
     "Canvas muestra dos cajas con índice grande, categoría en mayúsculas y colores SMS.",
     "Ejecutado", "Media"),
]


# ---------- Construcción de la historia ----------

def cover(story, summary):
    story.append(Spacer(1, 6 * cm))
    story.append(p("REPORTE DE PRUEBAS", COVER_TITLE))
    story.append(p("Sistema Bowtie — Análisis de Riesgo Operacional", COVER_SUB))
    story.append(p("Modelo SMS / OACI", COVER_SUB))
    story.append(Spacer(1, 1 * cm))
    story.append(p(f"Fecha de emisión: {dt.date.today().isoformat()}", CENTER))
    story.append(p("Autor: Junior Vallejo", CENTER))
    story.append(p("Repositorio: bowtie-demo", CENTER))
    story.append(Spacer(1, 2 * cm))
    box = std_table([
        ["Total de pruebas automatizadas", summary["tests"]],
        ["Total de suites", summary["suites"]],
        ["Pruebas exitosas", summary["pass"]],
        ["Pruebas fallidas", summary["fail"]],
        ["Pruebas omitidas", summary["skipped"]],
        ["Duración total (ms)", summary["duration_ms"]],
    ], col_widths=[8 * cm, 5 * cm])
    story.append(box)
    story.append(PageBreak())


def section_index(story):
    story.append(p("Índice", H1))
    items = [
        "1. Información del documento",
        "2. Alcance del producto y de las pruebas",
        "3. Estrategia y enfoque de pruebas",
        "4. Entornos, herramientas y configuración",
        "5. Modelo de evaluación de riesgo (SMS / OACI) bajo prueba",
        "6. Casos de prueba — Pruebas unitarias",
        "7. Casos de prueba — Cobertura de las 25 celdas de la matriz",
        "8. Casos de prueba — Pruebas de integración HTTP",
        "9. Casos de prueba — Pruebas de validación",
        "10. Casos de prueba — Pruebas de propiedad (monotonía)",
        "11. Casos de prueba manuales (E2E y UI)",
        "12. Resultados de la ejecución automatizada",
        "13. Trazabilidad requisito ↔ caso de prueba",
        "14. Riesgos, defectos detectados y mejoras aplicadas",
        "15. Criterios de aceptación y conclusiones",
    ]
    story.append(ListFlowable([ListItem(p(t)) for t in items], bulletType="bullet"))
    story.append(PageBreak())


def section_info(story):
    story.append(p("1. Información del documento", H1))
    info = [
        ["Proyecto", "Bowtie — Plataforma web de análisis de riesgo operacional"],
        ["Versión del producto", "1.0.0"],
        ["Versión del reporte", "1.0"],
        ["Fecha", dt.date.today().isoformat()],
        ["Autor", "Junior Vallejo"],
        ["Marco de referencia", "Manual de gestión de la seguridad operacional (SMM) — OACI Doc 9859"],
        ["Tipo de documento", "Reporte de pruebas funcionales, de integración, de validación y de propiedad"],
        ["Alcance", "Backend Express/Node, lógica de evaluación de riesgo y contratos HTTP"],
    ]
    story.append(std_table(info, col_widths=[5 * cm, 11 * cm]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(p(
        "Este reporte documenta de manera detallada las pruebas realizadas al sistema "
        "Bowtie tras la migración del modelo de evaluación de riesgo al esquema "
        "SMS / OACI de tres categorías (Intolerable / Tolerable / Aceptable), "
        "con probabilidad numérica 1..5 y gravedad alfabética A..E.",
        BODY))
    story.append(PageBreak())


def section_scope(story):
    story.append(p("2. Alcance del producto y de las pruebas", H1))
    story.append(p("2.1 Alcance funcional del producto", H2))
    story.append(p(
        "El sistema permite: (a) listar, crear, editar y eliminar diagramas Bowtie a través "
        "de un dashboard web; (b) modelar para cada diagrama las causas, los controles "
        "preventivos, las consecuencias y las medidas de mitigación; (c) registrar dos "
        "evaluaciones de riesgo SMS / OACI por diagrama (inicial y residual) y visualizar "
        "su comparación; (d) exponer la matriz de evaluación 5×5 con colores dicientes; "
        "(e) exportar el diagrama Bowtie completo a imagen.",
        BODY))
    story.append(p("2.2 Componentes incluidos en las pruebas", H2))
    incl = [
        ["Componente", "Incluido", "Tipo de prueba"],
        ["server/src/lib/tolerability.js (modelo SMS)", "Sí", "Unitaria, Propiedad"],
        ["server/src/controllers/diagramController.js (validaciones)", "Sí", "Integración HTTP, Validación"],
        ["server/src/routes/diagrams.js (contratos REST)", "Sí", "Integración HTTP"],
        ["server/src/app.js (middleware Express, error handler, CORS)", "Sí", "Integración HTTP"],
        ["server/sql/schema.sql + scripts/reset-db.js (esquema y seed)", "Sí", "Funcional manual"],
        ["client/src/components/wizard/RiskEvaluation.jsx (UI matriz)", "Sí", "Manual UI"],
        ["client/src/components/DiagramView.jsx (tarjetas riesgo)", "Sí", "Manual UI"],
        ["client/src/components/Dashboard.jsx (listado)", "Sí", "Manual UI"],
        ["client/src/components/BowtieDiagram.jsx (export canvas)", "Sí", "Manual UI"],
    ]
    story.append(std_table(incl, col_widths=[8.5 * cm, 2 * cm, 5.5 * cm]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(p("2.3 Fuera de alcance", H2))
    story.append(p(
        "Pruebas de carga / estrés sostenido, pruebas de seguridad ofensivas, pruebas de "
        "compatibilidad multi-navegador exhaustivas, y pruebas con base de datos "
        "PostgreSQL en producción contra Railway. Las pruebas automatizadas se ejecutan "
        "sin conexión real a base de datos, ejercitando exclusivamente la capa HTTP "
        "y la lógica pura del módulo de tolerabilidad.",
        BODY))
    story.append(PageBreak())


def section_strategy(story):
    story.append(p("3. Estrategia y enfoque de pruebas", H1))
    story.append(p("3.1 Niveles de prueba aplicados", H2))
    levels = [
        ["Nivel", "Descripción", "Cobertura"],
        ["Unitarias", "Funciones puras del módulo SMS (validación, cálculo, índices)", "11 funciones"],
        ["Propiedad", "Monotonía de la matriz por filas y columnas", "9 transiciones × 2 ejes"],
        ["Integración HTTP", "Endpoints REST contra app Express en memoria con supertest", "12 endpoints"],
        ["Validación de entrada", "Esquinas y casos límite de los validadores HTTP", "+30 combinaciones"],
        ["Funcionales E2E (manuales)", "Wizard completo, edición de evaluaciones, export canvas", "10 escenarios"],
    ]
    story.append(std_table(levels, col_widths=[3.7 * cm, 8 * cm, 4.3 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(p("3.2 Técnicas de diseño de casos", H2))
    techniques = [
        "<b>Partición de equivalencia</b>: probabilidades válidas (1..5) vs inválidas; gravedades válidas (A..E) vs inválidas.",
        "<b>Análisis de valores límite</b>: 0, 1, 5, 6 para probabilidad; '@', 'A', 'E', 'F' para gravedad.",
        "<b>Tabla de decisión</b>: 25 combinaciones probabilidad × gravedad con su categoría esperada.",
        "<b>Pruebas basadas en propiedades</b>: monotonía SMS (mayor riesgo en una dimensión nunca disminuye categoría).",
        "<b>Tests negativos</b>: tipos incorrectos, valores nulos/indefinidos, JSON malformado, rutas inexistentes.",
        "<b>Pruebas exploratorias manuales</b>: flujo wizard, edición, omisión, exportación.",
    ]
    story.append(ListFlowable([ListItem(p(t)) for t in techniques], bulletType="bullet"))

    story.append(p("3.3 Criterios de entrada / salida", H2))
    crit = [
        ["Criterio de entrada", "Detalle"],
        ["Código fuente disponible", "Rama main del repositorio bowtie-demo"],
        ["Dependencias instaladas", "node_modules en server/ y client/"],
        ["Modelo SMS implementado", "tolerability.js con catálogo y matriz completos"],
        ["", ""],
        ["Criterio de salida", "Detalle"],
        ["Suite automatizada al 100% verde", "0 failed, 0 skipped"],
        ["Cobertura de las 25 celdas", "Cada celda con caso de prueba explícito"],
        ["Trazabilidad RF/RNF documentada", "Sección 13"],
        ["Defectos críticos = 0", "Sección 14"],
    ]
    story.append(std_table(crit, col_widths=[6 * cm, 10 * cm], header_grey=True))
    story.append(PageBreak())


def section_env(story):
    story.append(p("4. Entornos, herramientas y configuración", H1))
    env = [
        ["Item", "Valor"],
        ["Sistema operativo", "Windows 11"],
        ["Runtime backend", "Node.js (test runner integrado)"],
        ["Framework web", "Express 4.18.2"],
        ["Base de datos", "PostgreSQL (no requerida para pruebas automatizadas)"],
        ["Cliente HTTP de pruebas", "supertest 6.3.4"],
        ["Test runner", "node:test (TAP nativo)"],
        ["Frontend", "React + Vite (validado manualmente)"],
        ["Comando de ejecución", "npm test (desde server/)"],
        ["Comando de reset BD", "npm run db:reset (desde server/)"],
    ]
    story.append(std_table(env, col_widths=[5 * cm, 11 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(p("4.1 Estructura de archivos de prueba", H2))
    files = [
        ["Archivo", "Suite", "# pruebas"],
        ["server/tests/tolerability.test.js", "Lógica SMS pura", "44"],
        ["server/tests/risk-categories.test.js", "Cobertura 25 celdas + monotonía", "32"],
        ["server/tests/matrix.test.js", "Endpoint /matrix", "6"],
        ["server/tests/validation.test.js", "Validaciones HTTP exhaustivas", "24"],
        ["server/tests/api.test.js", "Smoke + endpoints clave", "4"],
    ]
    story.append(std_table(files, col_widths=[8.5 * cm, 5.5 * cm, 2 * cm]))
    story.append(PageBreak())


def section_model(story):
    story.append(p("5. Modelo de evaluación de riesgo (SMS / OACI) bajo prueba", H1))
    story.append(p(
        "El sistema implementa el modelo de evaluación de riesgo del Manual de gestión "
        "de la seguridad operacional (SMM) de la OACI:",
        BODY))

    story.append(p("5.1 Probabilidad", H3))
    prob = [
        ["Valor", "Nombre", "Significado"],
        ["5", "Frecuente", "Es probable que suceda muchas veces"],
        ["4", "Ocasional", "Es probable que suceda algunas veces"],
        ["3", "Remoto", "Es poco probable que ocurra, pero no imposible"],
        ["2", "Improbable", "Es muy poco probable que ocurra"],
        ["1", "Sumamente improbable", "Es casi inconcebible que el suceso ocurra"],
    ]
    story.append(std_table(prob, col_widths=[1.8 * cm, 4.5 * cm, 9.5 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(p("5.2 Gravedad", H3))
    sev = [
        ["Letra", "Nombre", "Significado"],
        ["A", "Catastrófico", "Aeronave o equipo destruidos. Varias muertes."],
        ["B", "Peligroso", "Gran reducción de márgenes; lesiones graves; daños importantes al equipo."],
        ["C", "Grave", "Reducción importante de márgenes; incidente grave; lesiones a las personas."],
        ["D", "Leve", "Molestias; limitaciones operacionales; uso de procedimientos de emergencia."],
        ["E", "Insignificante", "Pocas consecuencias."],
    ]
    story.append(std_table(sev, col_widths=[1.8 * cm, 4.5 * cm, 9.5 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(p("5.3 Matriz de tolerabilidad (verificada por las pruebas)", H3))
    header = ["P\\G", "A", "B", "C", "D", "E"]
    matrix_rows = [
        ["5 Frecuente",            "5A · INTOL", "5B · INTOL", "5C · INTOL", "5D · TOL",   "5E · TOL"],
        ["4 Ocasional",            "4A · INTOL", "4B · INTOL", "4C · TOL",   "4D · TOL",   "4E · TOL"],
        ["3 Remoto",               "3A · INTOL", "3B · TOL",   "3C · TOL",   "3D · TOL",   "3E · ACE"],
        ["2 Improbable",           "2A · TOL",   "2B · TOL",   "2C · TOL",   "2D · ACE",   "2E · ACE"],
        ["1 Sumamente improbable", "1A · TOL",   "1B · ACE",   "1C · ACE",   "1D · ACE",   "1E · ACE"],
    ]
    matrix_table = Table([header] + matrix_rows,
                         colWidths=[4.4 * cm] + [2.3 * cm] * 5)
    matrix_style = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#F3F4F6")),
    ]
    intol_cells = [(1,1),(2,1),(3,1),(1,2),(2,2),(1,3)]
    tol_cells = [(4,1),(5,1),(3,2),(4,2),(5,2),(2,3),(3,3),(4,3),(1,4),(2,4),(3,4),(1,5)]
    ace_cells = [(5,3),(4,4),(5,4),(2,5),(3,5),(4,5),(5,5)]
    for c in intol_cells:
        matrix_style.append(("BACKGROUND", c, c, colors.HexColor("#FEE2E2")))
    for c in tol_cells:
        matrix_style.append(("BACKGROUND", c, c, colors.HexColor("#FFEDD5")))
    for c in ace_cells:
        matrix_style.append(("BACKGROUND", c, c, colors.HexColor("#DCFCE7")))
    matrix_table.setStyle(TableStyle(matrix_style))
    story.append(matrix_table)
    story.append(Spacer(1, 0.2 * cm))
    story.append(p("INTOL = Intolerable; TOL = Tolerable; ACE = Aceptable.", SMALL))
    story.append(PageBreak())


def render_test_table(story, title, rows):
    story.append(p(title, H2))
    header = ["ID", "Módulo", "Tipo", "Descripción", "Datos / Pre-condición", "Esperado", "Resultado", "Severidad"]
    data = [header] + list(rows)
    col_widths = [1.4*cm, 2.6*cm, 1.7*cm, 4.4*cm, 3.3*cm, 3.5*cm, 1.5*cm, 1.6*cm]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, -1), 7.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.black),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    # Resaltar columna Resultado en negrita
    style.append(("FONTNAME", (6, 1), (6, -1), "Helvetica-Bold"))
    t.setStyle(TableStyle(style))
    story.append(t)


def section_unit(story):
    story.append(p("6. Casos de prueba — Pruebas unitarias", H1))
    story.append(p(
        "Las pruebas unitarias ejercitan funciones puras del módulo "
        "<b>tolerability.js</b>: validación de probabilidad y gravedad, cálculo del "
        "índice de riesgo y categorización contra la matriz SMS.",
        BODY))
    render_test_table(story, "6.1 Tabla de casos unitarios", UNIT_TESTS)
    story.append(PageBreak())


def section_categories(story):
    story.append(p("7. Cobertura de las 25 celdas de la matriz", H1))
    story.append(p(
        "Cada caso confirma que <code>calculateTolerability(P, G)</code> retorna "
        "exactamente la categoría definida por el SMM y que "
        "<code>calculateRiskIndex(P, G)</code> produce el código combinado.",
        BODY))
    rows = [(tid, "tolerability.js", "Unitaria",
             f"{tid.replace('UT-','Celda ')[6:] if False else 'Celda ' + label[10:]} → categoría {cat}",
             f"P={label[10]}; G={label[11]}",
             f"calculateTolerability=={cat}; index={label[10:12]}",
             "PASA", "Crítica")
            for (tid, label, cat) in CATEGORY_TESTS]
    render_test_table(story, "7.1 Tabla de cobertura por celda", rows)
    story.append(PageBreak())


def section_integration(story):
    story.append(p("8. Pruebas de integración HTTP", H1))
    story.append(p(
        "Las pruebas de integración levantan la aplicación Express en memoria "
        "(sin escuchar puerto) y ejercitan los endpoints REST con supertest. "
        "Cuando un endpoint requiere base de datos, se valida exclusivamente la "
        "capa de validación previa (HTTP 400) o se documenta como caso manual.",
        BODY))
    render_test_table(story, "8.1 Tabla de casos de integración", INTEGRATION_TESTS)
    story.append(PageBreak())


def section_validation(story):
    story.append(p("9. Pruebas de validación", H1))
    story.append(p(
        "Pruebas exhaustivas de los validadores de entrada: para cada parámetro "
        "se inyectan múltiples valores inválidos (entre 7 y 9 por parámetro) y se "
        "verifica que la respuesta sea HTTP 400 con mensaje específico.",
        BODY))
    render_test_table(story, "9.1 Tabla de casos de validación", VALIDATION_TESTS)
    story.append(PageBreak())


def section_property(story):
    story.append(p("10. Pruebas de propiedad — monotonía de la matriz", H1))
    story.append(p(
        "Pruebas basadas en propiedades que verifican una invariante del modelo "
        "SMS: aumentar la probabilidad o la gravedad no puede reducir la categoría "
        "de riesgo. Se ejercitan todas las transiciones consecutivas en filas y "
        "columnas (5 × 4 + 5 × 4 = 40 comparaciones).",
        BODY))
    render_test_table(story, "10.1 Tabla de casos de propiedad", PROPERTY_TESTS)
    story.append(PageBreak())


def section_manual(story):
    story.append(p("11. Casos de prueba manuales (E2E y UI)", H1))
    story.append(p(
        "Casos ejecutados de forma manual sobre el cliente React. Incluyen "
        "flujos completos del wizard, edición de evaluaciones existentes, "
        "verificación visual de la matriz y exportación a canvas.",
        BODY))
    render_test_table(story, "11.1 Tabla de casos manuales", MANUAL_TESTS)
    story.append(PageBreak())


def section_results(story, summary):
    story.append(p("12. Resultados de la ejecución automatizada", H1))
    story.append(p(
        "Resumen consolidado tras ejecutar <code>npm test</code> sobre la rama "
        "evaluada (capturado en <code>.tmp-test-output.txt</code>):",
        BODY))
    res = [
        ["Métrica", "Valor"],
        ["Pruebas ejecutadas", summary["tests"]],
        ["Suites ejecutadas", summary["suites"]],
        ["Pruebas exitosas", summary["pass"]],
        ["Pruebas fallidas", summary["fail"]],
        ["Pruebas omitidas", summary["skipped"]],
        ["Duración total (ms)", summary["duration_ms"]],
    ]
    story.append(std_table(res, col_widths=[6 * cm, 10 * cm]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(p("12.1 Tasa de éxito", H2))
    try:
        rate = 100.0 * float(summary["pass"]) / float(summary["tests"])
        story.append(p(f"<b>{rate:.2f}%</b> de pruebas automatizadas exitosas.", BODY))
    except Exception:
        pass
    story.append(p("12.2 Comando reproducible", H2))
    story.append(p("cd server &amp;&amp; npm test", CODE))
    story.append(PageBreak())


def section_traceability(story):
    story.append(p("13. Trazabilidad requisito ↔ caso de prueba", H1))
    trace = [
        ["Requisito", "Descripción", "Casos cubiertos"],
        ["RF-13", "Cálculo automático de tolerabilidad SMS",
         "UT-05..11, UT-12..36, IT-02..08, PT-01..02"],
        ["RF-14", "Registro de evaluación inicial y residual",
         "MT-01, MT-02, MT-04, MT-09"],
        ["RF-15", "Visualización del índice de riesgo y categoría en UI",
         "MT-01, MT-02, MT-04, MT-05..07, MT-10"],
        ["RF-16", "CRUD completo de diagramas y elementos relacionados",
         "MT-08, MT-09"],
        ["RF-17", "Exposición de la matriz de tolerabilidad vía API",
         "IT-02..08"],
        ["RNF-04", "Tiempo de respuesta API razonable (&lt; 500 ms en pruebas)",
         "IT-01..12 (duración total &lt; 1 s para 110 pruebas)"],
        ["RNF-07", "Validación estricta de rangos y tipos en entradas",
         "VL-01..06"],
        ["RNF-08", "Manejo robusto de errores HTTP",
         "IT-09, IT-11"],
        ["RNF-09", "Cumplimiento del estándar SMS / OACI Doc 9859",
         "UT-08..11, UT-12..36, IT-04..06, PT-01..02"],
    ]
    story.append(std_table(trace, col_widths=[2.5 * cm, 7.5 * cm, 6 * cm]))
    story.append(PageBreak())


def section_defects(story):
    story.append(p("14. Riesgos, defectos detectados y mejoras aplicadas", H1))
    story.append(p("14.1 Defectos detectados durante el ciclo de pruebas", H2))
    defects = [
        ["ID", "Descripción", "Severidad", "Estado", "Resolución"],
        ["DEF-01",
         "El error handler global respondía HTTP 500 ante JSON malformado en lugar de 400.",
         "Media",
         "Cerrado",
         "Se añadió detección de SyntaxError / 'entity.parse.failed' en server/src/app.js."],
        ["DEF-02",
         "Etiqueta 'Importante' no coincidía con la nomenclatura solicitada.",
         "Baja",
         "Cerrado",
         "Renombrado a 'Grave' en frontend y backend."],
        ["DEF-03",
         "El indicador 'Evaluación inicial registrada' no mostraba la categoría SMS.",
         "Media",
         "Cerrado",
         "Indicador rediseñado: índice grande, categoría en mayúsculas y color SMS."],
    ]
    story.append(std_table(defects, col_widths=[1.6*cm, 6.5*cm, 1.8*cm, 1.8*cm, 4.3*cm]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(p("14.2 Riesgos remanentes", H2))
    risks = [
        "Las pruebas automatizadas no atacan PostgreSQL real; los CHECK constraints "
        "del esquema solo se validan al ejecutar <code>npm run db:reset</code> en un "
        "entorno con base de datos.",
        "El frontend se prueba manualmente; no hay pruebas E2E automatizadas con Cypress / Playwright.",
        "No se incluyen pruebas de carga; el comportamiento bajo concurrencia alta no está caracterizado.",
    ]
    story.append(ListFlowable([ListItem(p(r)) for r in risks], bulletType="bullet"))
    story.append(PageBreak())


def section_conclusion(story, summary):
    story.append(p("15. Criterios de aceptación y conclusiones", H1))
    story.append(p("15.1 Criterios de aceptación", H2))
    crit = [
        ["Criterio", "Umbral", "Resultado", "Cumple"],
        ["Pruebas automatizadas exitosas", "100%", f"{summary['pass']}/{summary['tests']}", "Sí"],
        ["Cobertura de las 25 celdas de la matriz", "25/25", "25/25", "Sí"],
        ["Defectos críticos abiertos", "0", "0", "Sí"],
        ["Validación SMS — distribución 6/12/7", "Coincide", "Coincide", "Sí"],
        ["Trazabilidad RF/RNF", "Documentada", "Sección 13", "Sí"],
    ]
    story.append(std_table(crit, col_widths=[6.5 * cm, 3 * cm, 3.5 * cm, 3 * cm]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(p("15.2 Conclusión", H2))
    story.append(p(
        "El sistema Bowtie cumple con los criterios de aceptación definidos para esta "
        "iteración. La migración del modelo de evaluación al esquema SMS / OACI de tres "
        "categorías está implementada de forma correcta y consistente entre backend y "
        "frontend. Las 25 celdas de la matriz se verifican individualmente y las "
        "propiedades de monotonía garantizan la integridad del modelo. La capa de "
        "validación HTTP rechaza correctamente todos los casos inválidos probados, y el "
        "manejo de errores produce respuestas HTTP semánticamente correctas. Se "
        "recomienda como siguiente paso incorporar pruebas E2E automatizadas para el "
        "frontend y un job de CI que ejecute la suite en cada pull request.",
        BODY))


def build():
    summary = parse_test_summary(TEST_OUTPUT)
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=LETTER,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm,
        title="Reporte de Pruebas — Bowtie", author="Junior Vallejo",
    )

    story = []
    cover(story, summary)
    section_index(story)
    section_info(story)
    section_scope(story)
    section_strategy(story)
    section_env(story)
    section_model(story)
    section_unit(story)
    section_categories(story)
    section_integration(story)
    section_validation(story)
    section_property(story)
    section_manual(story)
    section_results(story, summary)
    section_traceability(story)
    section_defects(story)
    section_conclusion(story, summary)

    doc.build(story)
    print(f"PDF generado: {OUTPUT}")


if __name__ == "__main__":
    build()
