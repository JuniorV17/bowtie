# 3. Requisitos del Sistema

> Especificación elaborada con base en la norma **IEEE 830** y la guía
> **ISO/IEC/IEEE 29148:2018** para ingeniería de requisitos.

## 3.1 Requisitos Funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | El sistema permitirá crear diagramas Bowtie con título, riesgo y evento tope. | Alta |
| RF-02 | El sistema permitirá listar todos los diagramas registrados. | Alta |
| RF-03 | El sistema permitirá visualizar gráficamente un diagrama Bowtie. | Alta |
| RF-04 | El sistema permitirá editar un diagrama existente. | Alta |
| RF-05 | El sistema permitirá eliminar un diagrama existente. | Alta |
| RF-06 | El sistema permitirá agregar una o más causas a un diagrama. | Alta |
| RF-07 | El sistema permitirá agregar uno o más controles preventivos a una causa. | Alta |
| RF-08 | El sistema permitirá agregar una o más consecuencias a un diagrama. | Alta |
| RF-09 | El sistema permitirá agregar una o más medidas de mitigación a una consecuencia. | Alta |
| RF-10 | El sistema permitirá registrar factores de escalamiento sobre controles. | Media |
| RF-11 | El sistema permitirá registrar factores de escalamiento sobre mitigaciones. | Media |
| RF-12 | El sistema permitirá registrar evaluaciones de riesgo *antes* y *después* de los controles. | Alta |
| RF-13 | El sistema calculará automáticamente la tolerabilidad según matriz 5×5. | Alta |
| RF-14 | El sistema permitirá exportar el diagrama a PDF. | Media |
| RF-15 | El sistema permitirá exportar el diagrama a SVG. | Media |
| RF-16 | El sistema permitirá buscar diagramas por título o nombre del riesgo. | Media |
| RF-17 | El sistema expondrá un endpoint `/api/health` para verificación de estado. | Alta |

## 3.2 Requisitos No Funcionales

### 3.2.1 Rendimiento

| ID | Requisito |
|----|-----------|
| RNF-01 | El tiempo de respuesta de la API debe ser inferior a 500 ms para operaciones de lectura sobre conjuntos de hasta 100 diagramas. |
| RNF-02 | El tiempo de carga inicial del cliente web debe ser inferior a 3 segundos sobre red banda ancha. |

### 3.2.2 Disponibilidad

| ID | Requisito |
|----|-----------|
| RNF-03 | El sistema deberá ofrecer una disponibilidad del 99% en horario hábil cuando se despliegue en Railway. |
| RNF-04 | El servicio deberá reiniciarse automáticamente ante fallas (política `ON_FAILURE`). |

### 3.2.3 Seguridad

| ID | Requisito |
|----|-----------|
| RNF-05 | Las credenciales de la base de datos no podrán estar embebidas en el código fuente. |
| RNF-06 | Las solicitudes HTTP deberán emplear TLS en producción (provisto por Railway). |
| RNF-07 | El servidor validará los rangos numéricos de probabilidad y gravedad (1 a 5). |

### 3.2.4 Usabilidad

| ID | Requisito |
|----|-----------|
| RNF-08 | La interfaz deberá ofrecer retroalimentación clara ante errores de validación. |
| RNF-09 | El asistente de creación deberá permitir avanzar y retroceder entre pasos. |
| RNF-10 | La aplicación deberá ser totalmente operable en navegadores Chrome, Firefox y Edge en sus dos últimas versiones estables. |

### 3.2.5 Mantenibilidad

| ID | Requisito |
|----|-----------|
| RNF-11 | El código deberá organizarse en capas: rutas, controladores, conexión, vistas y servicios. |
| RNF-12 | El sistema deberá soportar la adición de nuevas tablas mediante scripts de migración independientes. |

### 3.2.6 Portabilidad

| ID | Requisito |
|----|-----------|
| RNF-13 | El sistema deberá ejecutarse en cualquier sistema operativo que soporte Node.js 18 o superior. |
| RNF-14 | El sistema deberá poder desplegarse en cualquier proveedor cloud que soporte Nixpacks o `npm start`. |

## 3.3 Trazabilidad de Requisitos a Casos de Uso

| Caso de Uso | Requisitos cubiertos |
|--------------|------------------------|
| CU-01 Crear diagrama | RF-01, RF-06, RF-07, RF-08, RF-09 |
| CU-02 Listar diagramas | RF-02, RF-16 |
| CU-03 Visualizar diagrama | RF-03 |
| CU-04 Editar diagrama | RF-04 |
| CU-05 Eliminar diagrama | RF-05 |
| CU-06 Evaluar riesgo | RF-12, RF-13 |
| CU-07 Gestionar escalamiento | RF-10, RF-11 |
| CU-08 Exportar diagrama | RF-14, RF-15 |
| CU-09 Verificar estado del servicio | RF-17 |
