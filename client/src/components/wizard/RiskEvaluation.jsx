// client/src/components/wizard/RiskEvaluation.jsx
import React, { useState, useEffect } from "react";
import { evaluationsApi } from "../../services/api";

const PROBABILITY_LEVELS = [
  { level: 1, name: "Improbable", description: "Muy improbable que ocurra" },
  { level: 2, name: "Remoto", description: "Poco probable que ocurra" },
  { level: 3, name: "Ocasional", description: "Puede ocurrir ocasionalmente" },
  { level: 4, name: "Probable", description: "Es probable que ocurra" },
  { level: 5, name: "Frecuente", description: "Ocurre con frecuencia" },
];

const SEVERITY_LEVELS = [
  { level: 1, name: "Insignificante", description: "Sin impacto significativo" },
  { level: 2, name: "Menor", description: "Impacto menor, fácil de manejar" },
  { level: 3, name: "Mayor", description: "Impacto considerable" },
  { level: 4, name: "Peligroso", description: "Impacto severo" },
  { level: 5, name: "Catastrófico", description: "Impacto catastrófico" },
];

const TOLERABILITY_MATRIX = {
  5: { 1: "Tolerable", 2: "Intolerable", 3: "Intolerable", 4: "Inaceptable", 5: "Inaceptable" },
  4: { 1: "Aceptable", 2: "Tolerable", 3: "Intolerable", 4: "Intolerable", 5: "Inaceptable" },
  3: { 1: "Aceptable", 2: "Tolerable", 3: "Tolerable", 4: "Intolerable", 5: "Intolerable" },
  2: { 1: "Aceptable", 2: "Aceptable", 3: "Tolerable", 4: "Tolerable", 5: "Intolerable" },
  1: { 1: "Aceptable", 2: "Aceptable", 3: "Aceptable", 4: "Tolerable", 5: "Tolerable" },
};

const TOLERABILITY_COLORS = {
  Aceptable: { bg: "#DCFCE7", border: "#22C55E", text: "#166534" },
  Tolerable: { bg: "#FEF9C3", border: "#EAB308", text: "#854D0E" },
  Intolerable: { bg: "#FFEDD5", border: "#F97316", text: "#9A3412" },
  Inaceptable: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
};

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
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  icon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "28px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.5",
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  optionsGrid: {
    display: "grid",
    gap: "8px",
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  optionSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  optionNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  optionNumberSelected: {
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  optionDesc: {
    fontSize: "12px",
    color: "#6B7280",
    marginTop: "2px",
  },
  resultBox: {
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "24px",
  },
  resultLabel: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  resultValue: {
    fontSize: "28px",
    fontWeight: "700",
  },
  resultDetails: {
    fontSize: "13px",
    marginTop: "12px",
    opacity: 0.8,
  },
  matrixPreview: {
    marginTop: "16px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "auto repeat(5, 1fr)",
    gap: "3px",
    fontSize: "10px",
  },
  matrixHeader: {
    padding: "6px 4px",
    textAlign: "center",
    fontWeight: "600",
    color: "#6B7280",
  },
  matrixCell: {
    padding: "8px 4px",
    textAlign: "center",
    borderRadius: "4px",
    fontWeight: "500",
    color: "#FFFFFF",
    fontSize: "9px",
  },
  matrixCellHighlight: {
    border: "3px solid #111827",
    transform: "scale(1.1)",
    zIndex: 1,
  },
  notesField: {
    marginBottom: "24px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "80px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  skipButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#6B7280",
    fontWeight: "500",
    fontSize: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  saveButton: {
    padding: "12px 32px",
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    flex: 1,
    maxWidth: "200px",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

const RiskEvaluation = ({
  diagramId,
  isOpen,
  onClose,
  onSaved,
  evaluationType = "before", // 'before' or 'after'
  onSkip,
  showSkip = true,
  pendingMode = false, // If true, don't save to API, just return data via onSaved
  existingEvaluation = null, // For editing existing evaluations
}) => {
  const [probability, setProbability] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = existingEvaluation !== null;

  // Reset/load when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingEvaluation) {
        // Load existing values for editing
        setProbability(existingEvaluation.probability);
        setSeverity(existingEvaluation.severity);
        setNotes(existingEvaluation.notes || "");
      } else {
        // Reset for new evaluation
        setProbability(null);
        setSeverity(null);
        setNotes("");
      }
    }
  }, [isOpen, existingEvaluation]);

  const getTolerability = () => {
    if (probability && severity) {
      return TOLERABILITY_MATRIX[probability]?.[severity];
    }
    return null;
  };

  const handleSave = async () => {
    if (!probability || !severity) return;

    const evalData = {
      evaluationType,
      probability,
      severity,
      notes,
    };

    // In pending mode, just return the data without saving
    if (pendingMode) {
      if (onSaved) onSaved(evalData);
      onClose();
      return;
    }

    try {
      setSaving(true);

      if (isEditing && existingEvaluation.id) {
        // Update existing evaluation
        await evaluationsApi.update(existingEvaluation.id, {
          probability,
          severity,
          notes,
        });
      } else {
        // Create new evaluation
        await evaluationsApi.create(diagramId, evalData);
      }

      if (onSaved) onSaved(evalData);
      onClose();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("Error al guardar la evaluación. Asegúrese de que la base de datos esté actualizada.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    onClose();
  };

  const tolerability = getTolerability();
  const tolerabilityStyle = tolerability ? TOLERABILITY_COLORS[tolerability] : null;

  const isBefore = evaluationType === "before";
  const titleText = isEditing
    ? (isBefore ? "Actualizar Evaluación Inicial" : "Actualizar Evaluación Residual")
    : (isBefore ? "Evaluación de Riesgo Inicial" : "Evaluación de Riesgo Residual");
  const subtitleText = isBefore
    ? "Evalúe el nivel de riesgo ANTES de aplicar los controles preventivos y medidas de mitigación."
    : "Evalúe el nivel de riesgo DESPUÉS de considerar los controles preventivos y medidas de mitigación implementados.";
  const iconBg = isBefore ? "#FEF3C7" : "#D1FAE5";
  const iconEmoji = isBefore ? "⚠️" : "🛡️";
  const saveButtonText = isEditing ? "Actualizar Evaluación" : "Guardar Evaluación";

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#F3F4F6",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B7280",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E5E7EB";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div style={{ ...styles.icon, backgroundColor: iconBg }}>
            {iconEmoji}
          </div>
          <h2 style={styles.title}>{titleText}</h2>
          <p style={styles.subtitle}>{subtitleText}</p>
        </div>

        {/* Probability Selection */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span>📊</span> Probabilidad de ocurrencia
          </h3>
          <div style={styles.optionsGrid}>
            {PROBABILITY_LEVELS.map((p) => (
              <button
                key={p.level}
                style={{
                  ...styles.optionButton,
                  ...(probability === p.level ? styles.optionSelected : {}),
                }}
                onClick={() => setProbability(p.level)}
              >
                <span style={{
                  ...styles.optionNumber,
                  ...(probability === p.level ? styles.optionNumberSelected : {}),
                }}>
                  {p.level}
                </span>
                <div style={styles.optionContent}>
                  <div style={styles.optionName}>{p.name}</div>
                  <div style={styles.optionDesc}>{p.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selection */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span>💥</span> Gravedad del impacto
          </h3>
          <div style={styles.optionsGrid}>
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.level}
                style={{
                  ...styles.optionButton,
                  ...(severity === s.level ? styles.optionSelected : {}),
                }}
                onClick={() => setSeverity(s.level)}
              >
                <span style={{
                  ...styles.optionNumber,
                  ...(severity === s.level ? styles.optionNumberSelected : {}),
                }}>
                  {s.level}
                </span>
                <div style={styles.optionContent}>
                  <div style={styles.optionName}>{s.name}</div>
                  <div style={styles.optionDesc}>{s.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {tolerability && (
          <div style={{
            ...styles.resultBox,
            backgroundColor: tolerabilityStyle.bg,
            border: `2px solid ${tolerabilityStyle.border}`,
          }}>
            <div style={{ ...styles.resultLabel, color: tolerabilityStyle.text }}>
              Nivel de Tolerabilidad:
            </div>
            <div style={{ ...styles.resultValue, color: tolerabilityStyle.text }}>
              {tolerability}
            </div>
            <div style={{ ...styles.resultDetails, color: tolerabilityStyle.text }}>
              Probabilidad: {PROBABILITY_LEVELS.find(p => p.level === probability)?.name} ({probability}) |
              Gravedad: {SEVERITY_LEVELS.find(s => s.level === severity)?.name} ({severity})
            </div>
          </div>
        )}

        {/* Matrix Preview */}
        {(probability || severity) && (
          <div style={styles.matrixPreview}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "12px", textAlign: "center" }}>
              Matriz de Tolerabilidad SMS
            </div>
            <div style={styles.matrixGrid}>
              {/* Header row */}
              <div style={styles.matrixHeader}>P\G</div>
              {SEVERITY_LEVELS.map(s => (
                <div key={s.level} style={{
                  ...styles.matrixHeader,
                  backgroundColor: severity === s.level ? "#E5E7EB" : "transparent",
                  borderRadius: "4px",
                }}>
                  {s.level}
                </div>
              ))}

              {/* Data rows */}
              {[...PROBABILITY_LEVELS].reverse().map(p => (
                <React.Fragment key={p.level}>
                  <div style={{
                    ...styles.matrixHeader,
                    backgroundColor: probability === p.level ? "#E5E7EB" : "transparent",
                    borderRadius: "4px",
                  }}>
                    {p.level}
                  </div>
                  {SEVERITY_LEVELS.map(s => {
                    const tol = TOLERABILITY_MATRIX[p.level][s.level];
                    const isSelected = probability === p.level && severity === s.level;
                    return (
                      <div
                        key={`${p.level}-${s.level}`}
                        style={{
                          ...styles.matrixCell,
                          backgroundColor: TOLERABILITY_COLORS[tol].border,
                          ...(isSelected ? styles.matrixCellHighlight : {}),
                        }}
                      >
                        {tol.substring(0, 3)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={styles.notesField}>
          <label style={styles.label}>Observaciones (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregue notas o justificación de la evaluación..."
            style={styles.textarea}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {showSkip && (
            <button style={styles.skipButton} onClick={handleSkip}>
              Omitir
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            style={{
              ...styles.saveButton,
              ...(!probability || !severity || saving ? styles.disabledButton : {}),
            }}
            onClick={handleSave}
            disabled={!probability || !severity || saving}
          >
            {saving ? "Guardando..." : saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskEvaluation;
