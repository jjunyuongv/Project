// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from './AuthContext';
import './login.css';

function Login() {
  const { login, loginError, setLoginError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ loginId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.loginId) newErrors.loginId = "아이디를 입력해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const loggedInUser = await login(formData);
      setMessage(`환영합니다, ${loggedInUser.name}님!`); // employeeName → name
      setShowModal(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data);
      } else {
        setMessage("로그인 실패: 알 수 없는 오류");
      }
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (message.startsWith('환영합니다')) {
      navigate(from, { replace: true });
    }
  };

  const handleKakaoLogin = () => {
    const JS_KEY = "eb030c320f22b162356f3e23377e325d"; 
    const REDIRECT_URI = "http://localhost:5173/kakao-redirect"; // 프론트 React 라우트
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${JS_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      KAKAO_AUTH_URL,
      "KakaoLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // 팝업 메시지 수신
    const listener = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "kakao-login") {
        if (event.data.error) {
          setMessage(`카카오 로그인 실패: ${event.data.error}`);
        } else if (event.data.user) {
          const user = event.data.user;
          console.log("Kakao user received:", user); // 디버깅용
          setMessage(`환영합니다, ${user.name}님!`); // employeeName → name
          setShowModal(true);
        }
        window.removeEventListener("message", listener);
      }
    };

    window.addEventListener("message", listener);
  };

  const handleGoogleLogin = () => {
    const CLIENT_ID = "671525201402-78tr6u9ukehovd5b5lb97j47u9o7j1vu.apps.googleusercontent.com"; // Google API Client ID
    const REDIRECT_URI = "http://localhost:5173/google-redirect"; // 구글 리다이렉트 URI

    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      GOOGLE_AUTH_URL,
      "GoogleLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // 팝업 메시지 수신
    const listener = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "google-login") {
        if (event.data.error) {
          setMessage(`구글 로그인 실패: ${event.data.error}`);
        } else if (event.data.user) {
          const user = event.data.user;
          console.log("Google user received:", user); // 디버깅용
          setMessage(`환영합니다, ${user.name}님!`); // employeeName → name
          setShowModal(true);
        }
        window.removeEventListener("message", listener);
      }
    };

    window.addEventListener("message", listener);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={{
          height: 300,
          backgroundImage: "url('/Generated.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <h1 style={{ color: "#fff", fontSize: "44px", fontWeight: 800, letterSpacing: "2px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 }}>로그인</h1>
          </div>
        </section>
      </header>
      <main className="container-xxl py-4 flex-grow-1 d-flex justify-content-center align-items-start">
        <div className="login-card">
          <h3 className="text-center mb-4">로그인</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>아이디</label>
              <input type="text" name="loginId" className="form-control" value={formData.loginId} onChange={handleChange} />
              {errors.loginId && <div className="text-danger small">{errors.loginId}</div>}
            </div>

            <div className="mb-3">
              <label>비밀번호</label>
              <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
              {errors.password && <div className="text-danger small">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">로그인</button>
          </form>

          <div className="social-login">
            <button className="google-btn" onClick={handleGoogleLogin}>
              <img src="/google-logo.png" alt="Google" className="social-logo" /> Google 로그인
            </button>
            <button className="kakao-btn" onClick={handleKakaoLogin}>
              <img src="/kakao-logo.png" alt="Kakao" className="social-logo" /> Kakao 로그인
            </button>
          </div>

          <div className="text-center mt-3">
            <Link to="/FindId" className="black-link">아이디 찾기</Link> | <Link to="/FindPassword" className="black-link">비밀번호 찾기</Link> | <Link to="/Signup" className="black-link">회원가입</Link>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">{message}</p>
            <button onClick={closeModal} className="btn-primary-KHS">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
