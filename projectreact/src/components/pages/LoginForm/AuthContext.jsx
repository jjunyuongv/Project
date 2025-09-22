// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API = (path) => `http://localhost:8081${path}`; // 백엔드 실제 주소

function readMe() {
  try { return JSON.parse(localStorage.getItem('me') || 'null'); } catch { return null; }
}
function saveMe(me) { localStorage.setItem('me', JSON.stringify(me)); }
function clearMe() { localStorage.removeItem('me'); }

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 로그인 에러 상태 추가
  const [loginError, setLoginError] = useState(null);

  // ---------------------------
  // 일반 로그인
  // ---------------------------
  const login = async (dto) => {
    try {
      const url = API('/api/employees/login');
      const response = await axios.post(url, { loginId: dto.loginId, password: dto.password }, { withCredentials: true });
      const me = {
        employeeId: Number(response.data.employeeId),
        name: response.data.name,
        loginId: response.data.loginId,
        role: response.data.role
      };
      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000)); // 세션 만료 시간 설정

      // 🔹 로그인 성공 시 에러 초기화
      setLoginError(null);

      return me;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setLoginError(err.response.data); // 서버 메시지 저장
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
    try { await axios.post(API('/api/employees/logout'), {}, { withCredentials: true }); }
    catch (err) { console.error(err); }
    finally {
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
      const response = await axios.post(API('/api/auth/kakao'), { code }, { withCredentials: true });
      const data = response.data;
      const me = {
        employeeId: Number(data.employeeId),
        name: data.name,
        loginId: data.loginId,
        role: data.role,
        isKakao: data.loginId.startsWith("kakao_") // ✅ 카카오 로그인 여부 추가
      };

      saveMe(me);
      setIsLoggedIn(true);
      setUser(me);

      // 🔹 카카오 로그인 시 세션 시간 설정
      localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000)); // 세션 만료 시간 설정

    } catch (error) {
      console.error("카카오 로그인 중 오류 발생:", error);
    }
  };

  // ---------------------------
  // 구글 로그인 처리
  // ---------------------------
  const handleGoogleLogin = async (code) => {
  try {
    const response = await axios.post(API('/api/auth/google'), { code }, { withCredentials: true });
    const data = response.data;

    const me = {
      employeeId: Number(data.employeeId),
      name: data.name,
      loginId: data.loginId,
      role: data.role,
      isGoogle: data.loginId.startsWith("google_") // 구글 로그인 여부
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
  // 프론트 세션 체크 & 카카오 메시지 처리
  // ---------------------------
  useEffect(() => {
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
      if (event.origin !== "http://localhost:5173") return;
      const { type, user } = event.data;
      if (type === "kakao-login" && user) {
        const newUser = { ...user, employeeId: Number(user.employeeId) };
        setUser(newUser);
        setIsLoggedIn(true);
        saveMe(newUser);
        localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000)); // 세션 만료 시간 설정
        console.log("카카오 로그인 상태 반영됨:", newUser);
      }

        if (type === "google-login" && user) {
        const newUser = { ...user, employeeId: Number(user.employeeId) };
        setUser(newUser);
        setIsLoggedIn(true);
        saveMe(newUser);
        localStorage.setItem('sessionExpiration', String(Date.now() + 30 * 60 * 1000)); // 세션 만료 시간 설정
        console.log("구글 로그인 상태 반영됨:", newUser);
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
