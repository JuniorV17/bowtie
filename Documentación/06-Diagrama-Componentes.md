# 6. Diagrama de Componentes

## 6.1 Propósito

El diagrama de componentes muestra los módulos lógicos del sistema, sus
interfaces explícitas y las relaciones de dependencia entre ellos. Es el
artefacto principal que documenta la **estructura física del software**
desplegado en Railway.

## 6.2 Diagrama de Componentes (Despliegue Railway)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart TB
    subgraph CLIENT["«component» Cliente Web (SPA)"]
        UI["UI Components<br/>Dashboard / Wizard / DiagramView"]
        Router["React Router"]
        ApiSvc["Service Layer<br/>api.js (Axios)"]
        Export["Export Engine<br/>jsPDF + html2canvas"]
        UI --> Router
        UI --> ApiSvc
        UI --> Export
    end

    subgraph SERVER["«component» Servidor Web (Express)"]
        Static["Static Files Handler<br/>(/client/dist)"]
        ApiRouter["API Router<br/>/api/diagrams"]
        HealthRouter["Health Endpoint<br/>/api/health"]
        Controllers["Controllers<br/>diagramController"]
        DBLayer["DB Connection Pool<br/>(node-postgres)"]

        Static -.serves.-> ApiRouter
        ApiRouter --> Controllers
        Controllers --> DBLayer
    end

    subgraph DB["«component» Base de Datos"]
        Tables["Tablas<br/>diagrams · causes · controls<br/>consequences · mitigations<br/>risk_evaluations · escalations"]
    end

    subgraph PLAT["«infrastructure» Railway"]
        Build["Nixpacks Build<br/>(railway.json + nixpacks.toml)"]
        HealthCheck["Health Probe"]
        Logs["Logs / Metrics"]
    end

    Browser(["Navegador<br/>(Chrome / Firefox / Edge)"])
    Browser ==>|HTTPS| Static
    Browser ==>|HTTPS / JSON| ApiRouter
    DBLayer ==>|TCP / SSL| Tables
    Build ==>|despliega| SERVER
    HealthCheck ==>|GET /api/health| HealthRouter
    SERVER -.->|stdout/stderr| Logs
```

## 6.3 Catálogo de Componentes

| Componente | Tipo | Tecnología | Responsabilidad |
|------------|------|-----------|-----------------|
| **UI Components** | Frontend | React 18 | Renderizar las vistas del dashboard, wizard y visualización del diagrama. |
| **React Router** | Frontend | react-router-dom 6 | Navegación SPA entre vistas. |
| **Service Layer** | Frontend | Axios | Adaptador HTTP que centraliza llamadas a la API. |
| **Export Engine** | Frontend | jsPDF, html2canvas | Generación de PDF y SVG a partir del DOM. |
| **Static Files Handler** | Backend | Express `express.static` | Sirve los recursos del SPA en producción. |
| **API Router** | Backend | Express Router | Define los recursos REST sobre `/api/diagrams`. |
| **Health Endpoint** | Backend | Express | Provee el endpoint `/api/health` para Railway. |
| **Controllers** | Backend | JavaScript ES Modules | Implementa la lógica de negocio y orquesta la base de datos. |
| **DB Connection Pool** | Backend | node-postgres (`pg`) | Pool de conexiones a PostgreSQL con soporte SSL. |
| **PostgreSQL** | Persistencia | PostgreSQL 14+ | Almacenamiento relacional con integridad referencial. |
| **Nixpacks Build** | Infraestructura | Railway / Nixpacks | Construye el artefacto de despliegue. |
| **Health Probe** | Infraestructura | Railway | Verifica la salud del contenedor. |

## 6.4 Interfaces

| Interfaz | Proveedor | Consumidor | Protocolo |
|----------|-----------|------------|-----------|
| **REST `/api/diagrams`** | Backend | Cliente Web | HTTP/JSON |
| **REST `/api/health`** | Backend | Railway | HTTP/JSON |
| **PostgreSQL Wire Protocol** | PostgreSQL | Backend | TCP + SSL |
| **HTTPS estática** | Backend (express.static) | Navegador | HTTP/HTTPS |

## 6.5 Diagrama de Componentes — Vista Detallada del Backend

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart LR
    Index["index.js<br/>(Bootstrap)"]
    Cors["cors middleware"]
    Json["express.json()"]
    Routes["routes/diagrams.js"]
    CtrlDiagrams["controllers/<br/>diagramController.js"]
    DbConn["db/connection.js<br/>(Pool)"]
    EnvFile[(".env / DATABASE_URL")]

    Index --> Cors --> Json --> Routes --> CtrlDiagrams --> DbConn
    DbConn -.lee.-> EnvFile
```

## 6.6 Empaquetado y Despliegue

| Artefacto | Origen | Destino |
|-----------|--------|---------|
| `client/dist/` | `npm --prefix client run build` | Servido por Express en producción. |
| `server/src/` | Node.js ESM | Ejecutado mediante `npm start`. |
| `database/init.sql` | Repositorio | Ejecutado manualmente al provisionar la BD. |
| `railway.json` | Repositorio | Configuración de build / health / restart. |
| `nixpacks.toml` | Repositorio | Configuración de fases de Nixpacks. |
| `Procfile` | Repositorio | Compatibilidad con buildpacks tipo Heroku. |
