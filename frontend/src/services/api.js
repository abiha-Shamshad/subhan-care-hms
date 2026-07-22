const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'subhan_hms_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

let unauthorizedHandler = null;
/** Registered by AuthProvider so any expired/invalid token triggers a clean logout. */
export const onUnauthorized = (handler) => { unauthorizedHandler = handler; };

const request = async (method, endpoint, body) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    clearToken();
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  get:    (endpoint)       => request('GET',    endpoint),
  post:   (endpoint, body) => request('POST',   endpoint, body),
  put:    (endpoint, body) => request('PUT',    endpoint, body),
  patch:  (endpoint, body) => request('PATCH',  endpoint, body),
  delete: (endpoint)       => request('DELETE', endpoint),
};

/** Turns a { key: value } object into a '?key=value&...' query string, skipping empty values. */
const toQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries)}`;
};

export const authService = {
  login:                 (email, password) => api.post('/auth/login', { email, password }),
  requestPasswordReset:  (email)           => api.post('/auth/forgot-password', { email }),
  verifyOtp:             (email, code)      => api.post('/auth/verify-otp', { email, code }),
  resetPassword:         (email, password, token) =>
                            api.post('/auth/reset-password', { email, password, token }),
  me:                    () => api.get('/auth/me'),
  permissions:           () => api.get('/auth/permissions'),
  changePassword:        (currentPassword, newPassword) =>
                            api.patch('/auth/change-password', { currentPassword, newPassword }),
  permissionsMatrix:     () => api.get('/auth/permissions-matrix'),
};

export const patientService = {
  getAll:   ()       => api.get('/patients'),
  getById:  (id)     => api.get(`/patients/${id}`),
  create:   (data)   => api.post('/patients', data),
  update:   (id, data) => api.put(`/patients/${id}`, data),
  delete:   (id)     => api.delete(`/patients/${id}`),
};

export const doctorService = {
  getAll:   ()       => api.get('/doctors'),
  getById:  (id)     => api.get(`/doctors/${id}`),
};

export const appointmentService = {
  getAll:   (params)  => api.get(`/appointments${toQuery(params)}`),
  create:   (data)    => api.post('/appointments', data),
  update:   (id, data) => api.put(`/appointments/${id}`, data),
};

export const prescriptionService = {
  getAll:   (params)  => api.get(`/prescriptions${toQuery(params)}`),
  create:   (data)    => api.post('/prescriptions', data),
  update:   (id, data) => api.put(`/prescriptions/${id}`, data),
  dispense: (id)       => api.patch(`/prescriptions/${id}/dispense`),
};

export const medicalHistoryService = {
  getByPatient: (patientId)       => api.get(`/medical-history/${patientId}`),
  create:       (patientId, data) => api.post(`/medical-history/${patientId}`, data),
};

export const invoiceService = {
  getAll:   (params)  => api.get(`/invoices${toQuery(params)}`),
  create:   (data)    => api.post('/invoices', data),
  recordPayment: (id, data) => api.patch(`/invoices/${id}/payment`, data),
  fromAppointment: (appointmentId) => api.post(`/invoices/from-appointment/${appointmentId}`),
};

export const inventoryService = {
  getAll:   ()       => api.get('/inventory'),
  create:   (data)   => api.post('/inventory', data),
  update:   (id, data) => api.put(`/inventory/${id}`, data),
  delete:   (id)     => api.delete(`/inventory/${id}`),
};

export const reportsService = {
  revenue:             (params) => api.get(`/reports/revenue${toQuery(params)}`),
  inventoryUsage:      ()       => api.get('/reports/inventory-usage'),
  prescriptionTrends:  (params) => api.get(`/reports/prescription-trends${toQuery(params)}`),
  appointmentLoad:     (params) => api.get(`/reports/appointment-load${toQuery(params)}`),
};
