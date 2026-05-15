// client/src/components/wizard/RiskEvaluation.jsx
// Modal de evaluación de riesgo conforme al Manual SMS / OACI:
//   - Probabilidad: 1..5 (Sumamente improbable .. Frecuente)
//   - Gravedad:     A..E (Catastrófico .. Insignificante)
//   - Índice de riesgo: combinación "<probabilidad><gravedad>" (ej. "4B")
//   - Categoría:    Intolerable / Tolerable / Aceptable
import React, { useState, useEffect } from "react";
import { evaluationsApi } from "../../services/api";

// --- Catálogos (espejo del backend en server/src/lib/tolerability.js) ---

const PROBABILITY_LEVELS = [
  { level: 5, name: "Frecuente",            description: "Es probable que suceda muchas veces (ha ocurrido frecuentemente)" },
  { level: 4, name: "Ocasional",            description: "Es probable que suceda algunas veces (ha ocurrido con poca frecuencia)" },
  { level: 3, name: "Remoto",               description: "Es poco probable que ocurra, pero no imposible (rara vez ha ocurrido)" },
  { level: 2, name: "Improbable",           description: "Es muy poco probable que ocurra (no se sabe que haya ocurrido)" },
  { level: 1, name: "Sumamente improbable", description: "Es casi inconcebible que el suceso ocurra" },
];

const SEVERITY_LEVELS = [
  { code: "A", name: "Catastrófico",  description: "Aeronave o equipo destruidos. Varias muertes." },
  { code: "B", name: "Peligroso",     description: "Gran reducción de los márgenes de seguridad operacional, lesiones graves, daños importantes al equipo." },
  { code: "C", name: "Grave",         description: "Reducción importante de los márgenes de seguridad operacional, incidente grave, lesiones a las personas." },
  { code: "D", name: "Leve",          description: "Molestias, limitaciones operacionales, uso de procedimientos de emergencia, incidente leve." },
  { code: "E", name: "Insignificante", description: "Pocas consecuencias." },
];

const RISK_INDEX_MATRIX = {
  5: { A: "Intolerable", B: "Intolerable", C: "Intolerable", D: "Tolerable",  E: "Tolerable"  },
  4: { A: "Intolerable", B: "Intolerable", C: "Tolerable",   D: "Tolerable",  E: "Tolerable"  },
  3: { A: "Intolerable", B: "Tolerable",   C: "Tolerable",   D: "Tolerable",  E: "Aceptable"  },
  2: { A: "Tolerable",   B: "Tolerable",   C: "Tolerable",   D: "Aceptable",  E: "Aceptable"  },
  1: { A: "Tolerable",   B: "Aceptable",   C: "Aceptable",   D: "Aceptable",  E: "Aceptable"  },
};

const TOLERABILITY_COLORS = {
  Intolerable: { bg: "#FEE2E2", border: "#DC2626", text: "#7F1D1D", solid: "#DC2626" },
  Tolerable:   { bg: "#FFEDD5", border: "#EA580C", text: "#7C2D12", solid: "#F97316" },
  Aceptable:   { bg: "#DCFCE7", border: "#16A34A", text: "#14532D", solid: "#22C55E" },
};

const RISK_ACTIONS = {
  Intolerable: "Tomar medidas inmediatas para mitigar el riesgo o suspender la actividad. Realizar la mitigación de riesgos de seguridad operacional prioritaria para garantizar que haya controles preventivos o adicionales o mejorados para reducir el índice de riesgos al rango tolerable.",
  Tolerable:   "Puede tolerarse sobre la base de la mitigación de riesgos de seguridad operacional. Puede necesitar una decisión de gestión para aceptar el riesgo.",
  Aceptable:   "Aceptable tal cual. No se necesita una mitigación de riesgos posterior.",
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "16px",
  },
  modal: {
    position: "relative", backgroundColor: "#FFFFFF", borderRadius: "16px",
    padding: "32px", maxWidth: "720px", width: "100%",
    maxHeight: "92vh", overflow: "auto",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  },
  header: { textAlign: "center", marginBottom: "24px" },
  icon: {
    width: "64px", height: "64px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px", fontSize: "28px",
  },
  title: { fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "8px" },
  subtitle: { fontSize: "14px", color: "#6B7280", lineHeight: "1.5" },
  section: { marginBottom: "24px" },
  sectionTitle: {
    fontSize: "14px", fontWeight: "600", color: "#374151",
    marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px",
  },
  optionsGrid: { display: "grid", gap: "8px" },
  optionButton: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 16px", borderRadius: "10px",
    border: "2px solid #E5E7EB", backgroundColor: "#FFFFFF",
    cursor: "pointer", textAlign: "left", transition: "all 0.2s",
  },
  optionSelected: { borderColor: "#4F46E5", backgroundColor: "#EEF2FF" },
  optionBadge: {
    minWidth: "36px", height: "36px", padding: "0 8px", borderRadius: "8px",
    backgroundColor: "#F3F4F6", color: "#374151",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "15px", flexShrink: 0,
  },
  optionBadgeSelected: { backgroundColor: "#4F46E5", color: "#FFFFFF" },
  optionContent: { flex: 1 },
  optionName: { fontSize: "14px", fontWeight: "600", color: "#111827" },
  optionDesc: { fontSize: "12px", color: "#6B7280", marginTop: "2px", lineHeight: "1.4" },
  resultBox: {
    padding: "20px", borderRadius: "12px",
    marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px",
  },
  resultIndex: {
    fontSize: "44px", fontWeight: "800", lineHeight: "1",
    minWidth: "90px", textAlign: "center",
    padding: "12px 8px", borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  resultBody: { flex: 1 },
  resultCategory: { fontSize: "20px", fontWeight: "800", letterSpacing: "0.05em" },
  resultMeta: { fontSize: "12px", marginTop: "4px", opacity: 0.85 },
  resultAction: { fontSize: "12px", marginTop: "8px", lineHeight: "1.45" },
  matrixWrap: {
    marginBottom: "20px", padding: "16px",
    backgroundColor: "#F9FAFB", borderRadius: "10px",
  },
  matrixTitle: {
    fontSize: "12px", fontWeight: "700", color: "#374151",
    marginBottom: "10px", textAlign: "center", letterSpacing: "0.05em",
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(140px, auto) repeat(5, 1fr)",
    gap: "3px", fontSize: "11px",
  },
  matrixCornerHeader: {
    padding: "6px 8px", textAlign: "center",
    fontWeight: "700", color: "#6B7280", fontSize: "10px",
    backgroundColor: "#F3F4F6", borderRadius: "6px",
  },
  matrixColHeader: {
    padding: "6px 4px", textAlign: "center",
    fontWeight: "700", color: "#374151", fontSize: "11px",
    backgroundColor: "#F3F4F6", borderRadius: "6px",
  },
  matrixRowHeader: {
    padding: "8px 10px", textAlign: "left",
    fontWeight: "600", color: "#374151", fontSize: "11px",
    backgroundColor: "#F3F4F6", borderRadius: "6px",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px",
  },
  matrixCell: {
    padding: "10px 4px", textAlign: "center",
    borderRadius: "5px", fontWeight: "700",
    color: "#FFFFFF", fontSize: "11px",
    border: "2px solid transparent",
  },
  matrixCellHighlight: { borderColor: "#111827", boxShadow: "0 0 0 2px #FFFFFF inset" },
  legendRow: {
    display: "flex", justifyContent: "center", gap: "16px",
    marginTop: "12px", flexWrap: "wrap",
  },
  legendItem: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "11px", color: "#374151", fontWeight: "600",
  },
  legendSwatch: { width: "14px", height: "14px", borderRadius: "3px" },
  notesField: { marginBottom: "20px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px", display: "block" },
  textarea: {
    width: "100%", padding: "12px 16px", fontSize: "14px",
    border: "2px solid #E5E7EB", borderRadius: "10px",
    outline: "none", fontFamily: "inherit",
    resize: "vertical", minHeight: "80px",
  },
  actions: { display: "flex", justifyContent: "space-between", gap: "12px" },
  skipButton: {
    padding: "12px 24px", backgroundColor: "transparent",
    color: "#6B7280", fontWeight: "500", fontSize: "14px",
    borderRadius: "10px", border: "none", cursor: "pointer",
  },
  saveButton: {
    padding: "12px 32px", backgroundColor: "#4F46E5",
    color: "#FFFFFF", fontWeight: "600", fontSize: "14px",
    borderRadius: "10px", border: "none", cursor: "pointer",
    flex: 1, maxWidth: "240px",
  },
  disabledButton: { opacity: 0.5, cursor: "not-allowed" },
};

const RiskEvaluation = ({
  diagramId,
  isOpen,
  onClose,
  onSaved,
  evaluationType = "before",
  onSkip,
  showSkip = true,
  pendingMode = false,
  existingEvaluation = null,
}) => {
  const [probability, setProbability] = useState(null);
  const [severity, setSeverity] = useState(null); // letra A..E
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = existingEvaluation !== null;

  useEffect(() => {
    if (!isOpen) return;
    if (existingEvaluation) {
      setProbability(existingEvaluation.probability);
      setSeverity(existingEvaluation.severity);
      setNotes(existingEvaluation.notes || "");
    } else {
      setProbability(null);
      setSeverity(null);
      setNotes("");
    }
  }, [isOpen, existingEvaluation]);

  const tolerability =
    probability && severity ? RISK_INDEX_MATRIX[probability]?.[severity] : null;
  const riskIndex = probability && severity ? `${probability}${severity}` : null;
  const tolStyle = tolerability ? TOLERABILITY_COLORS[tolerability] : null;

  const probName = PROBABILITY_LEVELS.find((p) => p.level === probability)?.name;
  const sevName = SEVERITY_LEVELS.find((s) => s.code === severity)?.name;

  const handleSave = async () => {
    if (!probability || !severity) return;

    const evalData = { evaluationType, probability, severity, notes };

    if (pendingMode) {
      if (onSaved) onSaved(evalData);
      onClose();
      return;
    }

    try {
      setSaving(true);
      if (isEditing && existingEvaluation.id) {
        await evaluationsApi.update(existingEvaluation.id, { probability, severity, notes });
      } else {
        await evaluationsApi.create(diagramId, evalData);
      }
      if (onSaved) onSaved(evalData);
      onClose();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("Error al guardar la matriz de riesgo. Asegúrese de que la base de datos esté actualizada (npm run db:reset).");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    onClose();
  };

  if (!isOpen) return null;

  const isBefore = evaluationType === "before";
  const titleText = isEditing
    ? (isBefore ? "Actualizar Matriz de Riesgo Inicial" : "Actualizar Matriz de Riesgo Residual")
    : (isBefore ? "Matriz de Riesgo Inicial" : "Matriz de Riesgo Residual");
  const subtitleText = isBefore
    ? "Determine el nivel de riesgo ANTES de aplicar los controles preventivos y medidas de mitigación."
    : "Determine el nivel de riesgo DESPUÉS de considerar los controles preventivos y medidas de mitigación implementados.";
  const iconBg = isBefore ? "#FEF3C7" : "#D1FAE5";
  const iconEmoji = isBefore ? "⚠️" : "🛡️";
  const saveButtonText = isEditing ? "Actualizar Matriz" : "Guardar Matriz";

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            width: "32px", height: "32px", borderRadius: "50%",
            border: "none", backgroundColor: "#F3F4F6", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6B7280",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div style={styles.header}>
          <div style={{ ...styles.icon, backgroundColor: iconBg }}>{iconEmoji}</div>
          <h2 style={styles.title}>{titleText}</h2>
          <p style={styles.subtitle}>{subtitleText}</p>
        </div>

        {/* Probabilidad */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span>📊</span> Probabilidad de ocurrencia
          </h3>
          <div style={styles.optionsGrid}>
            {PROBABILITY_LEVELS.map((p) => (
              <button
                key={p.level}
                style={{ ...styles.optionButton, ...(probability === p.level ? styles.optionSelected : {}) }}
                onClick={() => setProbability(p.level)}
              >
                <span style={{ ...styles.optionBadge, ...(probability === p.level ? styles.optionBadgeSelected : {}) }}>
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

        {/* Gravedad */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span>💥</span> Gravedad del impacto
          </h3>
          <div style={styles.optionsGrid}>
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.code}
                style={{ ...styles.optionButton, ...(severity === s.code ? styles.optionSelected : {}) }}
                onClick={() => setSeverity(s.code)}
              >
                <span style={{ ...styles.optionBadge, ...(severity === s.code ? styles.optionBadgeSelected : {}) }}>
                  {s.code}
                </span>
                <div style={styles.optionContent}>
                  <div style={styles.optionName}>{s.name}</div>
                  <div style={styles.optionDesc}>{s.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {tolerability && (
          <div style={{
            ...styles.resultBox,
            backgroundColor: tolStyle.bg,
            border: `2px solid ${tolStyle.border}`,
          }}>
            <div style={{ ...styles.resultIndex, color: tolStyle.text }}>{riskIndex}</div>
            <div style={styles.resultBody}>
              <div style={{ ...styles.resultCategory, color: tolStyle.text }}>
                {tolerability.toUpperCase()}
              </div>
              <div style={{ ...styles.resultMeta, color: tolStyle.text }}>
                Probabilidad: {probName} ({probability}) · Gravedad: {sevName} ({severity})
              </div>
              <div style={{ ...styles.resultAction, color: tolStyle.text }}>
                {RISK_ACTIONS[tolerability]}
              </div>
            </div>
          </div>
        )}

        {/* Matriz */}
        {(probability || severity) && (
          <div style={styles.matrixWrap}>
            <div style={styles.matrixTitle}>
              MATRIZ DE EVALUACIÓN DE RIESGO — SMS / OACI
            </div>
            <div style={styles.matrixGrid}>
              <div style={styles.matrixCornerHeader}>
                Probabilidad ↓ &nbsp;/&nbsp; Gravedad →
              </div>
              {SEVERITY_LEVELS.map((s) => (
                <div key={s.code} style={{
                  ...styles.matrixColHeader,
                  outline: severity === s.code ? "2px solid #111827" : "none",
                }}>
                  {s.code}<br />
                  <span style={{ fontWeight: 500, fontSize: "9px", color: "#6B7280" }}>{s.name}</span>
                </div>
              ))}

              {PROBABILITY_LEVELS.map((p) => (
                <React.Fragment key={p.level}>
                  <div style={{
                    ...styles.matrixRowHeader,
                    outline: probability === p.level ? "2px solid #111827" : "none",
                  }}>
                    <span>{p.name}</span>
                    <span style={{ color: "#6B7280" }}>{p.level}</span>
                  </div>
                  {SEVERITY_LEVELS.map((s) => {
                    const tol = RISK_INDEX_MATRIX[p.level][s.code];
                    const c = TOLERABILITY_COLORS[tol];
                    const isSelected = probability === p.level && severity === s.code;
                    return (
                      <div
                        key={`${p.level}-${s.code}`}
                        style={{
                          ...styles.matrixCell,
                          backgroundColor: c.solid,
                          ...(isSelected ? styles.matrixCellHighlight : {}),
                        }}
                      >
                        {p.level}{s.code}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div style={styles.legendRow}>
              {["Intolerable", "Tolerable", "Aceptable"].map((cat) => (
                <div key={cat} style={styles.legendItem}>
                  <span style={{ ...styles.legendSwatch, backgroundColor: TOLERABILITY_COLORS[cat].solid }} />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div style={styles.notesField}>
          <label style={styles.label}>Observaciones (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregue notas o justificación de la matriz de riesgo..."
            style={styles.textarea}
          />
        </div>

        {/* Acciones */}
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
