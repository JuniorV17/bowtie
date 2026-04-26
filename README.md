# Sistema Bowtie

Aplicación web para el análisis estructurado de riesgos mediante diagramas
**Bowtie**. Permite la creación, edición, visualización y exportación de
diagramas, así como la evaluación cuantitativa del riesgo bajo el modelo
**SMS 5×5** (probabilidad × gravedad).

---

## Tabla de contenidos

1. [Características](#características)
2. [Arquitectura](#arquitectura)
3. [Requisitos](#requisitos)
4. [Instalación local](#instalación-local)
5. [Despliegue en Railway](#despliegue-en-railway)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [API REST](#api-rest)
8. [Documentación de ingeniería](#documentación-de-ingeniería)
9. [Licencia](#licencia)

---

## Características

- Asistente de cinco pasos para construir un diagrama Bowtie completo.
- Visualización gráfica del diagrama con conexiones tipo Bezier.
- Exportación a PDF y SVG.
- Evaluación de riesgo *antes* y *después* de la aplicación de controles.
- Cálculo automático de tolerabilidad (Aceptable, Tolerable, Intolerable, Inaceptable).
- Soporte de factores de escalamiento sobre controles y mitigaciones.
- API REST documentada y desplegable en Railway con un solo clic.

## Arquitectura

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Axios.
- **Backend**: Node.js 18+, Express 4, node-postgres.
- **Base de datos**: PostgreSQL 14+.
- **Despliegue**: Railway (Nixpacks) o cualquier proveedor compatible con `npm start`.

Para los diagramas de arquitectura, componentes, clases y despliegue
consulte la [carpeta de Documentación](Documentación/).

## Requisitos

- Node.js 18 o superior (recomendado 20 LTS).
- PostgreSQL 14 o superior.
- npm 9 o superior.

## Instalación local

```bash
git clone https://github.com/JuniorV17/bowtie.git
cd bowtie

# Instalar dependencias en raíz, server y client
npm run install:all

# Configurar variables de entorno del servidor
cp server/.env.example server/.env
# Editar server/.env con las credenciales locales

# Crear la base de datos y cargar el esquema
createdb bowtie
psql -U postgres -d bowtie -f database/init.sql

# Ejecutar cliente y servidor en paralelo
npm run dev
```

- Cliente: http://localhost:5173
- Servidor: http://localhost:3001

## Despliegue en Railway

1. Crear un proyecto en [Railway](https://railway.app) y conectar este repositorio.
2. Agregar el plugin **PostgreSQL** (genera `DATABASE_URL` automáticamente).
3. Configurar la variable `NODE_ENV=production` en el servicio web.
4. Esperar el primer despliegue (Railway detecta `railway.json` y `nixpacks.toml`).
5. Desde la consola del plugin PostgreSQL, ejecutar el contenido de `database/init.sql`.
6. Verificar el endpoint `/api/health`.

## Estructura del proyecto

```
bowtie/
├── client/                # Frontend React + Vite
├── server/                # Backend Node.js + Express
├── database/              # Scripts SQL (esquema y migraciones)
├── Documentación/         # Documentación formal de ingeniería
├── railway.json           # Configuración Railway
├── nixpacks.toml          # Fases Nixpacks
├── Procfile               # Compatibilidad buildpacks
├── package.json           # Scripts orquestadores
└── README.md
```

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/diagrams` | Listar diagramas. |
| GET | `/api/diagrams/:id` | Obtener diagrama completo. |
| POST | `/api/diagrams` | Crear diagrama. |
| PUT | `/api/diagrams/:id` | Actualizar diagrama. |
| DELETE | `/api/diagrams/:id` | Eliminar diagrama. |
| GET | `/api/diagrams/matrix` | Matriz de tolerabilidad. |
| POST | `/api/diagrams/:id/evaluations` | Crear evaluación de riesgo. |
| GET | `/api/diagrams/:id/evaluations` | Listar evaluaciones. |
| GET | `/api/health` | Estado del servicio. |

El catálogo completo se documenta en
[Documentación/14-Manual-Tecnico.md](Documentación/14-Manual-Tecnico.md).

## Documentación de ingeniería

La carpeta [`Documentación/`](Documentación/) contiene los entregables
formales del proyecto: requisitos (IEEE 830), casos de uso, diagramas UML,
modelo de datos, plan de pruebas (IEEE 829), manual técnico, manual de
usuario y referencias.

## Licencia

Proyecto académico — Universidad El Bosque, 2026.
