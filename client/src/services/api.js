// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Diagrams API
export const diagramsApi = {
  // Get all diagrams (summary list)
  getAll: async () => {
    const response = await api.get('/diagrams');
    return response.data;
  },

  // Get single diagram with all relations
  getById: async (id) => {
    const response = await api.get(`/diagrams/${id}`);
    return response.data;
  },

  // Create new diagram
  create: async (diagramData) => {
    const response = await api.post('/diagrams', diagramData);
    return response.data;
  },

  // Update existing diagram
  update: async (id, diagramData) => {
    const response = await api.put(`/diagrams/${id}`, diagramData);
    return response.data;
  },

  // Delete diagram
  delete: async (id) => {
    const response = await api.delete(`/diagrams/${id}`);
    return response.data;
  },

  // Get tolerability matrix info
  getTolerabilityMatrix: async () => {
    const response = await api.get('/diagrams/matrix');
    return response.data;
  },
};

// Risk Evaluations API
export const evaluationsApi = {
  // Get evaluations for a diagram
  getByDiagram: async (diagramId) => {
    const response = await api.get(`/diagrams/${diagramId}/evaluations`);
    return response.data;
  },

  // Create risk evaluation
  create: async (diagramId, evaluationData) => {
    const response = await api.post(`/diagrams/${diagramId}/evaluations`, evaluationData);
    return response.data;
  },

  // Update risk evaluation
  update: async (id, evaluationData) => {
    const response = await api.put(`/diagrams/evaluations/${id}`, evaluationData);
    return response.data;
  },

  // Delete evaluation
  delete: async (id) => {
    const response = await api.delete(`/diagrams/evaluations/${id}`);
    return response.data;
  },
};

// Control Escalations API
export const controlEscalationsApi = {
  // Create control escalation
  create: async (controlId, escalationData) => {
    const response = await api.post(`/diagrams/controls/${controlId}/escalations`, escalationData);
    return response.data;
  },

  // Delete control escalation
  delete: async (id) => {
    const response = await api.delete(`/diagrams/control-escalations/${id}`);
    return response.data;
  },
};

// Mitigation Escalations API
export const mitigationEscalationsApi = {
  // Create mitigation escalation
  create: async (mitigationId, escalationData) => {
    const response = await api.post(`/diagrams/mitigations/${mitigationId}/escalations`, escalationData);
    return response.data;
  },

  // Delete mitigation escalation
  delete: async (id) => {
    const response = await api.delete(`/diagrams/mitigation-escalations/${id}`);
    return response.data;
  },
};

export default api;
