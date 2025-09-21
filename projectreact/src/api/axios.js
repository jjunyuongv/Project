import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ★ 모든 요청에 세션 쿠키(JSESSIONID) 자동 포함
});

export default api;
