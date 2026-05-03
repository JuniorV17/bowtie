# Pruebas

Carpeta dedicada al reporte profesional de pruebas del sistema **Bowtie**.

## Contenido

- **`Reporte-Pruebas.pdf`** — Reporte detallado de pruebas (15 secciones, ~20 páginas).
  Incluye estrategia, casos unitarios, cobertura de las 25 celdas de la matriz SMS,
  pruebas de integración HTTP, validaciones, pruebas de propiedad, casos manuales E2E,
  trazabilidad RF/RNF, defectos detectados y conclusiones.
- **`generate_report.py`** — Script reproducible que genera el PDF a partir de la
  ejecución más reciente de `npm test`.

## Ejecutar la suite y regenerar el reporte

Desde la raíz del proyecto:

```bash
# 1. Ejecutar todas las pruebas y guardar el resumen TAP
cd server
npm test > ../.tmp-test-output.txt 2>&1

# 2. Volver a la raíz y regenerar el PDF
cd ..
python Pruebas/generate_report.py
```

## Resumen de la suite automatizada

| Archivo                                | Suite                                  | # pruebas |
| -------------------------------------- | -------------------------------------- | --------- |
| `server/tests/tolerability.test.js`    | Lógica SMS pura                        | 44        |
| `server/tests/risk-categories.test.js` | Cobertura 25 celdas + monotonía        | 32        |
| `server/tests/matrix.test.js`          | Endpoint `/api/diagrams/matrix`        | 6         |
| `server/tests/validation.test.js`      | Validaciones HTTP exhaustivas          | 24        |
| `server/tests/api.test.js`             | Smoke + endpoints clave                | 4         |
| **Total**                              |                                        | **110**   |
