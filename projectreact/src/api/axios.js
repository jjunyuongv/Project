// src/api/axios.js
import axios from 'axios';

// 도커/EC2 배포: Nginx가 /api, /ws-chat 프록시 → 프론트는 상대 경로만 사용
// 개발 로컬(Vite)에서도 proxy가 /api를 8081로 넘기므로 동일하게 동작
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,         // 세션/CSRF 쿠키 전송(JSESSIONID 등)
  timeout: 15000,
  // CSRF 자동 주입(쿠키 이름과 헤더 이름을 서버에 맞춰 지정)
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',  // 전역 Content-Type은 지정하지 말기!
  },
});

// 매 요청마다 최신 토큰/식별자 주입
api.interceptors.request.use((config) => {
  // JWT 토큰
  const token =
    localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  // 직원 식별 헤더(있을 때만)
  try {
    const me = JSON.parse(localStorage.getItem('me') || 'null');
    if (me?.employeeId) config.headers['X-Employee-Id'] = me.employeeId;
  } catch { /* ignore */ }

  // ✅ FormData 업로드 시 boundary 자동 설정을 위해 Content-Type 제거
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// (선택) 공통 에러 처리: 401/419 → 로그인 유도, 403 → 권한 메시지 등
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // 예: 세션 만료 처리
      // window.location.href = '/login?reason=expired';
    }
    return Promise.reject(err);
  }
);

export default api;
