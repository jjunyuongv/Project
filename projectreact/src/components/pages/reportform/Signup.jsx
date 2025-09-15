// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./signup.css";

function Signup() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [authCode, setAuthCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authTimer, setAuthTimer] = useState(0);

  // 이미 로그인 상태면 메인으로
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 인증 타이머
  useEffect(() => {
    if (!isEmailSent || isEmailVerified) return;
    const timerId = setInterval(() => {
      setAuthTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setMessage("인증 시간이 초과되었습니다.");
          setShowModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isEmailSent, isEmailVerified]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "이름을 입력해주세요";
    if (!formData.loginId) newErrors.loginId = "아이디를 입력해주세요";
    if (!formData.email.includes("@")) newErrors.email = "유효한 이메일이 아닙니다";
    if (formData.password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    if (!formData.address) newErrors.address = "주소를 입력해주세요";
    if (!formData.phone) newErrors.phone = "휴대폰번호를 입력해주세요";
    return newErrors;
  };

  // ✅ 이메일 인증번호 발송 (/api 프록시 사용)
  const handleSendAuthCode = async () => {
    if (!formData.email) {
      setMessage("이메일을 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      await axios.post(
        "/api/email/send-auth-code",
        { email: formData.email },
        { withCredentials: true }
      );
      setIsEmailSent(true);
      setAuthTimer(300);
      setMessage("이메일로 인증번호가 발송되었습니다.");
      setShowModal(true);
    } catch (error) {
      console.error("이메일 전송 실패:", error);
      setMessage(error.response?.data || "이메일 전송에 실패했습니다.");
      setShowModal(true);
    }
  };

  // ✅ 이메일 인증번호 확인
  const handleVerifyAuthCode = async () => {
    if (!authCode) {
      setMessage("인증번호를 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      const res = await axios.post(
        "/api/email/verify-auth-code",
        { email: formData.email, authCode },
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsEmailVerified(true);
        setAuthTimer(0);
        setMessage("인증이 완료되었습니다!");
        setShowModal(true);
      } else {
        setMessage(res.data.message || "인증번호가 일치하지 않습니다.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("인증 실패:", error);
      setMessage(error.response?.data?.message || "인증번호 확인에 실패했습니다.");
      setShowModal(true);
    }
  };

  // ✅ 회원가입
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!isEmailVerified) {
      setMessage("이메일 인증을 완료해주세요.");
      setShowModal(true);
      return;
    }

    try {
      await axios.post(
        "/api/employees/signup",
        {
          name: formData.name,
          loginId: formData.loginId,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phone: formData.phone,
        },
        { withCredentials: true }
      );
      setMessage("회원가입이 완료되었습니다!");
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || "회원가입에 실패했습니다.");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (message === "회원가입이 완료되었습니다!") {
      navigate("/Login");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header>
        <section className="hero">
          <div className="hero-mask" />
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
            <h1 className="hero-title">회원가입</h1>
          </div>
        </section>
      </header>

      <main className="main-container">
        <div className="signup-card">
          <h3 className="text-center" style={{ marginBottom: "24px" }}>
            회원가입
          </h3>
          <form onSubmit={handleSubmit}>
            {/* 이름 */}
            <div className="form-group">
              <label className="form-label">이름</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
              {errors.name && <div className="text-danger">{errors.name}</div>}
            </div>

            {/* 아이디 */}
            <div className="form-group">
              <label className="form-label">아이디</label>
              <input type="text" className="form-control" name="loginId" value={formData.loginId} onChange={handleChange} />
              {errors.loginId && <div className="text-danger">{errors.loginId}</div>}
            </div>

            {/* 이메일 + 인증 발송 */}
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isEmailVerified}
              />
              {errors.email && <div className="text-danger">{errors.email}</div>}
              <button
                type="button"
                onClick={handleSendAuthCode}
                className="btn-primary auth-button"
                disabled={isEmailVerified}
              >
                {isEmailSent ? "재전송" : "인증번호 받기"}
              </button>
            </div>

            {/* 인증번호 입력/확인 */}
            {isEmailSent && !isEmailVerified && (
              <div className="form-group">
                <label className="form-label">인증번호</label>
                <input
                  type="text"
                  className="form-control"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
                <div style={{ fontSize: "14px", color: "#0d6efd", marginTop: "8px" }}>
                  남은 시간: {formatTime(authTimer)}
                </div>
                <button type="button" onClick={handleVerifyAuthCode} className="btn-primary auth-button">
                  인증 확인
                </button>
              </div>
            )}

            {/* 비밀번호 */}
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="text-danger">{errors.password}</div>}
            </div>

            {/* 비밀번호 확인 */}
            <div className="form-group">
              <label className="form-label">비밀번호 확인</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
            </div>

            {/* 주소 */}
            <div className="form-group">
              <label className="form-label">주소</label>
              <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />
              {errors.address && <div className="text-danger">{errors.address}</div>}
            </div>

            {/* 휴대폰 */}
            <div className="form-group">
              <label className="form-label">휴대폰번호</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <div className="text-danger">{errors.phone}</div>}
            </div>

            <button type="submit" className="btn-primary">가입하기</button>
          </form>

          <div className="login-link-container">
            이미 계정이 있나요?{" "}
            <Link to="/Login" className="black-link">
              로그인
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

export default Signup;
