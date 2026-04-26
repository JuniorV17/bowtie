// client/src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { diagramsApi } from "../services/api";

const Dashboard = () => {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      const data = await diagramsApi.getAll();
      setDiagrams(data);
      setError(null);
    } catch (err) {
      setError("No se pudo conectar con el servidor. Verifica que el backend este activo en el puerto 3001.");
      console.error("Error loading diagrams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await diagramsApi.delete(id);
      setDiagrams(diagrams.filter((d) => d.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting diagram:", err);
      alert("Error al eliminar el diagrama");
    }
  };

  const filteredDiagrams = diagrams.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.risk_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Inline styles for professional appearance
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
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "24px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
      margin: 0,
    },
    subtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginTop: "4px",
    },
    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      backgroundColor: "#4F46E5",
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: "14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      textDecoration: "none",
      boxShadow: "0 2px 4px rgba(79, 70, 229, 0.3)",
      transition: "all 0.2s",
    },
    main: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    searchContainer: {
      marginBottom: "24px",
    },
    searchInput: {
      width: "100%",
      maxWidth: "400px",
      padding: "12px 16px 12px 44px",
      fontSize: "14px",
      border: "2px solid #E5E7EB",
      borderRadius: "10px",
      outline: "none",
      backgroundColor: "#FFFFFF",
      transition: "border-color 0.2s",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "24px",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      transition: "box-shadow 0.2s, transform 0.2s",
    },
    cardBody: {
      padding: "24px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "8px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cardRisk: {
      fontSize: "14px",
      color: "#4B5563",
      marginBottom: "8px",
    },
    cardEvent: {
      fontSize: "13px",
      color: "#9CA3AF",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cardStats: {
      display: "flex",
      gap: "20px",
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid #F3F4F6",
    },
    stat: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6B7280",
    },
    statDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
    },
    cardDates: {
      marginTop: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    cardDate: {
      fontSize: "12px",
      color: "#9CA3AF",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    dateIcon: {
      fontSize: "10px",
    },
    cardFooter: {
      padding: "16px 24px",
      backgroundColor: "#F9FAFB",
      borderTop: "1px solid #E5E7EB",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerActions: {
      display: "flex",
      gap: "8px",
    },
    actionButton: {
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "500",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      textDecoration: "none",
      transition: "background-color 0.2s",
    },
    viewButton: {
      backgroundColor: "#EEF2FF",
      color: "#4F46E5",
    },
    editButton: {
      backgroundColor: "#F3F4F6",
      color: "#374151",
    },
    deleteButton: {
      backgroundColor: "transparent",
      color: "#DC2626",
      padding: "8px 12px",
    },
    emptyState: {
      textAlign: "center",
      padding: "80px 24px",
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      border: "2px dashed #E5E7EB",
    },
    errorState: {
      padding: "24px",
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: "12px",
      marginBottom: "24px",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "16px",
    },
    modalContent: {
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "400px",
      width: "100%",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "12px",
    },
    modalText: {
      fontSize: "14px",
      color: "#6B7280",
      marginBottom: "24px",
      lineHeight: "1.5",
    },
    modalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
    cancelButton: {
      padding: "10px 20px",
      backgroundColor: "#F3F4F6",
      color: "#374151",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
    },
    confirmDeleteButton: {
      padding: "10px 20px",
      backgroundColor: "#DC2626",
      color: "#FFFFFF",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid #E5E7EB",
      borderTopColor: "#4F46E5",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  // Add keyframes for spinner
  const spinnerKeyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: "16px", color: "#6B7280" }}>Cargando diagramas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Diagramas Bowtie</h1>
            <p style={styles.subtitle}>Gestiona tus análisis de riesgo</p>
          </div>
          <Link to="/nuevo" style={styles.primaryButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo Diagrama
          </Link>
        </div>
      </header>

      <main style={styles.main}>
        {/* Error state */}
        {error && (
          <div style={styles.errorState}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <div>
                <p style={{ color: "#991B1B", fontWeight: "600", marginBottom: "4px" }}>
                  Error de conexión
                </p>
                <p style={{ color: "#B91C1C", fontSize: "14px" }}>{error}</p>
                <button
                  onClick={loadDiagrams}
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    backgroundColor: "#FEE2E2",
                    color: "#991B1B",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Reintentar conexión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div style={styles.searchContainer}>
          <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: "400px" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título o peligro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Content */}
        {filteredDiagrams.length === 0 ? (
          <div style={styles.emptyState}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              style={{ margin: "0 auto 16px" }}
            >
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              {searchTerm ? "No se encontraron resultados" : "No hay diagramas creados"}
            </h3>
            <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "24px" }}>
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Comienza creando tu primer diagrama Bowtie"}
            </p>
            {!searchTerm && (
              <Link to="/nuevo" style={styles.primaryButton}>
                Crear primer diagrama
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredDiagrams.map((diagram) => (
              <div
                key={diagram.id}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{diagram.title}</h3>
                  <p style={styles.cardRisk}>Peligro: {diagram.risk_name}</p>
                  <p style={styles.cardEvent}>Evento: {diagram.top_event}</p>

                  <div style={styles.cardStats}>
                    <div style={styles.stat}>
                      <span style={{ ...styles.statDot, backgroundColor: "#3B82F6" }}></span>
                      <span>{diagram.causes_count} causas</span>
                    </div>
                    <div style={styles.stat}>
                      <span style={{ ...styles.statDot, backgroundColor: "#F97316" }}></span>
                      <span>{diagram.consequences_count} consecuencias</span>
                    </div>
                  </div>

                  <div style={styles.cardDates}>
                    <p style={styles.cardDate}>
                      <span style={styles.dateIcon}>📅</span> Creado: {formatDate(diagram.created_at)}
                    </p>
                    <p style={styles.cardDate}>
                      <span style={styles.dateIcon}>🔄</span> Actualizado: {formatDate(diagram.updated_at)}
                    </p>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.footerActions}>
                    <Link
                      to={`/diagrama/${diagram.id}`}
                      style={{ ...styles.actionButton, ...styles.viewButton }}
                    >
                      Ver diagrama
                    </Link>
                    <Link
                      to={`/editar/${diagram.id}`}
                      style={{ ...styles.actionButton, ...styles.editButton }}
                    >
                      Editar
                    </Link>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(diagram.id)}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={styles.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Eliminar diagrama</h3>
            <p style={styles.modalText}>
              ¿Estás seguro de que deseas eliminar este diagrama? Esta acción no se puede deshacer
              y se perderán todos los datos asociados.
            </p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={styles.confirmDeleteButton}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
