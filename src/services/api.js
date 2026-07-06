const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (method, endpoint, body) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const api = {
  get:    (endpoint)       => request('GET',    endpoint),
  post:   (endpoint, body) => request('POST',   endpoint, body),
  put:    (endpoint, body) => request('PUT',    endpoint, body),
  patch:  (endpoint, body) => request('PATCH',  endpoint, body),
  delete: (endpoint)       => request('DELETE', endpoint),
};

/**
 * Authentication endpoints. Currently placeholders — the UI resolves auth
 * against the mock store in AuthContext, but these are the real calls to
 * swap in once the backend is live (no other code needs to change).
 */
export const authService = {
  login:                 (email, password) => api.post('/auth/login', { email, password }),
  requestPasswordReset:  (email)           => api.post('/auth/forgot-password', { email }),
  verifyOtp:             (email, code)      => api.post('/auth/verify-otp', { email, code }),
  resetPassword:         (email, password, token) =>
                            api.post('/auth/reset-password', { email, password, token }),
};

export const patientService = {
  getAll:   ()       => api.get('/patients'),
  getById:  (id)     => api.get(`/patients/${id}`),
  create:   (data)   => api.post('/patients', data),
  update:   (id, data) => api.put(`/patients/${id}`, data),
};

export const appointmentService = {
  getAll:   ()       => api.get('/appointments'),
  create:   (data)   => api.post('/appointments', data),
  update:   (id, data) => api.put(`/appointments/${id}`, data),
};

export const prescriptionService = {
  getAll:   ()       => api.get('/prescriptions'),
  create:   (data)   => api.post('/prescriptions', data),
  update:   (id, data) => api.put(`/prescriptions/${id}`, data),
};

export const invoiceService = {
  getAll:   ()       => api.get('/invoices'),
  create:   (data)   => api.post('/invoices', data),
  recordPayment: (id, data) => api.patch(`/invoices/${id}/payment`, data),
};

export const inventoryService = {
  getAll:   ()       => api.get('/inventory'),
  create:   (data)   => api.post('/inventory', data),
  update:   (id, data) => api.put(`/inventory/${id}`, data),
  delete:   (id)     => api.delete(`/inventory/${id}`),
};
