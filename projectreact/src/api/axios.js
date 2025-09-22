import axios from 'axios';

// 개발용 기본: Vite 프록시(/api -> 8081) 사용
// 필요하면 .env 에 VITE_API_BASE=http://localhost:8081/api 설정 가능
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,                      // 세션/CSRF 쿠키 전송 (JSESSIONID 등)
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// 쿠키에서 값 꺼내기 (CSRF 토큰 등)
const getCookie = (name) =>
  document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];

// 매 요청마다 최신 토큰/식별자/CSRF를 주입 (생성 시점에 굳히지 말고!)
api.interceptors.request.use((config) => {
  // JWT 토큰: 로그인 후 갱신돼도 항상 최신값 전송
  const token =
    localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 토큰 없으면 헤더 제거(빈 'Bearer null' 방지)
    delete config.headers.Authorization;
  }

  // 프로젝트에서 사용하는 직원 식별 헤더(있을 때만)
  try {
    const me = JSON.parse(localStorage.getItem('me') || 'null');
    if (me?.employeeId) config.headers['X-Employee-Id'] = me.employeeId;
  } catch {
    // ignore
  }

  // (옵션) 서버가 XSRF-TOKEN 쿠키를 내려주는 경우 대비
  const xsrf = getCookie('XSRF-TOKEN') || getCookie('X-XSRF-TOKEN');
  if (xsrf) config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);

  return config;
});

export default api;
