// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 전역 axios 기본값 (쿠키 포함)
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

// 현재 페이지 호스트 기준 절대 URL (Vite 프록시 경유 보장)
const API = (path) => new URL(path, window.location.origin).toString();

/* ---------- helpers: me 정규화/저장 ---------- */

const digits = (v) => (String(v).match(/\d+/g)?.join('') ?? '');

function normalizeMe(rawInput) {
  if (!rawInput) throw new Error('빈 사용자 응답');
  const raw = rawInput.user ?? rawInput;

  const candidates = [
    raw.employeeId, raw.employee_id, raw.empId, raw.emp_id,
    raw.userId, raw.user_id, raw.id,
    raw.username, raw.loginId, raw.login_id,
    raw?.employee?.employeeId, raw?.member?.employeeId, raw?.profile?.employeeId,
  ];

  let employeeId = null;
  for (const c of candidates) {
    if (c == null) continue;
    const d = digits(c);
    if (d) { employeeId = Number(d); break; }
  }
  if (!Number.isFinite(employeeId)) throw new Error('employeeId 추출 실패');

  const role = raw.role;
  const name = raw.name || raw.displayName || raw.username || raw.loginId || String(employeeId);
  return { employeeId, name, loginId: raw.loginId || raw.username || '', role };
}

function readMe() {
  try { return JSON.parse(localStorage.getItem('me') || 'null'); } catch { return null; }
}
function saveMe(me) { localStorage.setItem('me', JSON.stringify(me)); }
function clearMe() { localStorage.removeItem('me'); }

/* ---------- Provider 컴포넌트 ---------- */

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!readMe()?.employeeId);
  const [user, setUser] = useState(readMe());
  const [isLoading, setIsLoading] = useState(true);

  // 로그인
  const login = async (dto) => {
    try {
      const url = API('/api/employees/login');
      const res = await axios.post(url, { loginId: dto.loginId, password: dto.password }, { withCredentials: true });

      const me = normalizeMe(res.data);
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);

      const expirationTime = Date.now() + 30 * 60 * 1000; // 30분
      localStorage.setItem('sessionExpiration', String(expirationTime));
      return me;
    } catch (e) {
      localStorage.removeItem('sessionExpiration');
      clearMe();
      throw new Error(e?.response?.data || '로그인 실패');
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      const url = API('/api/employees/logout');
      await axios.post(url, {}, { withCredentials: true });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('sessionExpiration');
      clearMe();
    }
  };

  // 방법 A: 미로그인/만료면 session-check 호출 자체를 건너뜀 → 콘솔 403 제거
  useEffect(() => {
    const existing = readMe();
    const exp = parseInt(localStorage.getItem('sessionExpiration') || '0', 10);
    if (!existing?.employeeId || !exp || exp <= Date.now()) {
      clearMe();
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const url = API('/api/employees/session-check');
        const res = await axios.get(url, {
          withCredentials: true,
          validateStatus: () => true, // 401/403도 throw하지 않음
        });

        if (res.status === 200 && res.data) {
          try {
            const me = normalizeMe(res.data);
            saveMe(me);
            setIsLoggedIn(true);
            setUser(me);
          } catch {
            const m = readMe();
            if (m?.employeeId) {
              setIsLoggedIn(true);
              setUser(m);
            } else {
              setIsLoggedIn(false);
              setUser(null);
              clearMe();
            }
          }

          if (!localStorage.getItem('sessionExpiration')) {
            const expirationTime = Date.now() + 30 * 60 * 1000;
            localStorage.setItem('sessionExpiration', String(expirationTime));
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('sessionExpiration');
          clearMe();
        }
      } catch {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('sessionExpiration');
        clearMe();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    let warned = false;

    // 세션 만료/5분 전 알림 + 만료 처리
    const interval = setInterval(() => {
      const expirationTime = localStorage.getItem('sessionExpiration');
      if (!expirationTime) return;

      const remaining = parseInt(expirationTime, 10) - Date.now();
      if (remaining <= 5 * 60 * 1000 && remaining > 0 && !warned) {
        alert('세션이 5분 후 만료됩니다.');
        warned = true;
      }
      if (remaining <= 0) {
        logout();
        clearInterval(interval);
      }
    }, 1000);

    // 사용자 활동 시 세션 연장
    const resetExpiration = () => {
      const newExpiration = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('sessionExpiration', String(newExpiration));
      warned = false;
    };
    window.addEventListener('mousemove', resetExpiration);
    window.addEventListener('keydown', resetExpiration);

    // 탭 간 동기화
    const onStorage = (e) => {
      if (e.key === 'me') {
        const m = readMe();
        setIsLoggedIn(!!m?.employeeId);
        setUser(m);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetExpiration);
      window.removeEventListener('keydown', resetExpiration);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔻 ESLint 경고 억제: 이 파일에서 컴포넌트 외 export(훅) 허용
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
