# 1. Introducción

## 1.1 Propósito

El presente documento expone el desarrollo de ingeniería del sistema **Bowtie**,
una aplicación web destinada a la creación, gestión y visualización de
diagramas de análisis de riesgos según la metodología Bowtie. Su propósito es
servir como referencia técnica completa de la solución implementada,
documentando sus requisitos, arquitectura, modelos, casos de uso y plan de
despliegue.

## 1.2 Antecedentes

El análisis de riesgos es una práctica esencial en industrias críticas tales
como aviación, energía, salud, banca y centros de procesamiento de datos. La
**metodología Bowtie**, formalizada por la industria del petróleo y gas a
finales del siglo XX y posteriormente adoptada por la OACI, ICAO y la norma
ISO 31000, proporciona un marco visual para representar:

- **Causas** (amenazas que pueden detonar un evento no deseado).
- **Evento Tope** (situación crítica a evitar).
- **Consecuencias** (impactos derivados del evento).
- **Controles Preventivos** (barreras antes del evento).
- **Medidas de Mitigación** (barreras posteriores al evento).
- **Factores de Escalamiento** (debilidades de los propios controles).

A pesar de su utilidad, las herramientas existentes para construir estos
diagramas son frecuentemente costosas o limitadas a software de escritorio. La
solución propuesta busca democratizar el acceso a esta metodología a través
de una aplicación web ligera, gratuita y desplegable en la nube.

## 1.3 Objetivo General

Desarrollar una aplicación web que permita a un analista de riesgos crear,
editar, visualizar y exportar diagramas Bowtie con soporte para evaluación
cuantitativa del riesgo bajo el modelo de matriz **5×5 SMS** (Safety
Management System).

## 1.4 Objetivos Específicos

1. Implementar un asistente paso a paso (*wizard*) que guíe al usuario en la
   construcción de un diagrama Bowtie completo.
2. Diseñar una visualización interactiva del diagrama con capacidad de
   exportación en formatos PDF y SVG.
3. Persistir los diagramas en una base de datos relacional con integridad
   referencial.
4. Incorporar un módulo de evaluación de riesgo *antes* y *después* de la
   aplicación de controles, calculando automáticamente la tolerabilidad.
5. Soportar factores de escalamiento sobre controles y mitigaciones.
6. Desplegar la solución en una plataforma en la nube (Railway).

## 1.5 Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Bowtie** | Diagrama en forma de corbatín que representa la relación entre causas, evento tope y consecuencias. |
| **Evento Tope** *(Top Event)* | Suceso central no deseado del análisis de riesgos. |
| **Causa** *(Threat)* | Condición o acontecimiento que puede dar origen al evento tope. |
| **Consecuencia** | Impacto derivado de la materialización del evento tope. |
| **Control Preventivo** | Barrera diseñada para evitar que la causa active el evento tope. |
| **Mitigación** | Barrera diseñada para reducir el impacto de una consecuencia. |
| **Factor de Escalamiento** | Condición que debilita un control o una mitigación. |
| **Tolerabilidad** | Clasificación del nivel de riesgo: Aceptable, Tolerable, Intolerable, Inaceptable. |
| **SMS** | Safety Management System, sistema de gestión de seguridad operacional. |
| **CRUD** | Acrónimo de las operaciones Create, Read, Update, Delete. |
| **SPA** | Single Page Application, aplicación web de una sola página. |
| **API REST** | Interfaz de programación basada en el estilo arquitectónico REST. |

## 1.6 Audiencia

| Rol | Uso del documento |
|-----|--------------------|
| Desarrolladores | Comprender la arquitectura, modelos y reglas de negocio. |
| Evaluadores académicos | Verificar el cumplimiento de los entregables de ingeniería. |
| Personal de despliegue | Configurar y desplegar el sistema en Railway. |
| Usuarios finales | Consultar manuales y ejemplos de uso. |
