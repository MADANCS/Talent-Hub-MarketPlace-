import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export { BASE_URL };

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle auth errors globally
// NOTE: Skip auto-redirect for auth endpoints so Login/Register catch blocks
// can display proper error messages to the user.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // Exclude auth endpoints (login, register, getMe) so their callers
    // can handle errors themselves (e.g. AuthContext catch for /auth/me)
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data),
  generate2FA: () => API.post('/auth/2fa/generate'),
  enable2FA: (token) => API.post('/auth/2fa/enable', { token }),
};

// Job APIs
export const jobAPI = {
  getJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  getRelatedJobs: (id) => API.get(`/jobs/${id}/related`),
  getMarketIntelligence: () => API.get('/jobs/market-intelligence'),
  analyzeSkillGap: (id) => API.post(`/jobs/${id}/analyze-gap`),
  createJob: (data) => API.post('/jobs', data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  getMyJobs: () => API.get('/jobs/my-jobs'),
  getAIMatches: () => API.get('/jobs/ai-matches'),
  generateDescription: (data) => API.post('/jobs/generate-description', data),
};

// Application APIs
export const applicationAPI = {
  apply: (data) => API.post('/applications', data),
  getMyApplications: (params) => API.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params) => API.get(`/applications/job/${jobId}`, { params }),
  getRecruiterApplications: (params) => API.get('/applications/recruiter', { params }),
  getApplicationById: (id) => API.get(`/applications/${id}`),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  updateNotes: (id, data) => API.patch(`/applications/${id}/notes`, data),
  scheduleInterview: (id, data) => API.post(`/applications/${id}/interviews`, data),
  updateInterviewFeedback: (id, interviewId, data) => API.put(`/applications/${id}/interviews/${interviewId}`, data),
  updateInterviewCandidateFeedback: (id, interviewId, data) => API.put(`/applications/${id}/interviews/${interviewId}/candidate-feedback`, data),
  generateAIVerdict: (id) => API.post(`/applications/${id}/ai-verdict`),
  withdraw: (id, data) => API.put(`/applications/${id}/withdraw`, data),
  generateQuestions: (id) => API.post(`/applications/${id}/generate-questions`),
  generateCoverLetter: (jobId) => API.post('/applications/generate-cover-letter', { jobId }),
};

// User APIs
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  getLeaderboard: () => API.get('/users/leaderboard'),
  searchCandidates: (params) => API.get('/users/candidates', { params }),
  getCandidateProfile: (id) => API.get(`/users/candidates/${id}`),
  updatePushToken: (data) => API.put('/users/push-token', data),
  parseResume: (formData) => API.post('/users/parse-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Bookmarks
  getSavedJobs: () => API.get('/users/saved-jobs'),
  saveJob: (jobId) => API.post(`/users/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => API.delete(`/users/saved-jobs/${jobId}`),
  // AI Resume Score
  getResumeScore: () => API.get('/users/resume-score'),
  // Skill Radar
  getSkillRadar: () => API.get('/users/skill-radar'),
  // Recruiter Analytics
  getRecruiterAnalytics: () => API.get('/users/recruiter-analytics'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => API.get('/notifications', { params }),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
  clearAll: () => API.delete('/notifications/clear-all'),
};

// Subscription APIs
export const subscriptionAPI = {
  getPlans: () => API.get('/subscriptions/plans'),
  createOrder: (data) => API.post('/subscriptions/create-order', data),
  verifyPayment: (data) => API.post('/subscriptions/verify-payment', data),
  getMySubscription: () => API.get('/subscriptions/my-subscription'),
};

// Admin APIs
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  banUser: (id, data) => API.put(`/admin/users/${id}/ban`, data),
  updateRole: (id, data) => API.put(`/admin/users/${id}/role`, data),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
  getAnalytics: () => API.get('/admin/analytics'),
};

// Message APIs
export const messageAPI = {
  getChatList: () => API.get('/messages/chats'),
  getMessages: (applicationId) => API.get(`/messages/${applicationId}`),
  sendMessage: (data) => API.post('/messages', data),
};

// Interview APIs
export const interviewAPI = {
  getToken: (channelName) => API.post('/interview/token', { channelName }),
  executeCode: (data) => API.post('/interview/execute-code', data),
  analyzeCode: (code, question, language) => API.post('/interview/analyze', { code, question, language }),
  generateQuestion: (data) => API.post('/interview/generate-question', data),
  generateChallenge: (data) => API.post('/interview/generate-challenge', data),
  createSession: (data) => API.post('/interview/sessions', data),
  getMyInterviews: (params) => API.get('/interview/sessions/my', { params }),
  getSession: (id) => API.get(`/interview/sessions/${id}`),
  updateSessionStatus: (id, data) => API.patch(`/interview/sessions/${id}/status`, data),
  submitScorecard: (id, data) => API.post(`/interview/sessions/${id}/scorecard`, data),
  saveSnapshot: (id, data) => API.post(`/interview/sessions/${id}/snapshot`, data),
  generateReport: (id) => API.post(`/interview/sessions/${id}/report`),
  addChatMessage: (id, data) => API.post(`/interview/sessions/${id}/chat`, data),
};

export default API;
