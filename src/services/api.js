import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9999/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Clean up expired credentials only if not an auth attempt (login/signup)
    const reqUrl = error.config?.url || "";
    const isAuthAttempt = reqUrl.includes("/auth/login") || reqUrl.includes("/auth/signup");

    if (error.response?.status === 401 && !isAuthAttempt) {
      const isExpired = 
        error.response?.data?.message?.toLowerCase().includes("expired") ||
        error.response?.data?.message?.toLowerCase().includes("denied");
      
      if (isExpired && localStorage.getItem("token")) {
        console.warn("Session expired or invalid. Please re-login.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

// ================= AUTH API =================
export const authService = {
  signup: async (formData) => {
    // Check if sending FormData (with file) or JSON
    const isFormData = formData instanceof FormData;
    const response = await api.post("/auth/signup", formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get("/auth/check");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async ({ token, newPassword }) => {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data;
  },
};

// ================= USER API =================
export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getPublicFreelancerProfile: async (id) => {
    const response = await api.get(`/users/${id}/public`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/users/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// ================= JOB API =================
export const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get("/jobs", { params });
    return response.data;
  },

  getPublicMarketplaceOverview: async () => {
    const response = await api.get("/jobs/public/overview");
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get("/jobs/my-jobs");
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post("/jobs", jobData, { headers: jobData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined });
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData, { headers: jobData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

// ================= PROPOSAL API =================
export const proposalService = {
  createProposal: async (proposalData) => {
    const response = await api.post("/proposals", proposalData, { headers: proposalData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined });
    return response.data;
  },

  getMyProposals: async (params = {}) => {
    const response = await api.get("/proposals/my-proposals", { params });
    return response.data;
  },

  getProposalsForJob: async (jobId) => {
    const response = await api.get(`/proposals/job/${jobId}`);
    return response.data;
  },

  getProposalById: async (id) => {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
  },

  acceptProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/accept`);
    return response.data;
  },

  rejectProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/reject`);
    return response.data;
  },

  withdrawProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/withdraw`);
    return response.data;
  },
};

// ================= CONTRACT API =================
export const contractService = {
  getMyContracts: async (params = {}) => {
    const response = await api.get("/contracts/my-contracts", { params });
    return response.data;
  },

  getContractById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  submitWork: async (id, workData) => {
    const response = await api.post(`/contracts/${id}/submit-work`, workData, {
      headers: workData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  updateDelivery: async (id, workData) => {
    const response = await api.patch(`/contracts/${id}/delivery`, workData, {
      headers: workData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  approveWork: async (id) => {
    const response = await api.patch(`/contracts/${id}/approve`);
    return response.data;
  },

  requestRevision: async (id, data = {}) => {
    const response = await api.patch(`/contracts/${id}/revision`, data);
    return response.data;
  },

  cancelContract: async (id, data = {}) => {
    const response = await api.patch(`/contracts/${id}/cancel`, data);
    return response.data;
  },

  confirmPayment: async (id) => {
    const response = await api.patch(`/contracts/${id}/confirm-payment`);
    return response.data;
  },
};

// ================= PAYMENT API =================
export const paymentService = {
  getPaymentHistory: async (params = {}) => {
    const response = await api.get("/payments/history", { params });
    return response.data?.data || [];
  },

  getEarningsStats: async () => {
    const response = await api.get("/payments/earnings-stats");
    return response.data?.data || {};
  },

  initializePaystackPayment: async (contractId) => {
    const response = await api.post("/payments/initialize", { contractId });
    return response.data?.data;
  },

  verifyPaystackPayment: async (reference) => {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  },
};

// ================= PAYOUT API =================
export const payoutService = {
  getBanks: async () => {
    const response = await api.get('/payouts/banks');
    return response.data?.data || [];
  },

  getAccount: async () => {
    const response = await api.get('/payouts/account');
    return response.data?.data || null;
  },

  saveAccount: async ({ bankCode, accountNumber }) => {
    const response = await api.put('/payouts/account', { bankCode, accountNumber });
    return response.data?.data;
  },

  getBalance: async () => {
    const response = await api.get('/payouts/balance');
    return response.data?.data || {};
  },

  requestPayout: async (amount) => {
    const response = await api.post('/payouts/request', { amount });
    return response.data?.data;
  },

  getHistory: async () => {
    const response = await api.get('/payouts/history');
    return response.data?.data || [];
  },
};

// ================= MESSAGING API =================
export const messageService = {
  getConversations: async () => {
    const response = await api.get("/messages/conversations");
    return response.data;
  },

  getOrCreateConversation: async (recipientId, contractId, jobId) => {
    const response = await api.post("/messages/conversations", {
      recipientId,
      contractId: contractId || undefined,
      jobId: jobId || undefined,
    });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post("/messages/messages", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  markConversationRead: async (conversationId) => {
    const response = await api.patch(`/messages/conversations/${conversationId}/read`);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/messages/conversations/${conversationId}`);
    return response.data;
  },
};

// ================= NOTIFICATION API =================
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// ================= ADMIN API =================
export const adminService = {
  getStats: async () => {
    const response = await api.get("/admin/overview");
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  getJobs: async (params = {}) => {
    const response = await api.get("/admin/jobs", { params });
    return response.data;
  },

  getContracts: async (params = {}) => {
    const response = await api.get("/admin/contracts", { params });
    return response.data;
  },

  getPayments: async () => {
    const response = await api.get("/admin/payments");
    return response.data;
  },
  getSettings: async () => (await api.get("/admin/settings")).data,
  updateSettings: async (settings) => (await api.put("/admin/settings", settings)).data,

  getProposals: async (params = {}) => {
    try {
      const response = await api.get("/admin/proposals", { params });
      return response.data;
    } catch (err) {
      if (err?.response?.status === 404 || err?.status === 404) {
        // Fallback: aggregate proposals across jobs using existing client/admin endpoint
        try {
          const jobsRes = await api.get("/admin/jobs");
          const jobList = Array.isArray(jobsRes.data) ? jobsRes.data : [];
          const promises = jobList.map(async (job) => {
            try {
              const pRes = await api.get(`/proposals/job/${job._id || job.id}`);
              const pList = Array.isArray(pRes.data) ? pRes.data : [];
              return pList.map((p) => ({
                ...p,
                jobId: job,
              }));
            } catch {
              return [];
            }
          });
          const results = await Promise.all(promises);
          let allProposals = results.flat();
          if (params.status && params.status !== "all" && params.status !== "All") {
            allProposals = allProposals.filter(
              (p) => (p.status || "").toLowerCase() === params.status.toLowerCase()
            );
          }
          return allProposals;
        } catch {
          return [];
        }
      }
      throw err;
    }
  },
};

export const reviewService = {
  createReview: async (data) => (await api.post("/reviews", data)).data,
  getUserReviews: async (userId) => (await api.get(`/reviews/user/${userId}`)).data,
  getAllReviews: async () => (await api.get("/reviews/all")).data,
};

// ================= DISPUTES API =================
export const disputeService = {
  openDispute: async (disputeData) => {
    const response = await api.post("/disputes", disputeData);
    return response.data;
  },

  getDisputes: async (params = {}) => {
    const response = await api.get("/disputes", { params });
    return response.data;
  },

  getDisputeById: async (id) => {
    const response = await api.get(`/disputes/${id}`);
    return response.data;
  },

  resolveDispute: async (id, resolutionData) => {
    const response = await api.patch(`/disputes/${id}/resolve`, resolutionData);
    return response.data;
  },
};

export default api;
