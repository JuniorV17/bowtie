// client/src/components/wizard/WizardContainer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { diagramsApi, evaluationsApi } from "../../services/api";
import Step1Event from "./Step1Event";
import Step2Causes from "./Step2Causes";
import Step3Controls from "./Step3Controls";
import Step4Consequences from "./Step4Consequences";
import Step5Mitigations from "./Step5Mitigations";
import RiskEvaluation from "./RiskEvaluation";

// Matriz SMS / OACI — espejo del backend para mostrar la categoría en el indicador.
const RISK_INDEX_MATRIX = {
  5: { A: "Intolerable", B: "Intolerable", C: "Intolerable", D: "Tolerable",  E: "Tolerable"  },
  4: { A: "Intolerable", B: "Intolerable", C: "Tolerable",   D: "Tolerable",  E: "Tolerable"  },
  3: { A: "Intolerable", B: "Tolerable",   C: "Tolerable",   D: "Tolerable",  E: "Aceptable"  },
  2: { A: "Tolerable",   B: "Tolerable",   C: "Tolerable",   D: "Aceptable",  E: "Aceptable"  },
  1: { A: "Tolerable",   B: "Aceptable",   C: "Aceptable",   D: "Aceptable",  E: "Aceptable"  },
};
const TOLERABILITY_PALETTE = {
  Intolerable: { bg: "#FEE2E2", border: "#DC2626", text: "#7F1D1D" },
  Tolerable:   { bg: "#FFEDD5", border: "#EA580C", text: "#7C2D12" },
  Aceptable:   { bg: "#DCFCE7", border: "#16A34A", text: "#14532D" },
};

const STEPS = [
  { id: 1, name: "Evento", description: "Información del riesgo" },
  { id: 2, name: "Causas", description: "Causas potenciales" },
  { id: 3, name: "Controles", description: "Controles preventivos" },
  { id: 4, name: "Consecuencias", description: "Consecuencias potenciales" },
  { id: 5, name: "Mitigaciones", description: "Medidas de mitigación" },
];

const initialFormData = {
  title: "",
  riskName: "",
  topEvent: "",
  description: "",
  causes: [],
  consequences: [],
};

const WizardContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [loadingDiagram, setLoadingDiagram] = useState(false);
  const [error, setError] = useState(null);

  // Evaluation states
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);
  const [showBeforeEvalModal, setShowBeforeEvalModal] = useState(false);
  const [showAfterPrompt, setShowAfterPrompt] = useState(false);
  const [showAfterEvalModal, setShowAfterEvalModal] = useState(false);
  const [savedDiagramId, setSavedDiagramId] = useState(null);
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState(false);
  const [pendingBeforeEval, setPendingBeforeEval] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      loadDiagram();
    } else if (!hasShownInitialPrompt) {
      // Show initial evaluation prompt for new diagrams
      setShowInitialPrompt(true);
      setHasShownInitialPrompt(true);
    }
  }, [id, hasShownInitialPrompt, isEditing]);

  const loadDiagram = async () => {
    try {
      setLoadingDiagram(true);
      const data = await diagramsApi.getById(id);
      setFormData({
        title: data.title,
        riskName: data.riskName,
        topEvent: data.topEvent,
        description: data.description || "",
        causes: data.causes.map((c) => ({
          label: c.label,
          controls: c.controls.map((ctrl) => ({ label: ctrl.label })),
        })),
        consequences: data.consequences.map((c) => ({
          label: c.label,
          mitigations: c.mitigations.map((m) => ({ label: m.label })),
        })),
      });
    } catch (err) {
      setError("Error al cargar el diagrama");
      console.error("Error loading diagram:", err);
    } finally {
      setLoadingDiagram(false);
    }
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      let diagramId;
      if (isEditing) {
        await diagramsApi.update(id, formData);
        diagramId = id;
      } else {
        const result = await diagramsApi.create(formData);
        diagramId = result.id;
      }

      // Save pending "before" evaluation if exists
      if (pendingBeforeEval && diagramId) {
        try {
          await evaluationsApi.create(diagramId, {
            evaluationType: "before",
            probability: pendingBeforeEval.probability,
            severity: pendingBeforeEval.severity,
            notes: pendingBeforeEval.notes,
          });
        } catch (evalErr) {
          console.error("Error saving before evaluation:", evalErr);
          // Don't block the flow, just log the error
        }
      }

      // Show after-evaluation prompt
      setSavedDiagramId(diagramId);
      setShowAfterPrompt(true);
    } catch (err) {
      setError("Error al guardar. Verifica la conexión con el servidor.");
      console.error("Error saving diagram:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAfterPromptYes = () => {
    setShowAfterPrompt(false);
    setShowAfterEvalModal(true);
  };

  const handleAfterPromptNo = () => {
    setShowAfterPrompt(false);
    navigate("/");
  };

  const handleAfterEvalComplete = () => {
    setShowAfterEvalModal(false);
    navigate("/");
  };

  const handleInitialPromptYes = () => {
    setShowInitialPrompt(false);
    setShowBeforeEvalModal(true);
  };

  const handleInitialPromptNo = () => {
    setShowInitialPrompt(false);
  };

  const handleBeforeEvalSaved = (evalData) => {
    // Store the pending evaluation to save after diagram is created
    setPendingBeforeEval(evalData);
    setShowBeforeEvalModal(false);
  };

  const handleBeforeEvalSkip = () => {
    setShowBeforeEvalModal(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.riskName && formData.topEvent;
      case 2:
        return formData.causes.length > 0 && formData.causes.every((c) => c.label);
      case 3:
        return true;
      case 4:
        return formData.consequences.length > 0 && formData.consequences.every((c) => c.label);
      case 5:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    const props = { formData, updateFormData };
    switch (currentStep) {
      case 1: return <Step1Event {...props} />;
      case 2: return <Step2Causes {...props} />;
      case 3: return <Step3Controls {...props} />;
      case 4: return <Step4Consequences {...props} />;
      case 5: return <Step5Mitigations {...props} />;
      default: return null;
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#F9FAFB",
      padding: "32px 16px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    wrapper: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    backButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 12px",
      backgroundColor: "transparent",
      color: "#6B7280",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      marginBottom: "16px",
      textDecoration: "none",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "32px",
    },
    stepsContainer: {
      marginBottom: "32px",
    },
    stepsNav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepItem: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    stepButton: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "2px solid",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
      flexShrink: 0,
    },
    stepLine: {
      flex: 1,
      height: "3px",
      marginLeft: "8px",
      marginRight: "8px",
      borderRadius: "2px",
    },
    stepLabel: {
      display: "none",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      padding: "32px",
      marginBottom: "24px",
      border: "1px solid #E5E7EB",
    },
    cardHeader: {
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #F3F4F6",
    },
    stepTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "4px",
    },
    stepDescription: {
      fontSize: "14px",
      color: "#6B7280",
    },
    error: {
      padding: "16px",
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: "10px",
      marginBottom: "20px",
      color: "#B91C1C",
      fontSize: "14px",
    },
    navigation: {
      display: "flex",
      justifyContent: "space-between",
    },
    navButton: {
      padding: "12px 28px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    prevButton: {
      backgroundColor: "#F3F4F6",
      color: "#374151",
    },
    nextButton: {
      backgroundColor: "#4F46E5",
      color: "#FFFFFF",
    },
    saveButton: {
      backgroundColor: "#059669",
      color: "#FFFFFF",
    },
    disabledButton: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#F9FAFB",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid #E5E7EB",
      borderTopColor: "#4F46E5",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    promptOverlay: {
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
    promptModal: {
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "450px",
      width: "100%",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
    promptIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#FEF3C7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      fontSize: "28px",
    },
    promptTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "12px",
    },
    promptText: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: "1.6",
      marginBottom: "24px",
    },
    promptButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
    },
    promptButtonYes: {
      padding: "12px 28px",
      backgroundColor: "#4F46E5",
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: "14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
    },
    promptButtonNo: {
      padding: "12px 28px",
      backgroundColor: "#F3F4F6",
      color: "#374151",
      fontWeight: "600",
      fontSize: "14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
    },
  };

  const spinnerKeyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  if (loadingDiagram) {
    return (
      <div style={styles.loadingContainer}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "#6B7280" }}>Cargando diagrama...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.wrapper}>
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Volver al listado
        </button>

        {/* Title */}
        <h1 style={styles.title}>
          {isEditing ? "Editar Diagrama" : "Nuevo Diagrama Bowtie"}
        </h1>

        {/* Before evaluation indicator */}
        {pendingBeforeEval && (() => {
          const idx = `${pendingBeforeEval.probability}${pendingBeforeEval.severity}`;
          const cat = RISK_INDEX_MATRIX[pendingBeforeEval.probability]?.[pendingBeforeEval.severity];
          const c = TOLERABILITY_PALETTE[cat] || TOLERABILITY_PALETTE.Tolerable;
          return (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 18px",
              backgroundColor: c.bg,
              border: `1.5px solid ${c.border}`,
              borderRadius: "10px",
              marginBottom: "24px",
              fontSize: "14px",
              color: c.text,
            }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span style={{
                fontSize: "18px", fontWeight: "800", padding: "4px 10px",
                borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.6)",
                color: c.text, letterSpacing: "0.02em",
              }}>{idx}</span>
              <span style={{
                fontSize: "12px", fontWeight: "700",
                textTransform: "uppercase", letterSpacing: "0.05em",
                color: c.text,
              }}>{cat}</span>
              <span style={{ flex: 1, fontSize: "13px", color: c.text }}>
                <strong>Matriz de riesgo inicial registrada</strong> · Prob. {pendingBeforeEval.probability} · Grav. {pendingBeforeEval.severity}
              </span>
            </div>
          );
        })()}

        {/* Step indicators */}
        <div style={styles.stepsContainer}>
          <nav style={styles.stepsNav}>
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.id} style={{ ...styles.stepItem, flex: isLast ? 0 : 1 }}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    style={{
                      ...styles.stepButton,
                      backgroundColor: isActive ? "#4F46E5" : isCompleted ? "#E0E7FF" : "#FFFFFF",
                      borderColor: isActive ? "#4F46E5" : isCompleted ? "#4F46E5" : "#D1D5DB",
                      color: isActive ? "#FFFFFF" : isCompleted ? "#4F46E5" : "#9CA3AF",
                    }}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>
                  {!isLast && (
                    <div
                      style={{
                        ...styles.stepLine,
                        backgroundColor: isCompleted ? "#4F46E5" : "#E5E7EB",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Step content card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.stepTitle}>
              Paso {currentStep}: {STEPS[currentStep - 1].name}
            </h2>
            <p style={styles.stepDescription}>
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div style={styles.navigation}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{
              ...styles.navButton,
              ...styles.prevButton,
              ...(currentStep === 1 ? styles.disabledButton : {}),
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                ...styles.navButton,
                ...styles.nextButton,
                ...(!canProceed() ? styles.disabledButton : {}),
              }}
            >
              Siguiente
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              style={{
                ...styles.navButton,
                ...styles.saveButton,
                ...(loading || !canProceed() ? styles.disabledButton : {}),
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Diagrama
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Initial Evaluation Prompt Modal */}
      {showInitialPrompt && (
        <div style={styles.promptOverlay}>
          <div style={styles.promptModal}>
            <div style={styles.promptIcon}>⚠️</div>
            <h3 style={styles.promptTitle}>Matriz de Riesgo Inicial</h3>
            <p style={styles.promptText}>
              ¿Desea llenar la matriz de riesgo inicial (antes de aplicar controles)?
              <br /><br />
              Este paso es opcional y puede realizarlo después desde la vista del diagrama.
            </p>
            <div style={styles.promptButtons}>
              <button
                style={styles.promptButtonNo}
                onClick={handleInitialPromptNo}
              >
                Omitir
              </button>
              <button
                style={styles.promptButtonYes}
                onClick={handleInitialPromptYes}
              >
                Sí, llenar matriz de riesgo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* After Evaluation Prompt Modal */}
      {showAfterPrompt && (
        <div style={styles.promptOverlay}>
          <div style={styles.promptModal}>
            <div style={{ ...styles.promptIcon, backgroundColor: "#D1FAE5" }}>🛡️</div>
            <h3 style={styles.promptTitle}>¡Diagrama guardado!</h3>
            <p style={styles.promptText}>
              ¿Desea llenar la matriz de riesgo residual (después de aplicar controles)?
              <br /><br />
              Este paso es opcional y puede realizarlo después desde la vista del diagrama.
            </p>
            <div style={styles.promptButtons}>
              <button
                style={styles.promptButtonNo}
                onClick={handleAfterPromptNo}
              >
                Ir al listado
              </button>
              <button
                style={styles.promptButtonYes}
                onClick={handleAfterPromptYes}
              >
                Sí, llenar matriz de riesgo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Before Evaluation Modal */}
      <RiskEvaluation
        diagramId={null}
        isOpen={showBeforeEvalModal}
        onClose={handleBeforeEvalSkip}
        onSaved={handleBeforeEvalSaved}
        evaluationType="before"
        onSkip={handleBeforeEvalSkip}
        showSkip={true}
        pendingMode={true}
      />

      {/* After Evaluation Modal */}
      <RiskEvaluation
        diagramId={savedDiagramId}
        isOpen={showAfterEvalModal}
        onClose={handleAfterEvalComplete}
        onSaved={handleAfterEvalComplete}
        evaluationType="after"
        onSkip={handleAfterEvalComplete}
        showSkip={true}
      />
    </div>
  );
};

export default WizardContainer;
