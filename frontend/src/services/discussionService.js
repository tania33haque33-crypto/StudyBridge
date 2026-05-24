import apiClient from '../utils/apiClient';

const discussionService = {
  getAll: (params) => apiClient.get('/discussions', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/discussions/${id}`).then((r) => r.data),
  getCountryStats: () => apiClient.get('/discussions/countries/stats').then((r) => r.data),
  getMy: (params) => apiClient.get('/discussions/my', { params }).then((r) => r.data),
  create: (data) => apiClient.post('/discussions', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/discussions/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/discussions/${id}`).then((r) => r.data),
  toggleLike: (id) => apiClient.post(`/discussions/${id}/like`).then((r) => r.data),
  addReply: (id, content) => apiClient.post(`/discussions/${id}/replies`, { content }).then((r) => r.data),
  deleteReply: (id, replyId) => apiClient.delete(`/discussions/${id}/replies/${replyId}`).then((r) => r.data),
  toggleReplyLike: (id, replyId) => apiClient.post(`/discussions/${id}/replies/${replyId}/like`).then((r) => r.data),
  acceptReply: (id, replyId) => apiClient.patch(`/discussions/${id}/replies/${replyId}/accept`).then((r) => r.data),
};

export default discussionService;
