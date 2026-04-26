// client/src/components/wizard/Step3Controls.jsx
import React, { useState } from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoBox: {
    backgroundColor: "#D1FAE5",
    border: "1px solid #A7F3D0",
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
    color: "#065F46",
    marginTop: "4px",
    lineHeight: "1.5",
  },
  description: {
    fontSize: "14px",
    color: "#6B7280",
  },
  warning: {
    textAlign: "center",
    padding: "48px 24px",
    backgroundColor: "#FFFBEB",
    borderRadius: "12px",
    border: "1px solid #FDE68A",
  },
  warningIcon: {
    margin: "0 auto 12px",
    color: "#F59E0B",
  },
  warningTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#92400E",
    marginBottom: "8px",
  },
  warningText: {
    fontSize: "14px",
    color: "#B45309",
  },
  tabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    borderBottom: "2px solid #E5E7EB",
    paddingBottom: "12px",
  },
  tab: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px 8px 0 0",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: {
    backgroundColor: "#EFF6FF",
    color: "#1E40AF",
  },
  tabInactive: {
    backgroundColor: "transparent",
    color: "#6B7280",
  },
  badge: {
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  panel: {
    backgroundColor: "#EFF6FF",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #BFDBFE",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  panelInfo: {
    flex: 1,
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: "4px",
  },
  panelSubtitle: {
    fontSize: "14px",
    color: "#3B82F6",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: "13px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  emptyControls: {
    textAlign: "center",
    padding: "32px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    border: "2px dashed #BFDBFE",
  },
  emptyText: {
    fontSize: "14px",
    color: "#9CA3AF",
    marginBottom: "12px",
  },
  emptyLink: {
    color: "#3B82F6",
    cursor: "pointer",
    fontSize: "14px",
    background: "none",
    border: "none",
    textDecoration: "underline",
  },
  controlsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  controlItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#FFFFFF",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #BFDBFE",
  },
  controlNumber: {
    width: "24px",
    height: "24px",
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "12px",
    flexShrink: 0,
  },
  controlInput: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "inherit",
  },
  deleteButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#DC2626",
    transition: "background-color 0.2s",
  },
  summary: {
    backgroundColor: "#F3F4F6",
    borderRadius: "10px",
    padding: "16px",
  },
  summaryTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "8px",
  },
  summaryItem: {
    textAlign: "center",
    padding: "12px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
  },
  summaryNumber: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#3B82F6",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#6B7280",
  },
};

const Step3Controls = ({ formData, updateFormData }) => {
  const [activeCause, setActiveCause] = useState(0);

  const addControl = (causeIndex) => {
    const newCauses = [...formData.causes];
    newCauses[causeIndex] = {
      ...newCauses[causeIndex],
      controls: [...(newCauses[causeIndex].controls || []), { label: "" }],
    };
    updateFormData({ causes: newCauses });
  };

  const updateControl = (causeIndex, controlIndex, value) => {
    const newCauses = [...formData.causes];
    newCauses[causeIndex].controls[controlIndex] = { label: value };
    updateFormData({ causes: newCauses });
  };

  const removeControl = (causeIndex, controlIndex) => {
    const newCauses = [...formData.causes];
    newCauses[causeIndex].controls = newCauses[causeIndex].controls.filter(
      (_, i) => i !== controlIndex
    );
    updateFormData({ causes: newCauses });
  };

  if (formData.causes.length === 0) {
    return (
      <div style={styles.warning}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          style={styles.warningIcon}
        >
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 style={styles.warningTitle}>No hay causas definidas</h3>
        <p style={styles.warningText}>
          Debes agregar al menos una causa en el paso anterior
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <div>
          <strong>¿Qué son los controles preventivos?</strong>
          <p style={styles.infoText}>
            Los controles preventivos son barreras o medidas que ayudan a evitar que las causas provoquen el evento de riesgo.
            En el diagrama aparecerán como rectángulos <strong>verdes</strong> entre las causas y el evento central.
          </p>
        </div>
      </div>

      <p style={styles.description}>
        Agrega controles preventivos para cada causa. Estos controles ayudan a
        prevenir que las causas desencadenen el evento de riesgo.
      </p>

      {/* Tabs */}
      <div style={styles.tabs}>
        {formData.causes.map((cause, index) => (
          <button
            key={index}
            onClick={() => setActiveCause(index)}
            style={{
              ...styles.tab,
              ...(activeCause === index ? styles.tabActive : styles.tabInactive),
            }}
            onMouseEnter={(e) => {
              if (activeCause !== index) {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              if (activeCause !== index) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            Causa {index + 1}
            {cause.controls?.length > 0 && (
              <span style={styles.badge}>{cause.controls.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active cause panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelInfo}>
            <h3 style={styles.panelTitle}>Causa {activeCause + 1}</h3>
            <p style={styles.panelSubtitle}>
              {formData.causes[activeCause].label || "(Sin descripción)"}
            </p>
          </div>
          <button
            onClick={() => addControl(activeCause)}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar Control
          </button>
        </div>

        {(!formData.causes[activeCause].controls ||
          formData.causes[activeCause].controls.length === 0) ? (
          <div style={styles.emptyControls}>
            <p style={styles.emptyText}>No hay controles preventivos para esta causa</p>
            <button onClick={() => addControl(activeCause)} style={styles.emptyLink}>
              Agregar primer control
            </button>
          </div>
        ) : (
          <div style={styles.controlsList}>
            {formData.causes[activeCause].controls.map((control, controlIndex) => (
              <div key={controlIndex} style={styles.controlItem}>
                <span style={styles.controlNumber}>{controlIndex + 1}</span>
                <input
                  type="text"
                  value={control.label}
                  onChange={(e) => updateControl(activeCause, controlIndex, e.target.value)}
                  placeholder="Nombre del control preventivo..."
                  style={styles.controlInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3B82F6";
                    e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => removeControl(activeCause, controlIndex)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  title="Eliminar control"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <h4 style={styles.summaryTitle}>Resumen de controles por causa:</h4>
        <div style={styles.summaryGrid}>
          {formData.causes.map((cause, index) => (
            <div key={index} style={styles.summaryItem}>
              <div style={styles.summaryNumber}>{cause.controls?.length || 0}</div>
              <div style={styles.summaryLabel}>Causa {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3Controls;
