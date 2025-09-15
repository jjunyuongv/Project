// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ 현재 페이지 호스트 기준으로 절대 URL 생성 (프록시 경유 보장)
const API = (path) => new URL(path, window.location.origin).toString();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
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

      const expirationTime = Date.now() + 30 * 60 * 1000; // 30분
      localStorage.setItem('sessionExpiration', expirationTime.toString());

      setIsLoggedIn(true);
      setUser(response.data);
      return response.data;
    } catch (error) {
      localStorage.removeItem('sessionExpiration');
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
    }
  };

  // 세션 체크 + 5분 전 알림 + 만료 처리 + 사용자 활동으로 연장
  useEffect(() => {
    const checkSession = async () => {
      try {
        const url = API('/api/employees/session-check'); // ✅ 프록시 경유
        const response = await axios.get(url, { withCredentials: true });

        if (response.status === 200 && response.data) {
          setIsLoggedIn(true);
          setUser(response.data);

          if (!localStorage.getItem('sessionExpiration')) {
            const expirationTime = Date.now() + 30 * 60 * 1000;
            localStorage.setItem('sessionExpiration', expirationTime.toString());
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('sessionExpiration');
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('sessionExpiration');
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
      localStorage.setItem('sessionExpiration', newExpiration.toString());
      warned = false; // 경고 초기화
    };

    window.addEventListener('mousemove', resetExpiration);
    window.addEventListener('keydown', resetExpiration);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetExpiration);
      window.removeEventListener('keydown', resetExpiration);
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
