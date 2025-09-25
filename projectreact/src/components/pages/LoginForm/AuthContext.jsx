// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
// ✅ 공용 axios 인스턴스 사용 (baseURL:'/api', withCredentials, 인터셉터 적용)

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function readMe() {
  try { return JSON.parse(localStorage.getItem('me') || 'null'); } catch { return null; }
}
function saveMe(me) { localStorage.setItem('me', JSON.stringify(me)); }
function clearMe() { localStorage.removeItem('me'); }

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginError, setLoginError] = useState(null);

  // ---------------------------
  // 일반 로그인
  // ---------------------------
  const login = async (dto) => {
    try {
      const { data } = await api.post('/employees/login', {
        loginId: dto.loginId,
        password: dto.password,
      });
      const me = {
        employeeId: Number(data.employeeId),
        name: data.name,
        loginId: data.loginId,
        role: data.role,
      };
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));
      setLoginError(null);
      return me;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setLoginError(err.response.data);
      } else {
        setLoginError("알 수 없는 오류가 발생했습니다.");
      }
      throw err;
    }
  };

  // ---------------------------
  // 로그아웃
  // ---------------------------
  const logout = async () => {
    try {
      await api.post('/employees/logout', {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('sessionExpiration');
      clearMe();
    }
  };

  // ---------------------------
  // 카카오 로그인 처리
  // ---------------------------
  const handleKakaoLogin = async (code) => {
    try {
      const { data } = await api.post('/auth/kakao', { code });
      const me = {
        employeeId: Number(data.employeeId),
        name: data.name,
        loginId: data.loginId,
        role: data.role,
        isKakao: data.loginId?.startsWith("kakao_"),
      };
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));
    } catch (error) {
      console.error("카카오 로그인 중 오류 발생:", error);
    }
  };

  // ---------------------------
  // 구글 로그인 처리
  // ---------------------------
  const handleGoogleLogin = async (code) => {
    try {
      const { data } = await api.post('/auth/google', { code });
      const me = {
        employeeId: Number(data.employeeId),
        name: data.name,
        loginId: data.loginId,
        role: data.role,
        isGoogle: data.loginId?.startsWith("google_"),
      };
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));
    } catch (error) {
      console.error("구글 로그인 중 오류 발생:", error);
    }
  };

  // ---------------------------
  // 프론트 세션 체크 & 메시지 처리
  // ---------------------------
  useEffect(() => {
    // 🔹 부모창 없는 경우 임시 로그인 자동 반영
    const kakaoTemp = localStorage.getItem("kakao-temp-login");
    const googleTemp = localStorage.getItem("google-temp-login");

    if (kakaoTemp || googleTemp) {
      const tempUser = JSON.parse(kakaoTemp || googleTemp);
      const newUser = { ...tempUser, employeeId: Number(tempUser.employeeId) };

      setUser(newUser);
      setIsLoggedIn(true);
      saveMe(newUser);
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));

      localStorage.removeItem("kakao-temp-login");
      localStorage.removeItem("google-temp-login");

      console.log("임시 로그인 데이터 반영됨:", newUser);
    }

    // 기존 readMe 처리
    const storedUser = readMe();
    if (storedUser?.employeeId) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
    setIsLoading(false);

    let warned = false;
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

    const resetExpiration = () => {
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));
      warned = false;
    };
    window.addEventListener('mousemove', resetExpiration);
    window.addEventListener('keydown', resetExpiration);

    const onStorage = (e) => {
      if (e.key === 'me') {
        const m = readMe();
        setUser(m);
        setIsLoggedIn(!!m?.employeeId);
      }
    };
    window.addEventListener('storage', onStorage);

    const handleMessage = (event) => {
      const allowedOrigins = ["http://notfound.p-e.kr"];
      if (!allowedOrigins.includes(event.origin)) return;

      const { type, user } = event.data || {};
      if ((type === "kakao-login" || type === "google-login") && user) {
        const newUser = { ...user, employeeId: Number(user.employeeId) };
        setUser(newUser);
        setIsLoggedIn(true);
        saveMe(newUser);
        localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000));
        console.log(`${type} 상태 반영됨:`, newUser);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetExpiration);
      window.removeEventListener('keydown', resetExpiration);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      login,
      logout,
      handleKakaoLogin,
      handleGoogleLogin,
      loginError,
      setLoginError,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
