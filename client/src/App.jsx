// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DiagramView from "./components/DiagramView";
import WizardContainer from "./components/wizard/WizardContainer";

function App() {
  return (
    <Routes>
      {/* Dashboard - List all diagrams */}
      <Route path="/" element={<Dashboard />} />

      {/* Create new diagram */}
      <Route path="/nuevo" element={<WizardContainer />} />

      {/* Edit existing diagram */}
      <Route path="/editar/:id" element={<WizardContainer />} />

      {/* View diagram */}
      <Route path="/diagrama/:id" element={<DiagramView />} />

      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
