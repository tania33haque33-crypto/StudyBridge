import apiClient from '../utils/apiClient';

const studyProfileService = {
  match: (profileData) => apiClient.post('/study-profiles/match', profileData).then(r => r.data),
  save: (data) => apiClient.post('/study-profiles', data).then(r => r.data),
  getMy: () => apiClient.get('/study-profiles/my').then(r => r.data),
  getCommunity: (params) => apiClient.get('/study-profiles/community', { params }).then(r => r.data),
  getStats: () => apiClient.get('/study-profiles/community/stats').then(r => r.data),
};

export default studyProfileService;
