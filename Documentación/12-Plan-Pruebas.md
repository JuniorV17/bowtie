# 12. Plan de Pruebas

## 12.1 Estrategia

Las pruebas se organizan en cuatro niveles, conforme a la pirámide de
testing y la norma **IEEE 829** para documentación de pruebas.

| Nivel | Objetivo | Herramienta |
|-------|----------|-------------|
| Unitarias | Validar funciones puras (matriz de tolerabilidad, validadores). | Manual / `node --test` (extensible). |
| Integración | Validar interacciones API ↔ PostgreSQL. | `curl` / Postman / scripts npm. |
| Sistema | Validar flujos completos en la interfaz. | Navegador (Chrome/Firefox/Edge). |
| Aceptación | Validar criterios de aceptación con base en casos de uso. | Manual asistida. |

## 12.2 Casos de Prueba Principales

### CP-01 Crear diagrama válido

| Campo | Valor |
|-------|-------|
| Precondición | Servicio activo y BD inicializada. |
| Pasos | Completar el wizard con datos válidos y guardar. |
| Resultado esperado | Respuesta 201 Created y diagrama visible en el dashboard. |

### CP-02 Crear diagrama con campos vacíos

| Campo | Valor |
|-------|-------|
| Pasos | Intentar avanzar el paso 1 sin completar el evento tope. |
| Resultado esperado | Mensaje de validación; no se permite avanzar. |

### CP-03 Listar diagramas

| Campo | Valor |
|-------|-------|
| Pasos | Acceder a `/`. |
| Resultado esperado | Listado ordenado por `updated_at` descendente, con cantidades de causas y consecuencias. |

### CP-04 Visualizar diagrama existente

| Campo | Valor |
|-------|-------|
| Pasos | Click sobre un diagrama existente. |
| Resultado esperado | Se renderiza el diagrama con todas sus relaciones. |

### CP-05 Editar y persistir cambios

| Campo | Valor |
|-------|-------|
| Pasos | Editar un diagrama, modificar el evento tope y guardar. |
| Resultado esperado | El nuevo valor aparece en la base de datos y en el visualizador. |

### CP-06 Eliminar diagrama

| Campo | Valor |
|-------|-------|
| Pasos | Eliminar un diagrama y aceptar la confirmación. |
| Resultado esperado | El diagrama y todas sus tablas relacionadas desaparecen (cascada). |

### CP-07 Evaluación con probabilidad fuera de rango

| Campo | Valor |
|-------|-------|
| Pasos | Enviar `probability=6, severity=3` al endpoint de evaluaciones. |
| Resultado esperado | 400 Bad Request con mensaje "probability must be between 1 and 5". |

### CP-08 Cálculo correcto de tolerabilidad

| Entradas | Tolerabilidad esperada |
|----------|-------------------------|
| p=5, s=5 | Inaceptable |
| p=4, s=4 | Intolerable |
| p=3, s=3 | Tolerable |
| p=1, s=2 | Aceptable |

### CP-09 Endpoint de salud

| Campo | Valor |
|-------|-------|
| Pasos | `GET /api/health`. |
| Resultado esperado | 200 con JSON `{ status: "ok", environment, timestamp }`. |

### CP-10 Despliegue en Railway

| Campo | Valor |
|-------|-------|
| Pasos | Conectar repo, agregar plugin PostgreSQL, ejecutar `init.sql`, esperar despliegue. |
| Resultado esperado | El sitio carga correctamente en `*.up.railway.app` y la API responde. |

## 12.3 Criterios de Aceptación Globales

- Todos los casos de uso CU-01 a CU-09 se ejecutan sin errores.
- El sistema rechaza entradas inválidas con mensajes claros.
- El despliegue en Railway se realiza sin intervención manual adicional luego del primer despliegue.
- El cliente carga en menos de 3 segundos y la API responde en menos de 500 ms en condiciones normales.

## 12.4 Matriz de Trazabilidad CU ↔ Casos de Prueba

| Caso de Uso | Casos de Prueba |
|-------------|-----------------|
| CU-01 | CP-01, CP-02 |
| CU-02 | CP-03 |
| CU-03 | CP-04 |
| CU-04 | CP-05 |
| CU-05 | CP-06 |
| CU-06 | CP-07, CP-08 |
| CU-07 | (cobertura indirecta vía CP-04) |
| CU-08 | (cobertura manual del navegador) |
| CU-09 | CP-09, CP-10 |
