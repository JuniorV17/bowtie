// client/src/components/DiagramView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { diagramsApi, controlEscalationsApi, mitigationEscalationsApi } from "../services/api";
import BowtieDiagram from "./BowtieDiagram";
import RiskEvaluation from "./wizard/RiskEvaluation";
import EscalationModal from "./wizard/EscalationModal";

const TOLERABILITY_COLORS = {
  Aceptable: "#22C55E",
  Tolerable: "#EAB308",
  Intolerable: "#F97316",
  Inaceptable: "#EF4444",
};

const DiagramView = () => {
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedEvalType, setSelectedEvalType] = useState("before");
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationTarget, setEscalationTarget] = useState(null); // { type: 'control'|'mitigation', item: {...} }
  const [showEscalationPanel, setShowEscalationPanel] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Get evaluation by type
  const getEvaluationByType = (type) => {
    if (!diagram?.evaluations) return null;
    return diagram.evaluations.find(e => e.evaluation_type === type);
  };

  const handleEvaluate = (type, existingEval = null) => {
    setSelectedEvalType(type);
    setEditingEvaluation(existingEval);
    setShowEvaluation(true);
  };

  const handleEvaluationSaved = () => {
    setShowEvaluation(false);
    setEditingEvaluation(null);
    loadDiagram();
  };

  // Escalation handlers
  const handleOpenEscalation = (type, item) => {
    setEscalationTarget({ type, item });
    setShowEscalation(true);
  };

  const handleAddEscalation = async (label) => {
    if (!escalationTarget) return;

    if (escalationTarget.type === "control") {
      await controlEscalationsApi.create(escalationTarget.item.id, { label });
    } else {
      await mitigationEscalationsApi.create(escalationTarget.item.id, { label });
    }
    loadDiagram();
  };

  const handleDeleteEscalation = async (escalationId) => {
    if (!escalationTarget) return;

    if (escalationTarget.type === "control") {
      await controlEscalationsApi.delete(escalationId);
    } else {
      await mitigationEscalationsApi.delete(escalationId);
    }
    loadDiagram();
  };

  // Get all controls and mitigations from diagram
  const getAllControls = () => {
    if (!diagram?.causes) return [];
    return diagram.causes.flatMap(cause =>
      (cause.controls || []).map(ctrl => ({
        ...ctrl,
        causeName: cause.label
      }))
    );
  };

  const getAllMitigations = () => {
    if (!diagram?.consequences) return [];
    return diagram.consequences.flatMap(conseq =>
      (conseq.mitigations || []).map(mit => ({
        ...mit,
        consequenceName: conseq.label
      }))
    );
  };

  useEffect(() => {
    loadDiagram();
  }, [id]);

  const loadDiagram = async () => {
    try {
      setLoading(true);
      const data = await diagramsApi.getById(id);
      setDiagram(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar el diagrama");
      console.error("Error loading diagram:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#F9FAFB",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    headerContent: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
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
      textDecoration: "none",
      transition: "all 0.2s",
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111827",
      margin: 0,
    },
    subtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginTop: "4px",
    },
    editButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      backgroundColor: "#F3F4F6",
      color: "#374151",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      textDecoration: "none",
      transition: "all 0.2s",
    },
    main: {
      maxWidth: "100%",
      margin: "0 auto",
    },
    infoPanel: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "24px",
    },
    infoCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      border: "1px solid #E5E7EB",
    },
    infoTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },
    infoText: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: "1.6",
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
    errorContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#F9FAFB",
      padding: "24px",
    },
    errorCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      padding: "48px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "400px",
    },
    errorTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "16px",
    },
    actionButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "24px",
    },
    primaryButton: {
      padding: "10px 20px",
      backgroundColor: "#4F46E5",
      color: "#FFFFFF",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
    },
    secondaryButton: {
      padding: "10px 20px",
      backgroundColor: "#F3F4F6",
      color: "#374151",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      textDecoration: "none",
    },
  };

  const spinnerKeyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "#6B7280" }}>Cargando diagrama...</p>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.5"
            style={{ margin: "0 auto 16px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h3 style={styles.errorTitle}>
            {error || "Diagrama no encontrado"}
          </h3>
          <div style={styles.actionButtons}>
            <button onClick={() => navigate("/")} style={styles.secondaryButton}>
              Volver al inicio
            </button>
            {error && (
              <button onClick={loadDiagram} style={styles.primaryButton}>
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const beforeEval = getEvaluationByType("before");
  const afterEval = getEvaluationByType("after");
  const totalEscalations = getAllControls().reduce((acc, c) => acc + (c.escalations?.length || 0), 0) +
                           getAllMitigations().reduce((acc, m) => acc + (m.escalations?.length || 0), 0);

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link
            to="/"
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
            Volver
          </Link>

          <div style={styles.titleContainer}>
            <h1 style={styles.title}>{diagram.title}</h1>
            <p style={styles.subtitle}>Peligro: {diagram.riskName}</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to={`/editar/${id}`}
              style={styles.editButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E5E7EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </Link>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div style={{
        display: "flex",
        height: "calc(100vh - 73px)",
        overflow: "hidden",
      }}>
        {/* Diagram area - takes most of the space */}
        <main style={{ flex: 1, overflow: "auto" }}>
          <BowtieDiagram apiData={diagram} />
        </main>

        {/* Right Sidebar */}
        <aside style={{
          width: "320px",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid #E5E7EB",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {/* Risk Evaluation Section */}
          <div style={{ padding: "20px", borderBottom: "1px solid #E5E7EB" }}>
            <h3 style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              📊 Evaluación SMS
            </h3>

            {/* Before Evaluation Card */}
            <div
              onClick={() => handleEvaluate("before", beforeEval)}
              style={{
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: beforeEval ? `${TOLERABILITY_COLORS[beforeEval.tolerability]}12` : "#F9FAFB",
                border: beforeEval ? `1.5px solid ${TOLERABILITY_COLORS[beforeEval.tolerability]}` : "1.5px dashed #D1D5DB",
                cursor: "pointer",
                marginBottom: "10px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <div style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#3B82F6",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                ⚠️ Riesgo Inicial
              </div>
              {beforeEval ? (
                <>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: TOLERABILITY_COLORS[beforeEval.tolerability],
                  }}>
                    {beforeEval.tolerability}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>
                    P:{beforeEval.probability} | G:{beforeEval.severity}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  + Agregar evaluación
                </div>
              )}
            </div>

            {/* After Evaluation Card */}
            <div
              onClick={() => handleEvaluate("after", afterEval)}
              style={{
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: afterEval ? `${TOLERABILITY_COLORS[afterEval.tolerability]}12` : "#F9FAFB",
                border: afterEval ? `1.5px solid ${TOLERABILITY_COLORS[afterEval.tolerability]}` : "1.5px dashed #D1D5DB",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <div style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#059669",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                🛡️ Riesgo Residual
              </div>
              {afterEval ? (
                <>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: TOLERABILITY_COLORS[afterEval.tolerability],
                  }}>
                    {afterEval.tolerability}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>
                    P:{afterEval.probability} | G:{afterEval.severity}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  + Agregar evaluación
                </div>
              )}
            </div>
          </div>

          {/* Escalation Section */}
          <div style={{ padding: "20px", borderBottom: "1px solid #E5E7EB" }}>
            <h3 style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                ⚡ Escalamientos
              </span>
              <span style={{
                backgroundColor: totalEscalations > 0 ? "#FEE2E2" : "#F3F4F6",
                color: totalEscalations > 0 ? "#DC2626" : "#6B7280",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "600",
              }}>
                {totalEscalations}
              </span>
            </h3>

            {/* Controls with escalations */}
            {getAllControls().length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#047857",
                  marginBottom: "8px",
                }}>
                  Controles Preventivos
                </div>
                {getAllControls().map((ctrl) => (
                  <div
                    key={ctrl.id}
                    onClick={() => handleOpenEscalation("control", ctrl)}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: ctrl.escalations?.length > 0 ? "#FEF2F2" : "#F9FAFB",
                      borderRadius: "8px",
                      marginBottom: "6px",
                      cursor: "pointer",
                      border: ctrl.escalations?.length > 0 ? "1px solid #FECACA" : "1px solid #E5E7EB",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{
                        fontSize: "12px",
                        color: "#374151",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {ctrl.label}
                      </span>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: ctrl.escalations?.length > 0 ? "#DC2626" : "#9CA3AF",
                        marginLeft: "8px",
                      }}>
                        ⚡{ctrl.escalations?.length || 0}
                      </span>
                    </div>
                    {ctrl.escalations?.length > 0 && (
                      <div style={{ marginTop: "6px", paddingLeft: "8px", borderLeft: "2px solid #DC2626" }}>
                        {ctrl.escalations.slice(0, 2).map((esc) => (
                          <div key={esc.id} style={{ fontSize: "10px", color: "#991B1B", padding: "2px 0" }}>
                            {esc.label}
                          </div>
                        ))}
                        {ctrl.escalations.length > 2 && (
                          <div style={{ fontSize: "10px", color: "#9CA3AF" }}>
                            +{ctrl.escalations.length - 2} más...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mitigations with escalations */}
            {getAllMitigations().length > 0 && (
              <div>
                <div style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#B45309",
                  marginBottom: "8px",
                }}>
                  Mitigaciones
                </div>
                {getAllMitigations().map((mit) => (
                  <div
                    key={mit.id}
                    onClick={() => handleOpenEscalation("mitigation", mit)}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: mit.escalations?.length > 0 ? "#FEF2F2" : "#F9FAFB",
                      borderRadius: "8px",
                      marginBottom: "6px",
                      cursor: "pointer",
                      border: mit.escalations?.length > 0 ? "1px solid #FECACA" : "1px solid #E5E7EB",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{
                        fontSize: "12px",
                        color: "#374151",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {mit.label}
                      </span>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: mit.escalations?.length > 0 ? "#DC2626" : "#9CA3AF",
                        marginLeft: "8px",
                      }}>
                        ⚡{mit.escalations?.length || 0}
                      </span>
                    </div>
                    {mit.escalations?.length > 0 && (
                      <div style={{ marginTop: "6px", paddingLeft: "8px", borderLeft: "2px solid #DC2626" }}>
                        {mit.escalations.slice(0, 2).map((esc) => (
                          <div key={esc.id} style={{ fontSize: "10px", color: "#991B1B", padding: "2px 0" }}>
                            {esc.label}
                          </div>
                        ))}
                        {mit.escalations.length > 2 && (
                          <div style={{ fontSize: "10px", color: "#9CA3AF" }}>
                            +{mit.escalations.length - 2} más...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {getAllControls().length === 0 && getAllMitigations().length === 0 && (
              <p style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic", textAlign: "center" }}>
                No hay controles ni mitigaciones
              </p>
            )}
          </div>

          {/* Description Section */}
          {diagram.description && (
            <div style={{ padding: "20px" }}>
              <h3 style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
              }}>
                📝 Descripción
              </h3>
              <p style={{
                fontSize: "13px",
                color: "#374151",
                lineHeight: "1.5",
              }}>
                {diagram.description}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Risk Evaluation Modal */}
      <RiskEvaluation
        diagramId={parseInt(id)}
        isOpen={showEvaluation}
        onClose={() => {
          setShowEvaluation(false);
          setEditingEvaluation(null);
        }}
        onSaved={handleEvaluationSaved}
        evaluationType={selectedEvalType}
        existingEvaluation={editingEvaluation}
        showSkip={false}
      />

      {/* Escalation Modal */}
      <EscalationModal
        isOpen={showEscalation}
        onClose={() => {
          setShowEscalation(false);
          setEscalationTarget(null);
        }}
        type={escalationTarget?.type}
        itemLabel={escalationTarget?.item?.label}
        existingEscalations={escalationTarget?.item?.escalations || []}
        onAdd={handleAddEscalation}
        onDelete={handleDeleteEscalation}
      />
    </div>
  );
};

export default DiagramView;
