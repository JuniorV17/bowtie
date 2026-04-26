// client/src/components/wizard/Step2Causes.jsx
import React from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  infoText: {
    fontSize: "14px",
    color: "#1E40AF",
    marginTop: "4px",
    lineHeight: "1.5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  description: {
    fontSize: "14px",
    color: "#6B7280",
    flex: 1,
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    border: "2px dashed #D1D5DB",
  },
  emptyIcon: {
    margin: "0 auto 12px",
    color: "#9CA3AF",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#9CA3AF",
    marginBottom: "20px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#EFF6FF",
    borderRadius: "12px",
    border: "1px solid #BFDBFE",
  },
  orderButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  orderButton: {
    padding: "4px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#6B7280",
    transition: "background-color 0.2s",
  },
  orderButtonDisabled: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  number: {
    width: "32px",
    height: "32px",
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #BFDBFE",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  deleteButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#DC2626",
    transition: "background-color 0.2s",
  },
  hint: {
    backgroundColor: "#F3F4F6",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "14px",
    color: "#6B7280",
  },
};

const Step2Causes = ({ formData, updateFormData }) => {
  const addCause = () => {
    updateFormData({
      causes: [...formData.causes, { label: "", controls: [] }],
    });
  };

  const updateCause = (index, value) => {
    const newCauses = [...formData.causes];
    newCauses[index] = { ...newCauses[index], label: value };
    updateFormData({ causes: newCauses });
  };

  const removeCause = (index) => {
    const newCauses = formData.causes.filter((_, i) => i !== index);
    updateFormData({ causes: newCauses });
  };

  const moveCause = (index, direction) => {
    const newCauses = [...formData.causes];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newCauses.length) return;
    [newCauses[index], newCauses[newIndex]] = [newCauses[newIndex], newCauses[index]];
    updateFormData({ causes: newCauses });
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <div>
          <strong>¿Qué son las causas?</strong>
          <p style={styles.infoText}>
            Las causas (también llamadas amenazas) son los factores que pueden desencadenar el evento de riesgo.
            En el diagrama aparecerán en el lado <strong>izquierdo</strong> como rectángulos azules.
          </p>
        </div>
      </div>

      <div style={styles.header}>
        <p style={styles.description}>
          Agrega las causas potenciales que pueden provocar el evento de riesgo.
        </p>
        <button
          onClick={addCause}
          style={styles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar Causa
        </button>
      </div>

      {formData.causes.length === 0 ? (
        <div style={styles.emptyState}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            style={styles.emptyIcon}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <h3 style={styles.emptyTitle}>No hay causas agregadas</h3>
          <p style={styles.emptyText}>
            Comienza agregando las causas potenciales del evento de riesgo
          </p>
          <button
            onClick={addCause}
            style={styles.addButton}
          >
            Agregar primera causa
          </button>
        </div>
      ) : (
        <div style={styles.itemsList}>
          {formData.causes.map((cause, index) => (
            <div key={index} style={styles.item}>
              <div style={styles.orderButtons}>
                <button
                  onClick={() => moveCause(index, -1)}
                  disabled={index === 0}
                  style={{
                    ...styles.orderButton,
                    ...(index === 0 ? styles.orderButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) e.currentTarget.style.backgroundColor = "#DBEAFE";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  onClick={() => moveCause(index, 1)}
                  disabled={index === formData.causes.length - 1}
                  style={{
                    ...styles.orderButton,
                    ...(index === formData.causes.length - 1 ? styles.orderButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (index !== formData.causes.length - 1) e.currentTarget.style.backgroundColor = "#DBEAFE";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              <span style={styles.number}>{index + 1}</span>

              <input
                type="text"
                value={cause.label}
                onChange={(e) => updateCause(index, e.target.value)}
                placeholder="Descripción de la causa..."
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3B82F6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#BFDBFE";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                onClick={() => removeCause(index)}
                style={styles.deleteButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                title="Eliminar causa"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.causes.length > 0 && (
        <div style={styles.hint}>
          <strong>Siguiente paso:</strong> Podrás agregar controles preventivos
          para cada causa en el paso 3.
        </div>
      )}
    </div>
  );
};

export default Step2Causes;
