// client/src/components/wizard/Step5Mitigations.jsx
import React, { useState } from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
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
    color: "#92400E",
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
    backgroundColor: "#FFF7ED",
    color: "#9A3412",
  },
  tabInactive: {
    backgroundColor: "transparent",
    color: "#6B7280",
  },
  badge: {
    backgroundColor: "#F97316",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  panel: {
    backgroundColor: "#FFF7ED",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #FDBA74",
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
    color: "#9A3412",
    marginBottom: "4px",
  },
  panelSubtitle: {
    fontSize: "14px",
    color: "#EA580C",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#F97316",
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
    border: "2px dashed #FDBA74",
  },
  emptyText: {
    fontSize: "14px",
    color: "#9CA3AF",
    marginBottom: "12px",
  },
  emptyLink: {
    color: "#F97316",
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
    border: "1px solid #FDBA74",
  },
  controlNumber: {
    width: "24px",
    height: "24px",
    backgroundColor: "#FFEDD5",
    color: "#9A3412",
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
    color: "#F97316",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#6B7280",
  },
  finalSummary: {
    backgroundColor: "#ECFDF5",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #A7F3D0",
  },
  finalSummaryTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#065F46",
    marginBottom: "16px",
  },
  finalSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    textAlign: "center",
  },
  finalSummaryItem: {
    padding: "16px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    border: "1px solid #D1FAE5",
  },
  finalSummaryNumber: {
    fontSize: "28px",
    fontWeight: "700",
  },
  finalSummaryLabel: {
    fontSize: "12px",
    color: "#6B7280",
    marginTop: "4px",
  },
  finalSummaryNote: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#047857",
  },
};

const Step5Mitigations = ({ formData, updateFormData }) => {
  const [activeConsequence, setActiveConsequence] = useState(0);

  const addMitigation = (consequenceIndex) => {
    const newConsequences = [...formData.consequences];
    newConsequences[consequenceIndex] = {
      ...newConsequences[consequenceIndex],
      mitigations: [
        ...(newConsequences[consequenceIndex].mitigations || []),
        { label: "" },
      ],
    };
    updateFormData({ consequences: newConsequences });
  };

  const updateMitigation = (consequenceIndex, mitigationIndex, value) => {
    const newConsequences = [...formData.consequences];
    newConsequences[consequenceIndex].mitigations[mitigationIndex] = { label: value };
    updateFormData({ consequences: newConsequences });
  };

  const removeMitigation = (consequenceIndex, mitigationIndex) => {
    const newConsequences = [...formData.consequences];
    newConsequences[consequenceIndex].mitigations = newConsequences[
      consequenceIndex
    ].mitigations.filter((_, i) => i !== mitigationIndex);
    updateFormData({ consequences: newConsequences });
  };

  const getTotalControls = () => {
    return formData.causes.reduce((sum, c) => sum + (c.controls?.length || 0), 0);
  };

  const getTotalMitigations = () => {
    return formData.consequences.reduce((sum, c) => sum + (c.mitigations?.length || 0), 0);
  };

  if (formData.consequences.length === 0) {
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
        <h3 style={styles.warningTitle}>No hay consecuencias definidas</h3>
        <p style={styles.warningText}>
          Debes agregar al menos una consecuencia en el paso anterior
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <div>
          <strong>¿Qué son las mitigaciones?</strong>
          <p style={styles.infoText}>
            Las mitigaciones son medidas o acciones que reducen el impacto de las consecuencias si el evento de riesgo ocurre.
            En el diagrama aparecerán como rectángulos <strong>amarillos</strong> entre el evento central y las consecuencias.
          </p>
        </div>
      </div>

      <p style={styles.description}>
        Agrega medidas de mitigación para cada consecuencia. Estas medidas ayudan a
        reducir el impacto si el evento de riesgo ocurre.
      </p>

      {/* Tabs */}
      <div style={styles.tabs}>
        {formData.consequences.map((consequence, index) => (
          <button
            key={index}
            onClick={() => setActiveConsequence(index)}
            style={{
              ...styles.tab,
              ...(activeConsequence === index ? styles.tabActive : styles.tabInactive),
            }}
            onMouseEnter={(e) => {
              if (activeConsequence !== index) {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              if (activeConsequence !== index) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            Conseq. {index + 1}
            {consequence.mitigations?.length > 0 && (
              <span style={styles.badge}>{consequence.mitigations.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active consequence panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelInfo}>
            <h3 style={styles.panelTitle}>Consecuencia {activeConsequence + 1}</h3>
            <p style={styles.panelSubtitle}>
              {formData.consequences[activeConsequence].label || "(Sin descripción)"}
            </p>
          </div>
          <button
            onClick={() => addMitigation(activeConsequence)}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EA580C"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F97316"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar Mitigación
          </button>
        </div>

        {(!formData.consequences[activeConsequence].mitigations ||
          formData.consequences[activeConsequence].mitigations.length === 0) ? (
          <div style={styles.emptyControls}>
            <p style={styles.emptyText}>No hay medidas de mitigación para esta consecuencia</p>
            <button onClick={() => addMitigation(activeConsequence)} style={styles.emptyLink}>
              Agregar primera mitigación
            </button>
          </div>
        ) : (
          <div style={styles.controlsList}>
            {formData.consequences[activeConsequence].mitigations.map((mitigation, mitigationIndex) => (
              <div key={mitigationIndex} style={styles.controlItem}>
                <span style={styles.controlNumber}>{mitigationIndex + 1}</span>
                <input
                  type="text"
                  value={mitigation.label}
                  onChange={(e) => updateMitigation(activeConsequence, mitigationIndex, e.target.value)}
                  placeholder="Nombre de la medida de mitigación..."
                  style={styles.controlInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.boxShadow = "0 0 0 2px rgba(249, 115, 22, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => removeMitigation(activeConsequence, mitigationIndex)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  title="Eliminar mitigación"
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

      {/* Summary per consequence */}
      <div style={styles.summary}>
        <h4 style={styles.summaryTitle}>Mitigaciones por consecuencia:</h4>
        <div style={styles.summaryGrid}>
          {formData.consequences.map((consequence, index) => (
            <div key={index} style={styles.summaryItem}>
              <div style={styles.summaryNumber}>{consequence.mitigations?.length || 0}</div>
              <div style={styles.summaryLabel}>Conseq. {index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final summary */}
      <div style={styles.finalSummary}>
        <h4 style={styles.finalSummaryTitle}>Resumen completo del diagrama</h4>
        <div style={styles.finalSummaryGrid}>
          <div style={styles.finalSummaryItem}>
            <div style={{ ...styles.finalSummaryNumber, color: "#3B82F6" }}>
              {formData.causes.length}
            </div>
            <div style={styles.finalSummaryLabel}>Causas</div>
          </div>
          <div style={styles.finalSummaryItem}>
            <div style={{ ...styles.finalSummaryNumber, color: "#60A5FA" }}>
              {getTotalControls()}
            </div>
            <div style={styles.finalSummaryLabel}>Controles</div>
          </div>
          <div style={styles.finalSummaryItem}>
            <div style={{ ...styles.finalSummaryNumber, color: "#F97316" }}>
              {formData.consequences.length}
            </div>
            <div style={styles.finalSummaryLabel}>Consecuencias</div>
          </div>
          <div style={styles.finalSummaryItem}>
            <div style={{ ...styles.finalSummaryNumber, color: "#FB923C" }}>
              {getTotalMitigations()}
            </div>
            <div style={styles.finalSummaryLabel}>Mitigaciones</div>
          </div>
        </div>
        <p style={styles.finalSummaryNote}>
          Haz clic en "Guardar Diagrama" para completar el proceso
        </p>
      </div>
    </div>
  );
};

export default Step5Mitigations;
