# 2. Alcance del Sistema

## 2.1 Alcance Funcional

El sistema Bowtie cubre el ciclo completo de gestión de un diagrama de
análisis de riesgo:

### Incluido

- Gestión CRUD de diagramas Bowtie.
- Asistente paso a paso (cinco etapas) para construir un diagrama:
  1. Definición del evento tope y datos generales.
  2. Registro de causas.
  3. Registro de controles preventivos por causa.
  4. Registro de consecuencias.
  5. Registro de medidas de mitigación por consecuencia.
- Visualización gráfica del diagrama Bowtie con conexiones tipo Bezier.
- Exportación del diagrama a PDF y a SVG.
- Evaluación de riesgo según matriz 5×5 SMS, en dos momentos:
  - Riesgo *antes* de la aplicación de controles.
  - Riesgo *después* de la aplicación de controles.
- Cálculo automático de tolerabilidad: *Aceptable*, *Tolerable*, *Intolerable*,
  *Inaceptable*.
- Soporte de factores de escalamiento sobre controles y mitigaciones.
- Búsqueda y listado paginado de diagramas en el panel principal.
- API REST documentada y aislada del frontend.

### No incluido

- Autenticación de usuarios (versión actual sin gestión de cuentas).
- Roles y permisos.
- Versionado histórico de diagramas.
- Colaboración en tiempo real entre múltiples usuarios.
- Soporte multilenguaje (sólo español).
- Integración con sistemas externos de gestión de riesgo.

## 2.2 Alcance Técnico

| Componente | Tecnología | Versión mínima |
|------------|------------|----------------|
| Frontend | React + Vite | React 18, Vite 5 |
| Backend | Node.js + Express | Node 18, Express 4 |
| Base de datos | PostgreSQL | 14 |
| Estilos | Tailwind CSS (CDN) | 3 |
| Cliente HTTP | Axios | 1.6 |
| Exportación | jsPDF, html2canvas | 2.5 / 1.4 |
| Despliegue | Railway (Nixpacks) | - |

## 2.3 Restricciones

1. La aplicación debe ser desplegable como un único servicio web en Railway.
2. La base de datos debe ser provista por el complemento PostgreSQL de
   Railway u otro proveedor compatible vía `DATABASE_URL`.
3. El idioma de la interfaz es exclusivamente español.
4. Todos los textos visuales y exportaciones se generan en formato monocromo
   o color institucional, sin dependencias de licencias propietarias.
5. No se almacenan datos personales identificables.

## 2.4 Supuestos

- El usuario dispone de un navegador moderno con soporte de ES2020 y SVG.
- El servidor cuenta con conectividad a la base de datos PostgreSQL.
- Las credenciales y variables de entorno se gestionan a través del panel de
  Railway o un archivo `.env` local.
