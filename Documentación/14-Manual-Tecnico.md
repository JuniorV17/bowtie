# 14. Manual Técnico

## 14.1 Estructura de Carpetas

```
bowtie/
├── client/                        # SPA React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── BowtieDiagram.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DiagramView.jsx
│       │   └── wizard/
│       │       ├── WizardContainer.jsx
│       │       ├── Step1Event.jsx … Step5Mitigations.jsx
│       │       ├── RiskEvaluation.jsx
│       │       └── EscalationModal.jsx
│       └── services/
│           └── api.js             # Cliente Axios
│
├── server/                        # API Express
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js               # Bootstrap del servidor
│       ├── db/connection.js       # Pool de PostgreSQL
│       ├── routes/diagrams.js     # Rutas REST
│       └── controllers/
│           └── diagramController.js
│
├── database/
│   ├── init.sql                   # Esquema completo + datos de ejemplo
│   └── migration_v2.sql           # Migración de evaluaciones y escalamientos
│
├── Documentación/                 # Documentación de ingeniería
│   ├── 00-Portada.md … 15-Referencias.md
│
├── package.json                   # Orquestación raíz
├── railway.json                   # Build/health/restart Railway
├── nixpacks.toml                  # Fases de Nixpacks
├── Procfile                       # Compatibilidad buildpacks
├── README.md
└── .gitignore
```

## 14.2 Requisitos del Entorno

| Componente | Versión mínima |
|------------|----------------|
| Node.js | 18 LTS (recomendado 20 LTS) |
| npm | 9 |
| PostgreSQL | 14 |
| Sistema operativo | Linux, macOS o Windows |

## 14.3 Instalación Local

```bash
git clone https://github.com/JuniorV17/bowtie.git
cd bowtie

# Instala dependencias en raíz, server y client
npm run install:all

# Configura el entorno del servidor
cp server/.env.example server/.env
# Edita server/.env con las credenciales de PostgreSQL

# Inicializa la base de datos
psql -U postgres -d bowtie -f database/init.sql

# Ejecuta cliente y servidor
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 14.4 Endpoints REST

### Diagramas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/diagrams` | Lista diagramas (resumen). |
| GET | `/api/diagrams/matrix` | Matriz de tolerabilidad y catálogos. |
| GET | `/api/diagrams/:id` | Diagrama completo. |
| POST | `/api/diagrams` | Crea diagrama (transaccional). |
| PUT | `/api/diagrams/:id` | Actualiza diagrama (transaccional). |
| DELETE | `/api/diagrams/:id` | Elimina diagrama (cascada). |

### Evaluaciones de Riesgo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/diagrams/:diagramId/evaluations` | Crear evaluación. |
| GET | `/api/diagrams/:diagramId/evaluations` | Listar evaluaciones. |
| PUT | `/api/diagrams/evaluations/:id` | Actualizar evaluación. |
| DELETE | `/api/diagrams/evaluations/:id` | Eliminar evaluación. |

### Factores de Escalamiento

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/diagrams/controls/:controlId/escalations` | Agregar escalamiento a un control. |
| DELETE | `/api/diagrams/control-escalations/:id` | Eliminar escalamiento de control. |
| POST | `/api/diagrams/mitigations/:mitigationId/escalations` | Agregar escalamiento a una mitigación. |
| DELETE | `/api/diagrams/mitigation-escalations/:id` | Eliminar escalamiento de mitigación. |

### Salud

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servicio. |

## 14.5 Esquema JSON Esperado

### Crear / Actualizar diagrama

```json
{
  "title": "Análisis de Riesgo - Data Center",
  "riskName": "Falla del sistema eléctrico",
  "topEvent": "Corte de energía",
  "description": "Texto opcional",
  "causes": [
    {
      "label": "Sobrecarga en la red",
      "controls": [
        { "label": "Regulador de voltaje" },
        { "label": "UPS Online" }
      ]
    }
  ],
  "consequences": [
    {
      "label": "Daño a servidores",
      "mitigations": [{ "label": "Extinción automática" }]
    }
  ]
}
```

### Crear evaluación

```json
{
  "evaluationType": "before",
  "probability": 4,
  "severity": 3,
  "notes": "Riesgo previo a controles"
}
```

## 14.6 Variables de Entorno

| Variable | Obligatoria | Descripción |
|----------|--------------|-------------|
| `NODE_ENV` | Sí (en producción) | `production` para servir estáticos. |
| `PORT` | No | Puerto del servidor (Railway lo inyecta). |
| `DATABASE_URL` | Sí en producción | Cadena de conexión completa. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Sí en local | Alternativa a `DATABASE_URL`. |
| `PGSSL` | No | `false` desactiva SSL en `DATABASE_URL`. |

## 14.7 Buenas Prácticas Implementadas

- Uso de transacciones (`BEGIN`/`COMMIT`/`ROLLBACK`) en operaciones complejas.
- Cascada de borrado para mantener integridad referencial.
- Validación explícita de rangos numéricos.
- Separación de responsabilidades por capa.
- Uso de scripts de migración versionados.
- Configuración de despliegue declarativa (`railway.json`, `nixpacks.toml`).
- Variables de entorno en `.env` excluidas del control de versiones.

## 14.8 Resolución de Problemas

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| `ECONNREFUSED` al iniciar el servidor. | PostgreSQL no está corriendo o las credenciales son incorrectas. | Verificar el servicio y `server/.env`. |
| Páginas en blanco en producción. | El servidor no está sirviendo `client/dist`. | Asegurar `NODE_ENV=production` y ejecutar el build. |
| Error 503 en evaluaciones. | Las tablas `risk_evaluations` o `*_escalations` no existen. | Ejecutar `database/migration_v2.sql`. |
| Health check falla en Railway. | Variables de entorno mal configuradas. | Revisar `DATABASE_URL` y `NODE_ENV`. |
