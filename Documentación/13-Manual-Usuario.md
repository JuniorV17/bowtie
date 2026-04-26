# 13. Manual de Usuario

## 13.1 Acceso al Sistema

1. Ingresar al sitio publicado por Railway: `https://<tu-proyecto>.up.railway.app`.
2. La aplicación se carga directamente en el panel principal *(Dashboard)*.

No se requieren credenciales en la versión actual.

## 13.2 Estructura del Panel Principal

| Elemento | Descripción |
|----------|-------------|
| **Botón “Nuevo diagrama”** | Inicia el asistente para crear un diagrama Bowtie. |
| **Campo de búsqueda** | Filtra los diagramas por título o nombre del riesgo. |
| **Tarjetas de diagrama** | Cada diagrama existente con sus contadores de causas y consecuencias. |
| **Acciones por tarjeta** | Visualizar, editar o eliminar el diagrama. |

## 13.3 Crear un Diagrama

### Paso 1 — Evento

- **Título**: nombre interno del análisis (ej. *Riesgo eléctrico Data Center*).
- **Nombre del riesgo**: descripción breve del riesgo principal.
- **Evento tope**: suceso central a evitar.
- **Descripción**: campo libre opcional.

### Paso 2 — Causas

Agregue las causas que pueden detonar el evento tope. Es posible agregar tantas como sea necesario y reordenarlas.

### Paso 3 — Controles preventivos

Para cada causa, asocie uno o más controles que la mitiguen *antes* del evento tope.

### Paso 4 — Consecuencias

Liste las consecuencias resultantes si el evento tope se materializa.

### Paso 5 — Mitigaciones

Para cada consecuencia, asocie una o más medidas de mitigación que reduzcan el impacto.

### Evaluación de riesgo (opcional)

- Seleccione el tipo: *Antes de controles* o *Después de controles*.
- Asigne probabilidad y gravedad en escala 1..5.
- El sistema calcula la tolerabilidad automáticamente según la matriz 5×5.

### Guardar

Presione **Guardar diagrama**. La aplicación retornará al panel principal con el diagrama persistido.

## 13.4 Visualizar un Diagrama

Al seleccionar un diagrama del panel, se accede a la vista gráfica:

- **Lado izquierdo**: causas y sus controles preventivos.
- **Centro**: evento tope.
- **Lado derecho**: consecuencias y sus mitigaciones.
- **Factores de escalamiento**: aparecen acoplados al control o mitigación correspondiente.

## 13.5 Editar / Eliminar

- **Editar**: abre el asistente con los datos actuales precargados.
- **Eliminar**: solicita confirmación; el borrado es irreversible y elimina todas las tablas relacionadas.

## 13.6 Exportar el Diagrama

| Formato | Botón | Descripción |
|---------|-------|-------------|
| PDF | *Exportar a PDF* | Genera un PDF con el diagrama renderizado. |
| SVG | *Exportar a SVG* | Genera un archivo SVG vectorial editable en herramientas externas. |

## 13.7 Mensajes de Error Comunes

| Mensaje | Causa probable | Solución |
|---------|----------------|----------|
| `Failed to fetch diagrams` | El servicio o la base de datos están caídos. | Verificar el estado de Railway y revisar logs. |
| `probability must be between 1 and 5` | Se ingresó un valor fuera de rango. | Corregir el valor en la evaluación. |
| `La tabla risk_evaluations no existe` | La migración `migration_v2.sql` no se ejecutó. | Ejecutar el script de migración en la base de datos. |
| `Diagram not found` | El identificador no existe en BD. | Refrescar el panel principal. |
