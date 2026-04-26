// client/src/components/wizard/EscalationModal.jsx
import React, { useState } from "react";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    marginTop: "4px",
  },
  closeButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#6B7280",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
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
    lineHeight: "1.5",
  },
  field: {
    marginBottom: "24px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  existingEscalations: {
    marginBottom: "24px",
  },
  escalationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
    marginBottom: "8px",
    border: "1px solid #E5E7EB",
  },
  escalationLabel: {
    flex: 1,
    fontSize: "14px",
    color: "#374151",
  },
  deleteButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#DC2626",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    fontWeight: "600",
    fontSize: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  saveButton: {
    padding: "12px 24px",
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  emptyState: {
    textAlign: "center",
    padding: "24px",
    color: "#9CA3AF",
    fontSize: "14px",
  },
};

const EscalationModal = ({
  isOpen,
  onClose,
  type, // 'control' or 'mitigation'
  itemLabel, // The control or mitigation label
  existingEscalations = [],
  onAdd,
  onDelete,
}) => {
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const isControl = type === "control";
  const title = isControl ? "Factor de Escalamiento - Control" : "Factor de Escalamiento - Mitigación";
  const escalationLabel = isControl ? "Nueva Amenaza" : "Nueva Consecuencia";
  const placeholder = isControl
    ? "Ej: Falla del sistema de respaldo"
    : "Ej: Sin cobertura de seguro";
  const infoText = isControl
    ? "Si este control preventivo falla, puede generar una nueva amenaza. El factor de escalamiento representa esa nueva amenaza que se visualizará conectada al control en el diagrama."
    : "Si esta medida de mitigación falla, puede generar una nueva consecuencia. El factor de escalamiento representa esa nueva consecuencia que se visualizará conectada a la mitigación en el diagrama.";

  const handleAdd = async () => {
    if (!newLabel.trim()) return;

    try {
      setSaving(true);
      await onAdd(newLabel.trim());
      setNewLabel("");
    } catch (error) {
      console.error("Error adding escalation:", error);
      alert("Error al agregar el factor de escalamiento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (escalationId) => {
    if (!confirm("¿Estás seguro de eliminar este factor de escalamiento?")) return;

    try {
      await onDelete(escalationId);
    } catch (error) {
      console.error("Error deleting escalation:", error);
      alert("Error al eliminar el factor de escalamiento");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newLabel.trim()) {
      handleAdd();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.subtitle}>{itemLabel}</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>⚠️</span>
          <p style={styles.infoText}>{infoText}</p>
        </div>

        {/* Existing escalations */}
        {existingEscalations.length > 0 && (
          <div style={styles.existingEscalations}>
            <label style={styles.label}>Factores de escalamiento existentes:</label>
            {existingEscalations.map((esc) => (
              <div key={esc.id} style={styles.escalationItem}>
                <span style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: isControl ? "#FEE2E2" : "#FFEDD5",
                  color: isControl ? "#DC2626" : "#EA580C",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}>
                  ⚡
                </span>
                <span style={styles.escalationLabel}>{esc.label}</span>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(esc.id)}
                  title="Eliminar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {existingEscalations.length === 0 && (
          <div style={styles.emptyState}>
            No hay factores de escalamiento agregados
          </div>
        )}

        {/* Add new */}
        <div style={styles.field}>
          <label style={styles.label}>{escalationLabel}</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = "#4F46E5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cerrar
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(!newLabel.trim() || saving ? styles.disabledButton : {}),
            }}
            onClick={handleAdd}
            disabled={!newLabel.trim() || saving}
          >
            {saving ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscalationModal;
