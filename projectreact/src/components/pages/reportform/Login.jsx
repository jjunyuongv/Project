// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ loginId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      const loggedInUser = await login(formData); // ✅ /api 프록시 사용 (AuthContext 내부)
      setMessage(`환영합니다, ${loggedInUser.name}님!`);
      setShowModal(true);
    } catch (error) {
      setMessage(error.message || "로그인 실패");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (message.startsWith("환영합니다")) {
      navigate(from, { replace: true });
    }
  };

  // (Optional) 소셜 로그인 자리
  const handleGoogleLogin = () => {};
  const handleKakaoLogin = () => {};

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section
          style={{
            height: 300,
            backgroundImage: "url('/Generated.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0 }} />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <h1
              style={{
                color: "#fff",
                fontSize: "44px",
                fontWeight: 800,
                letterSpacing: "2px",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                margin: 0,
              }}
            >
              로그인
            </h1>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1 d-flex justify-content-center align-items-start">
        <div className="login-card">
          <h3 className="text-center mb-4">로그인</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>아이디</label>
              <input
                type="text"
                name="loginId"
                className="form-control"
                value={formData.loginId}
                onChange={handleChange}
              />
              {errors.loginId && (
                <div className="text-danger small">{errors.loginId}</div>
              )}
            </div>

            <div className="mb-3">
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="text-danger small">{errors.password}</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">
              로그인
            </button>
          </form>

          <div className="social-login">
            <button className="google-btn" onClick={handleGoogleLogin}>
              <img src="/google-logo.png" alt="Google" className="social-logo" />{" "}
              Google 로그인
            </button>
            <button className="kakao-btn" onClick={handleKakaoLogin}>
              <img src="/kakao-logo.png" alt="Kakao" className="social-logo" />{" "}
              Kakao 로그인
            </button>
          </div>

          <div className="text-center mt-3">
            <Link to="/FindId" className="black-link">
              아이디 찾기
            </Link>{" "}
            |{" "}
            <Link to="/FindPassword" className="black-link">
              비밀번호 찾기
            </Link>{" "}
            |{" "}
            <Link to="/Signup" className="black-link">
              회원가입
            </Link>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">{message}</p>
            <button onClick={closeModal} className="btn-primary">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
