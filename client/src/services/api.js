/**
 * API Service Layer
 * Centralises all API calls using the configured Axios instance
 */

import axiosInstance from './axiosInstance';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data)   => axiosInstance.post('/auth/register', data),
  login:         (data)   => axiosInstance.post('/auth/login', data),
  getMe:         ()       => axiosInstance.get('/auth/me'),
  updateProfile: (data)   => axiosInstance.put('/auth/profile', data),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobAPI = {
  getAll:   (params) => axiosInstance.get('/jobs', { params }),
  getById:  (id)     => axiosInstance.get(`/jobs/${id}`),
  create:   (data)   => axiosInstance.post('/jobs', data),
  update:   (id, data) => axiosInstance.put(`/jobs/${id}`, data),
  remove:   (id)     => axiosInstance.delete(`/jobs/${id}`),
  getMyJobs: ()      => axiosInstance.get('/jobs/recruiter/my-jobs'),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationAPI = {
  apply:           (data)   => axiosInstance.post('/applications', data),
  getMyApps:       ()       => axiosInstance.get('/applications/my'),
  getJobApps:      (jobId)  => axiosInstance.get(`/applications/job/${jobId}`),
  updateStatus:    (id, status) => axiosInstance.put(`/applications/${id}`, { status }),
  withdraw:        (id)     => axiosInstance.delete(`/applications/${id}`),
  getAll:          ()       => axiosInstance.get('/applications'),
};
