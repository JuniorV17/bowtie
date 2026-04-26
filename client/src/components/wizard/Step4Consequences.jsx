// client/src/components/wizard/Step4Consequences.jsx
import React from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoBox: {
    backgroundColor: "#FFF7ED",
    border: "1px solid #FDBA74",
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
    color: "#9A3412",
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
    backgroundColor: "#F97316",
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
    backgroundColor: "#FFF7ED",
    borderRadius: "12px",
    border: "1px solid #FDBA74",
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
    backgroundColor: "#F97316",
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
    border: "2px solid #FDBA74",
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

const Step4Consequences = ({ formData, updateFormData }) => {
  const addConsequence = () => {
    updateFormData({
      consequences: [...formData.consequences, { label: "", mitigations: [] }],
    });
  };

  const updateConsequence = (index, value) => {
    const newConsequences = [...formData.consequences];
    newConsequences[index] = { ...newConsequences[index], label: value };
    updateFormData({ consequences: newConsequences });
  };

  const removeConsequence = (index) => {
    const newConsequences = formData.consequences.filter((_, i) => i !== index);
    updateFormData({ consequences: newConsequences });
  };

  const moveConsequence = (index, direction) => {
    const newConsequences = [...formData.consequences];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newConsequences.length) return;
    [newConsequences[index], newConsequences[newIndex]] = [
      newConsequences[newIndex],
      newConsequences[index],
    ];
    updateFormData({ consequences: newConsequences });
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <div>
          <strong>¿Qué son las consecuencias?</strong>
          <p style={styles.infoText}>
            Las consecuencias son los resultados o impactos negativos que pueden ocurrir si el evento de riesgo se materializa.
            En el diagrama aparecerán en el lado <strong>derecho</strong> como rectángulos naranjas.
          </p>
        </div>
      </div>

      <div style={styles.header}>
        <p style={styles.description}>
          Agrega las consecuencias potenciales que pueden resultar del evento de riesgo.
        </p>
        <button
          onClick={addConsequence}
          style={styles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EA580C"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F97316"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar Consecuencia
        </button>
      </div>

      {formData.consequences.length === 0 ? (
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
          <h3 style={styles.emptyTitle}>No hay consecuencias agregadas</h3>
          <p style={styles.emptyText}>
            Comienza agregando las consecuencias potenciales del evento de riesgo
          </p>
          <button onClick={addConsequence} style={styles.addButton}>
            Agregar primera consecuencia
          </button>
        </div>
      ) : (
        <div style={styles.itemsList}>
          {formData.consequences.map((consequence, index) => (
            <div key={index} style={styles.item}>
              <div style={styles.orderButtons}>
                <button
                  onClick={() => moveConsequence(index, -1)}
                  disabled={index === 0}
                  style={{
                    ...styles.orderButton,
                    ...(index === 0 ? styles.orderButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) e.currentTarget.style.backgroundColor = "#FFEDD5";
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
                  onClick={() => moveConsequence(index, 1)}
                  disabled={index === formData.consequences.length - 1}
                  style={{
                    ...styles.orderButton,
                    ...(index === formData.consequences.length - 1 ? styles.orderButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (index !== formData.consequences.length - 1) e.currentTarget.style.backgroundColor = "#FFEDD5";
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
                value={consequence.label}
                onChange={(e) => updateConsequence(index, e.target.value)}
                placeholder="Descripción de la consecuencia..."
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#F97316";
                  e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#FDBA74";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                onClick={() => removeConsequence(index)}
                style={styles.deleteButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                title="Eliminar consecuencia"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.consequences.length > 0 && (
        <div style={styles.hint}>
          <strong>Siguiente paso:</strong> Podrás agregar medidas de mitigación
          para cada consecuencia en el paso 5.
        </div>
      )}
    </div>
  );
};

export default Step4Consequences;
