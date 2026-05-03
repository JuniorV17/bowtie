# 1. Requisitos

Esta fase contiene el levantamiento de requerimientos del Sistema Bowtie.

## Entregable

| Archivo | Descripción |
|---------|-------------|
| [Matriz-Requisitos.xlsx](Matriz-Requisitos.xlsx) | Matriz de requisitos funcionales (RF) y no funcionales (RNF) en formato Excel. |

La matriz contiene dos hojas:

- **Funcionales** — 17 requisitos funcionales (RF-01 a RF-17) con descripción,
  categoría, prioridad, origen, criterio de aceptación y estado actual.
- **No Funcionales** — 14 requisitos no funcionales (RNF-01 a RNF-14)
  organizados por rendimiento, disponibilidad, seguridad, usabilidad,
  mantenibilidad y portabilidad, con métrica de verificación asociada.

## Resumen del alcance

El sistema Bowtie es una aplicación web para el **análisis estructurado de
riesgos** mediante diagramas Bowtie. Permite construir, visualizar, evaluar
y exportar diagramas de riesgo bajo el modelo SMS 5×5 (probabilidad ×
gravedad).

Los actores principales son:

- **Analista de Riesgos** — usuario final que crea y evalúa diagramas.

## Trazabilidad

Los identificadores RF-XX y RNF-XX se referencian desde:

- Casos de uso (ver [`2-Diseño/Casos-de-Uso.md`](../2-Diseño/Casos-de-Uso.md))
- Plan de pruebas (ver [`4-Pruebas/Plan-Pruebas.md`](../4-Pruebas/Plan-Pruebas.md))
