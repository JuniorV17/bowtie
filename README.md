# Sistema Bowtie

> Aplicación web para el **análisis estructurado de riesgos** mediante
> diagramas Bowtie. Permite construir, evaluar, visualizar y exportar
> análisis de riesgo bajo el modelo **SMS 5×5** (probabilidad × gravedad).

---

## Tabla de contenidos

1. [Sobre el proyecto](#sobre-el-proyecto)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Stack tecnológico](#stack-tecnológico)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Instalación local](#instalación-local)
7. [Scripts](#scripts)
8. [API REST](#api-rest)
9. [Pruebas](#pruebas)
10. [Despliegue](#despliegue)
11. [Documentación de ingeniería](#documentación-de-ingeniería)
12. [Seguridad](#seguridad)
13. [Licencia](#licencia)

---

## Sobre el proyecto

Un **diagrama Bowtie** es una técnica visual de análisis de riesgo en
forma de moño: a la izquierda se modelan las **causas** y los **controles
preventivos**; en el centro, el **evento tope**; a la derecha, las
**consecuencias** y las **mitigaciones**.

Este sistema acompaña al *Analista de Riesgos* a lo largo de todo el
ciclo: construcción del diagrama mediante un asistente de cinco pasos,
evaluación cuantitativa antes y después de los controles, exportación
para informes y persistencia centralizada.

## Características

- Asistente de cinco pasos para construir un diagrama Bowtie completo.
- Visualización gráfica con conexiones tipo Bezier.
- Evaluación de riesgo *antes* y *después* de aplicar controles.
- Cálculo automático de tolerabilidad — Aceptable, Tolerable, Intolerable, Inaceptable — bajo matriz **SMS 5×5**.
- Soporte de **factores de escalamiento** sobre controles y mitigaciones.
- Exportación a **PDF** y **SVG** desde la vista de cualquier diagrama.
- API REST documentada con validación de entrada y transacciones atómicas.
- Pruebas unitarias y de integración con **node:test** + **supertest**.
- Despliegue continuo en **Railway** con sonda de salud y reinicio automático.

## Arquitectura

```
┌─────────────┐  HTTP / JSON  ┌─────────────┐    SQL    ┌──────────────┐
│  Frontend   │ ◀───────────▶ │   Backend   │ ◀───────▶ │  PostgreSQL  │
│ React + Vite│               │   Express   │           │  (Railway)   │
└─────────────┘               └─────────────┘           └──────────────┘
```

- **Frontend** (SPA): vistas, asistente, visualización del diagrama y
  motor de exportación.
- **Backend** (API REST): lógica de evaluación, validación de entrada,
  acceso a datos y servidor de estáticos en producción.
- **Base de datos**: persistencia relacional con integridad referencial
  e integridad de cascada al eliminar diagramas.

Los diagramas formales (componentes, flujo, ER, despliegue) están en
[`Documentación/`](Documentación/).

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 18, Vite 5, React Router 6, Axios, jsPDF, html2canvas |
| Backend | Node.js 18+, Express 4, node-postgres |
| Base de datos | PostgreSQL 14+ (gestionado por Railway) |
| Pruebas | `node:test` (built-in), supertest |
| Despliegue | Railway (Nixpacks) |

## Estructura del repositorio

```
bowtie/
├── client/                     # Frontend React + Vite
│   └── src/
│       ├── components/         # Componentes reutilizables
│       └── services/           # Capa Axios (API)
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/             # Endpoints REST
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── lib/                # Lógica pura testeable (matriz 5×5)
│   │   ├── db/                 # Pool de conexiones
│   │   ├── app.js              # Factory de Express (testeable)
│   │   └── index.js            # Bootstrap del servidor
│   └── tests/                  # Pruebas unitarias e integración
├── Documentación/              # Documentación SDLC (PDF + Excel)
├── railway.json                # Configuración Railway
├── nixpacks.toml               # Fases Nixpacks
├── Procfile                    # Compatibilidad con buildpacks
└── package.json                # Scripts orquestadores
```

## Instalación local

**Requisitos:** Node.js 18+, npm 9+, PostgreSQL 14+ accesible localmente.

```bash
git clone https://github.com/JuniorV17/bowtie.git
cd bowtie

# Instalar dependencias en raíz, server y client
npm run install:all

# Configurar variables de entorno del servidor
cp server/.env.example server/.env
# Editar server/.env con las credenciales locales

# Levantar cliente y servidor en paralelo
npm run dev
```

- Cliente: <http://localhost:5173>
- Servidor: <http://localhost:3001>

> El esquema SQL **no está versionado** en este repositorio (vive en la
> base de datos administrada por Railway). Para desarrollo local
> contacte al equipo de operaciones para obtener el script de
> inicialización.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta cliente y servidor en paralelo. |
| `npm run server` | Solo el backend en modo watch. |
| `npm run client` | Solo el frontend con HMR. |
| `npm run build` | Construye el bundle del cliente. |
| `npm start` | Inicia el servidor en modo producción. |
| `npm test` | Ejecuta las pruebas del backend (TAP). |

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del servicio (sonda de salud). |
| `GET` | `/api/diagrams` | Lista resumida de diagramas. |
| `GET` | `/api/diagrams/matrix` | Matriz de tolerabilidad y catálogos. |
| `GET` | `/api/diagrams/:id` | Diagrama completo con relaciones. |
| `POST` | `/api/diagrams` | Crear diagrama (transacción). |
| `PUT` | `/api/diagrams/:id` | Actualizar diagrama (transacción). |
| `DELETE` | `/api/diagrams/:id` | Eliminar diagrama (cascada). |
| `POST` | `/api/diagrams/:id/evaluations` | Registrar evaluación de riesgo. |
| `GET` | `/api/diagrams/:id/evaluations` | Listar evaluaciones. |
| `POST` | `/api/diagrams/controls/:id/escalations` | Crear factor de escalamiento (control). |
| `POST` | `/api/diagrams/mitigations/:id/escalations` | Crear factor de escalamiento (mitigación). |

El catálogo completo está documentado en
[`Documentación/3-Desarrollo/Documentacion-Desarrollo.pdf`](Documentación/3-Desarrollo/Documentacion-Desarrollo.pdf).

## Pruebas

El backend cuenta con **26 pruebas automatizadas**:

| Tipo | Archivo | Casos | Cubre |
|------|---------|-------|-------|
| Unitarias | [`server/tests/tolerability.test.js`](server/tests/tolerability.test.js) | 12 | Matriz 5×5, validación de rangos, cálculo de tolerabilidad. |
| Integración HTTP | [`server/tests/api.test.js`](server/tests/api.test.js) | 8 | Contrato REST, validación de entrada, códigos de respuesta. |

Ejecución:

```bash
npm test
```

Reporte:

```
# tests   26
# pass    26
# fail    0
```

Detalle del plan formal en
[`Documentación/4-Pruebas/Plan-Pruebas.pdf`](Documentación/4-Pruebas/Plan-Pruebas.pdf).

## Despliegue

El sistema está desplegado en **Railway** como dos servicios
independientes:

- **Servicio Web** — backend Express + bundle estático del cliente.
- **PostgreSQL** — plugin gestionado que provee `DATABASE_URL`.

Variables de entorno relevantes:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL (TLS) inyectada por Railway. |
| `PORT` | Puerto sobre el que escucha el servidor (provisto por Railway). |
| `NODE_ENV` | `production` activa el servidor de estáticos. |

Topología completa en
[`Documentación/5-Despliegue/Despliegue-Railway.pdf`](Documentación/5-Despliegue/Despliegue-Railway.pdf).

## Documentación de ingeniería

La documentación está organizada por **fase del Ciclo de Desarrollo de
Software** en [`Documentación/`](Documentación/):

| Fase | Entregable |
|------|------------|
| 1. Requisitos | [`Matriz-Requisitos.xlsx`](Documentación/1-Requisitos/Matriz-Requisitos.xlsx) — funcionales (RF) y no funcionales (RNF) |
| 2. Diseño | [`Casos-de-Uso.pdf`](Documentación/2-Diseño/Casos-de-Uso.pdf), [`Componentes.pdf`](Documentación/2-Diseño/Componentes.pdf), [`Logica-Flujo.pdf`](Documentación/2-Diseño/Logica-Flujo.pdf), [`Modelo-ER.pdf`](Documentación/2-Diseño/Modelo-ER.pdf) |
| 3. Desarrollo | [`Documentacion-Desarrollo.pdf`](Documentación/3-Desarrollo/Documentacion-Desarrollo.pdf) |
| 4. Pruebas | [`Plan-Pruebas.pdf`](Documentación/4-Pruebas/Plan-Pruebas.pdf) |
| 5. Despliegue | [`Despliegue-Railway.pdf`](Documentación/5-Despliegue/Despliegue-Railway.pdf) |
| 6. Mantenimiento | [`Manual-Usuario.pdf`](Documentación/6-Mantenimiento/Manual-Usuario.pdf) |

## Seguridad

- **Sin SQL en el repositorio.** Los scripts de esquema y migración
  viven en la base de datos administrada por Railway, y `*.sql` está
  excluido en `.gitignore`.
- **Sin credenciales en el código.** Todas las credenciales se cargan
  desde variables de entorno (`.env` local, variables inyectadas en
  Railway).
- **Consultas parametrizadas.** Todo SQL usa parámetros posicionales
  (`$1`, `$2`, ...) — no hay concatenación de strings.
- **Validación en frontera.** Los controladores validan tipos y rangos
  antes de tocar la base de datos.
- **TLS en producción.** Railway provee terminación TLS para todas las
  rutas públicas.

## Licencia

Proyecto académico — Universidad El Bosque, 2026.
