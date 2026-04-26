# 9. Diagramas de Secuencia

## 9.1 Crear un Diagrama Bowtie (CU-01)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
sequenceDiagram
    actor U as Analista
    participant FE as Wizard (React)
    participant API as Express Router
    participant CTRL as DiagramController
    participant DB as PostgreSQL

    U->>FE: Completa los 5 pasos
    FE->>FE: Valida campos requeridos
    U->>FE: Confirma "Guardar diagrama"
    FE->>API: POST /api/diagrams (JSON)
    API->>CTRL: createDiagram(req,res)
    CTRL->>DB: BEGIN
    CTRL->>DB: INSERT diagrams
    DB-->>CTRL: id_diagrama
    loop Cada causa
        CTRL->>DB: INSERT causes
        DB-->>CTRL: id_causa
        loop Cada control
            CTRL->>DB: INSERT preventive_controls
        end
    end
    loop Cada consecuencia
        CTRL->>DB: INSERT consequences
        DB-->>CTRL: id_consecuencia
        loop Cada mitigación
            CTRL->>DB: INSERT mitigation_controls
        end
    end
    CTRL->>DB: COMMIT
    CTRL-->>API: 201 Created
    API-->>FE: { id, message }
    FE-->>U: Redirige al panel principal
```

## 9.2 Visualizar un Diagrama (CU-03)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
sequenceDiagram
    actor U as Analista
    participant FE as DiagramView
    participant API as Express Router
    participant CTRL as DiagramController
    participant DB as PostgreSQL

    U->>FE: Selecciona diagrama
    FE->>API: GET /api/diagrams/:id
    API->>CTRL: getDiagramById
    CTRL->>DB: SELECT diagrams WHERE id
    DB-->>CTRL: diagrama
    CTRL->>DB: SELECT causes + controls + escalations
    DB-->>CTRL: estructura izquierda
    CTRL->>DB: SELECT consequences + mitigations + escalations
    DB-->>CTRL: estructura derecha
    CTRL->>DB: SELECT risk_evaluations
    DB-->>CTRL: evaluaciones
    CTRL-->>API: JSON completo
    API-->>FE: 200 OK
    FE->>FE: Renderiza BowtieDiagram (SVG)
    FE-->>U: Diagrama visible
```

## 9.3 Evaluar Riesgo (CU-06)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
sequenceDiagram
    actor U as Analista
    participant FE as RiskEvaluation
    participant API as Express Router
    participant CTRL as DiagramController
    participant MTX as TolerabilityMatrix
    participant DB as PostgreSQL

    U->>FE: Ingresa probabilidad y gravedad (1..5)
    FE->>API: POST /api/diagrams/:id/evaluations
    API->>CTRL: createRiskEvaluation
    CTRL->>CTRL: Valida rangos
    CTRL->>MTX: calculateTolerability(p,s)
    MTX-->>CTRL: tolerabilidad
    CTRL->>DB: INSERT risk_evaluations
    DB-->>CTRL: registro creado
    CTRL->>DB: UPDATE diagrams SET updated_at = NOW()
    CTRL-->>API: 201 Created
    API-->>FE: evaluación con tolerabilidad
    FE-->>U: Muestra resultado
```

## 9.4 Eliminar Diagrama (CU-05)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
sequenceDiagram
    actor U as Analista
    participant FE as Dashboard
    participant API as Express Router
    participant CTRL as DiagramController
    participant DB as PostgreSQL

    U->>FE: Click en "Eliminar"
    FE-->>U: Diálogo de confirmación
    U->>FE: Confirma
    FE->>API: DELETE /api/diagrams/:id
    API->>CTRL: deleteDiagram
    CTRL->>DB: DELETE FROM diagrams WHERE id
    DB-->>CTRL: borrado en cascada
    CTRL-->>API: 200 OK
    API-->>FE: { message }
    FE->>FE: Refresca el listado
```

## 9.5 Health Check (CU-09)

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
sequenceDiagram
    participant RW as Railway
    participant SRV as Express Server

    loop Cada N segundos
        RW->>SRV: GET /api/health
        SRV-->>RW: 200 OK { status:"ok", environment, timestamp }
    end
```
