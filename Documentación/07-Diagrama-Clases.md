# 7. Diagrama de Clases

## 7.1 Modelo de Dominio

El sistema Bowtie no implementa un ORM, sino que opera directamente sobre
PostgreSQL. Sin embargo, el modelo conceptual se expresa mediante clases
que reflejan las entidades de negocio y sus relaciones.

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
classDiagram
    direction LR

    class Diagram {
        +int id
        +string title
        +string riskName
        +string topEvent
        +string description
        +datetime createdAt
        +datetime updatedAt
    }

    class Cause {
        +int id
        +int diagramId
        +string label
        +int position
    }

    class PreventiveControl {
        +int id
        +int causeId
        +string label
        +int position
    }

    class Consequence {
        +int id
        +int diagramId
        +string label
        +int position
    }

    class Mitigation {
        +int id
        +int consequenceId
        +string label
        +int position
    }

    class ControlEscalation {
        +int id
        +int controlId
        +string label
        +int position
    }

    class MitigationEscalation {
        +int id
        +int mitigationId
        +string label
        +int position
    }

    class RiskEvaluation {
        +int id
        +int diagramId
        +string evaluationType
        +int probability
        +int severity
        +string tolerability
        +string notes
        +datetime createdAt
    }

    class TolerabilityMatrix {
        <<servicio>>
        +calculate(probability, severity) string
    }

    Diagram "1" *-- "0..*" Cause
    Diagram "1" *-- "0..*" Consequence
    Diagram "1" *-- "0..*" RiskEvaluation
    Cause "1" *-- "0..*" PreventiveControl
    Consequence "1" *-- "0..*" Mitigation
    PreventiveControl "1" *-- "0..*" ControlEscalation
    Mitigation "1" *-- "0..*" MitigationEscalation
    RiskEvaluation ..> TolerabilityMatrix : usa
```

## 7.2 Diagrama de Clases del Backend

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
classDiagram
    direction TB

    class Server {
        +Express app
        +int PORT
        +start()
    }

    class DiagramRouter {
        <<express.Router>>
        +GET /
        +GET /matrix
        +GET /:id
        +POST /
        +PUT /:id
        +DELETE /:id
        +POST /:diagramId/evaluations
        +GET /:diagramId/evaluations
    }

    class DiagramController {
        +getAllDiagrams(req,res)
        +getDiagramById(req,res)
        +createDiagram(req,res)
        +updateDiagram(req,res)
        +deleteDiagram(req,res)
        +createRiskEvaluation(req,res)
        +getRiskEvaluations(req,res)
        +updateRiskEvaluation(req,res)
        +deleteRiskEvaluation(req,res)
        +createControlEscalation(req,res)
        +createMitigationEscalation(req,res)
        +getTolerabilityMatrix(req,res)
        -calculateTolerability(p,s)
    }

    class Pool {
        <<pg>>
        +connect()
        +query(sql,params)
    }

    Server --> DiagramRouter
    DiagramRouter --> DiagramController
    DiagramController --> Pool
```

## 7.3 Diagrama de Clases del Frontend

```mermaid
%%{init: {'theme':'neutral', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#000000','primaryBorderColor':'#000000','lineColor':'#000000'}}}%%
classDiagram
    direction TB

    class App {
        +render()
    }

    class Dashboard {
        -diagrams: Diagram[]
        +loadDiagrams()
        +deleteDiagram(id)
    }

    class WizardContainer {
        -currentStep: int
        -formData: object
        +next()
        +prev()
        +save()
    }

    class Step1Event
    class Step2Causes
    class Step3Controls
    class Step4Consequences
    class Step5Mitigations
    class RiskEvaluation
    class EscalationModal

    class DiagramView {
        -diagram: Diagram
        +exportPDF()
        +exportSVG()
    }

    class BowtieDiagram {
        -nodes: Node[]
        -edges: Edge[]
        +render()
    }

    class ApiService {
        +diagramsApi
        +evaluationsApi
        +controlEscalationsApi
        +mitigationEscalationsApi
    }

    App --> Dashboard
    App --> WizardContainer
    App --> DiagramView
    WizardContainer --> Step1Event
    WizardContainer --> Step2Causes
    WizardContainer --> Step3Controls
    WizardContainer --> Step4Consequences
    WizardContainer --> Step5Mitigations
    WizardContainer --> RiskEvaluation
    WizardContainer --> EscalationModal
    DiagramView --> BowtieDiagram
    Dashboard ..> ApiService
    WizardContainer ..> ApiService
    DiagramView ..> ApiService
```

## 7.4 Reglas de Negocio Encapsuladas

| Regla | Implementación |
|-------|---------------|
| Un diagrama puede tener múltiples causas y consecuencias. | Relación `1..*` con cascada de borrado. |
| Cada control preventivo está asociado a una única causa. | Clave foránea `cause_id` con `ON DELETE CASCADE`. |
| Cada mitigación está asociada a una única consecuencia. | Clave foránea `consequence_id` con `ON DELETE CASCADE`. |
| La probabilidad y la gravedad están restringidas al rango 1..5. | Restricción `CHECK` en SQL y validación en el controlador. |
| La tolerabilidad se deriva de probabilidad × gravedad. | Función `calculateTolerability` y matriz constante `TOLERABILITY_MATRIX`. |
| Toda evaluación se clasifica como `before` o `after`. | Validación en el controlador. |
