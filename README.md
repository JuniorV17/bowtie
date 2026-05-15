# Bowtie

Aplicación web para el análisis estructurado de riesgos operacionales
mediante diagramas Bowtie, con llenado cuantitativo de la **matriz de
riesgo** bajo el modelo **SMS / OACI** de tres categorías de tolerabilidad
(Intolerable, Tolerable y Aceptable).

---

## Tabla de contenidos

1. [Sobre el proyecto](#sobre-el-proyecto)
2. [Características](#características)
3. [Modelo de matriz de riesgo](#modelo-de-matriz-de-riesgo)
4. [Arquitectura](#arquitectura)
5. [Stack tecnológico](#stack-tecnológico)
6. [Estructura del repositorio](#estructura-del-repositorio)
7. [Instalación local](#instalación-local)
8. [Scripts](#scripts)
9. [API REST](#api-rest)
10. [Despliegue](#despliegue)
11. [Autor](#autor)

---

## Sobre el proyecto

Un **diagrama Bowtie** es una técnica visual de análisis de riesgo en
forma de moño: a la izquierda se modelan las **causas** y los **controles
preventivos**; en el centro, el **evento principal**; a la derecha, las
**consecuencias** y las **medidas de mitigación**. Es la herramienta
estándar para dar trazabilidad entre lo que puede salir mal, lo que se
está haciendo para evitarlo y lo que se hará si finalmente ocurre.

Esta aplicación acompaña al analista a lo largo de todo el ciclo:
construcción del diagrama mediante un asistente paso a paso, llenado de
la matriz de riesgo inicial y residual (antes y después de aplicar
controles), visualización interactiva del moño completo y exportación a
PDF o SVG para su incorporación a informes.

## Características

- **Dashboard** con listado, búsqueda y eliminación de diagramas.
- **Asistente de cinco pasos** que guía la construcción de un diagrama
  Bowtie completo: peligro, evento principal (Top Event), causas,
  consecuencias y controles. Cada paso incluye las definiciones OACI
  correspondientes (Doc 9859 — SMM).
- **Visualización interactiva** del diagrama con conexiones tipo Bezier,
  zoom, ajuste a pantalla y tooltip que muestra el texto completo de
  cualquier recuadro al pasar el cursor.
- **Matriz de riesgo** *inicial* y *residual* (antes y después de aplicar
  los controles), con cálculo automático de tolerabilidad sobre la
  matriz **SMS / OACI** 5 × 5 (probabilidad 1..5 × gravedad A..E) y
  visualización en el panel del diagrama de la **medida recomendada**
  según la categoría de tolerabilidad.
- **Factores de escalamiento** sobre controles y mitigaciones para
  representar condiciones que degradan su efectividad.
- **Exportación** del diagrama completo a PDF y SVG, con las cajas
  expandidas para mostrar todo el texto sin truncar.
- **API REST** con validación estricta de entrada y operaciones
  transaccionales.
- **Suite de pruebas** unitarias y de integración con `node:test` y
  `supertest`.
- **Despliegue continuo** en Railway con sonda de salud.

## Modelo de matriz de riesgo

El sistema implementa el modelo del **Manual de gestión de la seguridad
operacional (SMM) de la OACI**:

- **Probabilidad (1..5):** Sumamente improbable, Improbable, Remoto,
  Ocasional, Frecuente.
- **Gravedad (A..E):** Catastrófico, Peligroso, Grave, Leve,
  Insignificante.

A partir de la combinación de probabilidad y gravedad se obtiene un
**índice de riesgo** (por ejemplo `4B`) y una **categoría** de
tolerabilidad, con su correspondiente **medida recomendada** (textos
literales del manual OACI):

| Categoría | Celdas | Medida recomendada |
|-----------|--------|--------------------|
| Intolerable | 5A, 5B, 5C, 4A, 4B, 3A | Tomar medidas inmediatas para mitigar el riesgo o suspender la actividad. Realizar la mitigación de riesgos de seguridad operacional prioritaria para garantizar que haya controles preventivos o adicionales o mejorados para reducir el índice de riesgos al rango tolerable. |
| Tolerable | 5D, 5E, 4C, 4D, 4E, 3B, 3C, 3D, 2A, 2B, 2C, 1A | Puede tolerarse sobre la base de la mitigación de riesgos de seguridad operacional. Puede necesitar una decisión de gestión para aceptar el riesgo. |
| Aceptable | 3E, 2D, 2E, 1B, 1C, 1D, 1E | Aceptable tal cual. No se necesita una mitigación de riesgos posterior. |

La distribución resultante de la matriz es de **6 celdas Intolerables,
12 Tolerables y 7 Aceptables**, idéntica al manual de referencia de la
OACI.

## Arquitectura

```
┌─────────────┐  HTTP / JSON  ┌─────────────┐    SQL    ┌──────────────┐
│  Frontend   │ ◀───────────▶ │   Backend   │ ◀───────▶ │  PostgreSQL  │
│ React + Vite│               │   Express   │           │              │
└─────────────┘               └─────────────┘           └──────────────┘
```

- **Frontend** — SPA en React: dashboard, asistente, visualización del
  diagrama y motor de exportación.
- **Backend** — API REST en Express: lógica de la matriz de riesgo
  SMS, validación de entrada, acceso a datos y servidor de estáticos en
  producción.
- **Base de datos** — PostgreSQL con integridad referencial y borrado en
  cascada al eliminar diagramas.

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 18, Vite 5, React Router 6, Axios, jsPDF |
| Backend | Node.js 18+, Express 4, node-postgres |
| Base de datos | PostgreSQL 14+ |
| Pruebas | `node:test` (built-in), supertest |
| Despliegue | Railway (Nixpacks) |

## Estructura del repositorio

```
bowtie/
├── client/                     # Frontend React + Vite
│   └── src/
│       ├── components/         # Dashboard, DiagramView, BowtieDiagram, wizard…
│       └── services/           # Capa Axios (consumo de API)
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/             # Definición de endpoints
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── lib/                # Lógica pura (matriz SMS, validadores)
│   │   ├── db/                 # Pool de conexiones PostgreSQL
│   │   ├── app.js              # Factory de Express
│   │   └── index.js            # Bootstrap del servidor
│   ├── sql/                    # Esquema y datos de ejemplo
│   ├── scripts/                # Utilidades (reset de BD)
│   └── tests/                  # Pruebas unitarias e integración
├── railway.json                # Configuración de Railway
├── nixpacks.toml               # Fases de Nixpacks
├── Procfile                    # Compatibilidad con buildpacks
└── package.json                # Scripts orquestadores
```

## Instalación local

**Requisitos previos:** Node.js 18 o superior, npm 9 o superior y una
instancia de PostgreSQL 14 accesible localmente.

```bash
git clone https://github.com/JuniorV17/bowtie.git
cd bowtie

# Instalar dependencias en raíz, server y client
npm run install:all

# Configurar variables de entorno del servidor
cp server/.env.example server/.env
# Editar server/.env con la cadena de conexión local

# (Opcional) inicializar la base de datos con esquema y diagramas de ejemplo
cd server && npm run db:reset && cd ..

# Levantar cliente y servidor en paralelo
npm run dev
```

- Cliente: <http://localhost:5173>
- Servidor: <http://localhost:3001>

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta cliente y servidor en paralelo. |
| `npm run server` | Solo el backend, en modo watch. |
| `npm run client` | Solo el frontend, con HMR. |
| `npm run build` | Construye el bundle de producción del cliente. |
| `npm start` | Inicia el servidor en modo producción. |
| `npm test` (en `server/`) | Ejecuta la suite de pruebas del backend. |
| `npm run db:reset` (en `server/`) | Recrea el esquema con datos de ejemplo. |

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Sonda de salud del servicio. |
| `GET` | `/api/diagrams` | Lista resumida de diagramas. |
| `GET` | `/api/diagrams/matrix` | Matriz SMS, catálogos y paleta. |
| `GET` | `/api/diagrams/:id` | Diagrama completo con todas sus relaciones. |
| `POST` | `/api/diagrams` | Crear diagrama (transacción). |
| `PUT` | `/api/diagrams/:id` | Actualizar diagrama (transacción). |
| `DELETE` | `/api/diagrams/:id` | Eliminar diagrama (cascada). |
| `POST` | `/api/diagrams/:id/evaluations` | Registrar matriz de riesgo (inicial o residual). |
| `GET` | `/api/diagrams/:id/evaluations` | Listar matrices de riesgo del diagrama. |
| `PUT` | `/api/diagrams/evaluations/:id` | Actualizar una matriz de riesgo. |
| `DELETE` | `/api/diagrams/evaluations/:id` | Eliminar una matriz de riesgo. |
| `POST` | `/api/diagrams/controls/:id/escalations` | Crear factor de escalamiento sobre un control. |
| `POST` | `/api/diagrams/mitigations/:id/escalations` | Crear factor de escalamiento sobre una mitigación. |

> Las rutas de la API conservan el segmento `evaluations` por
> compatibilidad con la base de datos. En la interfaz de usuario todo
> aparece como **matriz de riesgo**.

Los registros aceptan `probability` como entero entre 1 y 5 y
`severity` como letra entre `A` y `E`. La respuesta incluye
`risk_index` (por ejemplo `"4B"`) y `tolerability` (`Intolerable`,
`Tolerable` o `Aceptable`).

## Despliegue

El sistema se despliega en **Railway** como dos servicios independientes:

- **Servicio Web** — backend Express que sirve además el bundle
  estático del cliente.
- **PostgreSQL** — plugin gestionado que inyecta la cadena de conexión
  como variable de entorno.

Variables de entorno relevantes:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL (con TLS). |
| `PORT` | Puerto en el que escucha el servidor. |
| `NODE_ENV` | `production` activa el servidor de estáticos. |

## Autor

**Junior Valle** — [@JuniorV17](https://github.com/JuniorV17)
