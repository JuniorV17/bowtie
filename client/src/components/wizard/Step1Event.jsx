// client/src/components/wizard/Step1Event.jsx
import React from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#DC2626",
    marginLeft: "2px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "100px",
  },
  hint: {
    fontSize: "13px",
    color: "#6B7280",
    marginTop: "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    backgroundColor: "#F9FAFB",
    padding: "8px 12px",
    borderRadius: "8px",
    lineHeight: "1.5",
  },
  infoIcon: {
    flexShrink: 0,
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "12px",
    padding: "20px",
  },
  infoTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoText: {
    fontSize: "14px",
    color: "#3B82F6",
    lineHeight: "1.6",
  },
};

const Step1Event = ({ formData, updateFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#4F46E5";
    e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "#E5E7EB";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={styles.container}>
      <div style={styles.field}>
        <label style={styles.label}>
          Título del Diagrama<span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Ej: Análisis de Riesgo - Data Center"
          style={styles.input}
        />
        <p style={styles.hint}>
          <span style={styles.infoIcon}>ℹ️</span> Este título aparecerá en el Dashboard y en la cabecera del diagrama
        </p>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          Nombre del Peligro<span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="riskName"
          value={formData.riskName}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Ej: Falla total del sistema eléctrico"
          style={styles.input}
        />
        <p style={styles.hint}>
          <span style={styles.infoIcon}>ℹ️</span> El peligro principal que se está analizando. Aparecerá en la parte superior del diagrama y en las tarjetas del Dashboard
        </p>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          Nombre del Riesgo (Top Event)<span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="topEvent"
          value={formData.topEvent}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Ej: Corte inesperado de energía en Data Center"
          style={styles.input}
        />
        <p style={styles.hint}>
          <span style={styles.infoIcon}>ℹ️</span> El evento central del diagrama Bowtie. Se mostrará en el centro del diagrama como un círculo
        </p>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Descripción (opcional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Descripción adicional del análisis de riesgo..."
          style={styles.textarea}
        />
        <p style={styles.hint}>
          <span style={styles.infoIcon}>ℹ️</span> Información adicional que aparecerá debajo del diagrama al visualizarlo
        </p>
      </div>

      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Sobre los diagramas Bowtie
        </h4>
        <p style={styles.infoText}>
          Un diagrama Bowtie visualiza las relaciones entre las causas potenciales
          de un evento de riesgo (izquierda), el evento central, y sus posibles
          consecuencias (derecha). Los controles preventivos se colocan entre las
          causas y el evento, mientras que las medidas de mitigación se ubican
          entre el evento y las consecuencias.
        </p>
      </div>
    </div>
  );
};

export default Step1Event;
