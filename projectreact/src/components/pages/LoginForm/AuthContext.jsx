// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ 현재 페이지 호스트 기준으로 절대 URL 생성 (프록시 경유 보장)
const API = (path) => new URL(path, window.location.origin).toString();

/* ---------- helpers: me 정규화/저장 ---------- */

// 숫자만 추출
const digits = (v) => (String(v).match(/\d+/g)?.join('') ?? '');

// 서버 응답을 표준 me 스키마로 정규화
function normalizeMe(rawInput) {
  if (!rawInput) throw new Error('빈 사용자 응답');

  // 응답 구조가 { user: {...} } 형태일 수도 있어서 보정
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
  if (!Number.isFinite(employeeId)) {
    throw new Error('employeeId 추출 실패');
  }

  let role = raw.role;
  // if (Array.isArray(raw.roles)) roles = raw.roles;
  // else if (typeof raw.role === 'string') roles = [raw.role];
  // else if (Array.isArray(raw.authorities)) roles = raw.authorities.map(a => String(a));

  const name = raw.name || raw.displayName || raw.username || raw.loginId || String(employeeId);

  return { employeeId, name, loginId: raw.loginId || raw.username || '', role };
}

function readMe() {
  try { return JSON.parse(localStorage.getItem('me') || 'null'); } catch { return null; }
}
function saveMe(me) {
  localStorage.setItem('me', JSON.stringify(me));
}
function clearMe() {
  localStorage.removeItem('me');
}

/* ---------- Auth Provider ---------- */

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!readMe()?.employeeId);
  const [user, setUser] = useState(readMe()); // user === me
  const [isLoading, setIsLoading] = useState(true);

  // 로그인
  const login = async (dto) => {
    try {
      const url = API('/api/employees/login'); // ✅ 프록시 경유
      const response = await axios.post(
        url,
        { loginId: dto.loginId, password: dto.password },
        { withCredentials: true }
      );

      // ✔ 서버 응답으로 me 정규화 후 저장
      const me = normalizeMe(response.data);
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);

      // 세션 만료 타이머(30분)
      const expirationTime = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('sessionExpiration', String(expirationTime));

      return me; // Login.jsx에서 name 출력 용
    } catch (error) {
      localStorage.removeItem('sessionExpiration');
      clearMe();
      throw new Error(error.response?.data || '로그인 실패');
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      const url = API('/api/employees/logout'); // ✅ 프록시 경유
      await axios.post(url, {}, { withCredentials: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('sessionExpiration');
      clearMe();
    }
  };

  // 세션 체크 + 5분 전 알림 + 만료 처리 + 사용자 활동으로 연장
  useEffect(() => {
    const checkSession = async () => {
      try {
        const url = API('/api/employees/session-check'); // ✅ 프록시 경유
        const response = await axios.get(url, { withCredentials: true });

        if (response.status === 200 && response.data) {
          // ✔ 세션 체크 응답으로도 me 정규화/저장 (로그인 직후 새로고침해도 유지)
          try {
            const me = normalizeMe(response.data);
            saveMe(me);
            setIsLoggedIn(true);
            setUser(me);
          } catch {
            // 응답에 사용자 정보가 전혀 없을 수도 있음 → 기존 me 유지 or 로그아웃
            const existing = readMe();
            if (existing?.employeeId) {
              setIsLoggedIn(true);
              setUser(existing);
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
      } catch (error) {
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

    // 세션 만료/5분 전 알림 체크
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

    // 사용자 활동 감지: 마우스, 키보드
    const resetExpiration = () => {
      const newExpiration = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('sessionExpiration', String(newExpiration));
      warned = false; // 경고 초기화
    };

    window.addEventListener('mousemove', resetExpiration);
    window.addEventListener('keydown', resetExpiration);

    // 탭 간 동기화: 다른 탭에서 로그인/로그아웃 시 반영
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
