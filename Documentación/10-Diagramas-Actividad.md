# 10. Diagramas de Actividad y Lógica del Sistema

## 10.1 Diagrama de Lógica General

Este diagrama representa la lógica global del sistema desde el ingreso del
usuario hasta la persistencia de la información.

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart TB
    Start([Inicio]) --> Load[Carga de la SPA<br/>desde Railway]
    Load --> Dash[Dashboard:<br/>listado de diagramas]
    Dash --> Decide{¿Qué desea hacer<br/>el usuario?}
    Decide -->|Crear| Wiz[Asistente 5 pasos]
    Decide -->|Visualizar| ViewDiag[DiagramView]
    Decide -->|Editar| WizEdit[Asistente con datos<br/>pre-cargados]
    Decide -->|Eliminar| Confirm[Confirmar borrado]
    Decide -->|Consultar matriz| Matrix[GET /api/diagrams/matrix]

    Wiz --> Validate{¿Datos válidos?}
    Validate -->|No| Wiz
    Validate -->|Sí| SavePost[POST /api/diagrams]
    SavePost --> TxBegin[BEGIN tx]
    TxBegin --> InsertAll[Inserta diagrama,<br/>causas, controles,<br/>consecuencias, mitigaciones]
    InsertAll --> TxOk{¿Éxito?}
    TxOk -->|No| Rollback[ROLLBACK<br/>Mensaje de error]
    TxOk -->|Sí| Commit[COMMIT]
    Commit --> Dash

    WizEdit --> SavePut[PUT /api/diagrams/:id]
    SavePut --> Dash

    Confirm --> Del{¿Confirmado?}
    Del -->|No| Dash
    Del -->|Sí| DelReq[DELETE /api/diagrams/:id]
    DelReq --> Dash

    ViewDiag --> Render[Renderizar SVG]
    Render --> Export{¿Exportar?}
    Export -->|PDF| Pdf[jsPDF + html2canvas]
    Export -->|SVG| Svg[Serializar SVG]
    Export -->|No| End([Fin])
    Pdf --> End
    Svg --> End
    Rollback --> Dash
    Matrix --> Dash
```

## 10.2 Flujo del Asistente de Creación

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart LR
    S1["Paso 1<br/>Evento Tope<br/>(título, riesgo, descripción)"] --> V1{¿Válido?}
    V1 -->|No| S1
    V1 -->|Sí| S2["Paso 2<br/>Causas"]
    S2 --> V2{¿>=1 causa?}
    V2 -->|No| S2
    V2 -->|Sí| S3["Paso 3<br/>Controles<br/>preventivos"]
    S3 --> S4["Paso 4<br/>Consecuencias"]
    S4 --> V4{¿>=1<br/>consecuencia?}
    V4 -->|No| S4
    V4 -->|Sí| S5["Paso 5<br/>Mitigaciones"]
    S5 --> Eval["Evaluación<br/>(opcional)"]
    Eval --> Save["Guardar<br/>(POST/PUT)"]
    Save --> Dashboard["Dashboard"]
```

## 10.3 Lógica de la Evaluación de Riesgo

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart TB
    Start([Inicio]) --> InP[Probabilidad p ∈ 1..5]
    Start --> InS[Gravedad s ∈ 1..5]
    InP --> Validate{¿1 ≤ p,s ≤ 5?}
    InS --> Validate
    Validate -->|No| Err[400 Bad Request]
    Validate -->|Sí| Lookup["TOLERABILITY_MATRIX[p][s]"]
    Lookup --> Save["INSERT risk_evaluations"]
    Save --> End([Fin])
    Err --> End
```

## 10.4 Flujo de Despliegue en Railway

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
flowchart LR
    Push["git push<br/>main"] --> Hook["Webhook GitHub<br/>→ Railway"]
    Hook --> Build["Nixpacks Build<br/>(install + build)"]
    Build --> Bundle["Crea contenedor con<br/>server + client/dist"]
    Bundle --> Start["npm start<br/>(node server/src/index.js)"]
    Start --> Health{"GET /api/health<br/>200 OK?"}
    Health -->|No| Restart["Reinicio<br/>política ON_FAILURE"]
    Health -->|Sí| Live["Servicio en línea"]
    Restart --> Build
    Live --> Monitor["Monitoreo continuo<br/>logs + métricas"]
```

## 10.5 Diagrama de Estados de un Diagrama

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
stateDiagram-v2
    [*] --> Borrador : Inicio del wizard
    Borrador --> Borrador : Edición de pasos 1..5
    Borrador --> Persistido : Guardar (POST)
    Persistido --> Persistido : Edición posterior (PUT)
    Persistido --> Evaluado : Registrar evaluación
    Evaluado --> Evaluado : Re-evaluación
    Persistido --> Eliminado : DELETE
    Evaluado --> Eliminado : DELETE
    Eliminado --> [*]
```
