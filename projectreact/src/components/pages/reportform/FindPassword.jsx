// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './login.css';
import './findAccount.css';

function FindPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: "",
    email: "",
    authCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendAuthCode = async () => {
    if (!formData.loginId || !formData.email) {
      setMessage("아이디와 이메일을 모두 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      await axios.post(
        "/api/email/send-auth-code",
        { loginId: formData.loginId, email: formData.email },
        { withCredentials: true }
      );
      setIsEmailSent(true);
      setMessage("이메일로 인증번호가 발송되었습니다.");
      setShowModal(true);
    } catch (error) {
      setMessage(error.response?.data || "이메일 전송에 실패했습니다.");
      setShowModal(true);
    }
  };

  const handleVerifyAuthCode = async () => {
    if (!formData.authCode) {
      setMessage("인증번호를 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      const response = await axios.post(
        "/api/email/verify-auth-code",
        { email: formData.email, authCode: formData.authCode },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsEmailVerified(true);
        setMessage("인증이 완료되었습니다!");
        setShowModal(true);
      } else {
        setMessage(response.data.message || "인증번호가 일치하지 않습니다.");
        setShowModal(true);
      }
    } catch (error) {
      setMessage(error.response?.data || "인증번호 확인에 실패했습니다.");
      setShowModal(true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setMessage("이메일 인증을 먼저 완료해주세요.");
      setShowModal(true);
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage("비밀번호는 6자 이상이어야 합니다.");
      setShowModal(true);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setShowModal(true);
      return;
    }

    const payload = {
      loginId: formData.loginId.trim(),
      email: formData.email.trim(),
      newPassword: formData.newPassword,
      authCode: formData.authCode.trim()
    };

    try {
      await axios.post(
        "/api/employees/reset-password",
        payload,
        { withCredentials: true }
      );
      setMessage("비밀번호가 성공적으로 재설정되었습니다.");
      setShowModal(true);
    } catch (error) {
      setMessage(error.response?.data || "비밀번호 재설정에 실패했습니다.");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (message === "비밀번호가 성공적으로 재설정되었습니다.") {
      navigate("/Login");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={{ height: 300, backgroundImage: "url('/Generated.png')", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <h1 style={{ color: "#fff", fontSize: "44px", fontWeight: 800, letterSpacing: "2px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 }}>
              비밀번호 찾기
            </h1>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1 d-flex justify-content-center align-items-start">
        <div className="login-card">
          <h3 className="text-center mb-4">비밀번호 재설정</h3>

          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label>아이디</label>
              <input type="text" name="loginId" className="form-control" value={formData.loginId} onChange={handleChange} disabled={isEmailVerified} />
            </div>

            <div className="mb-3">
              <label>이메일</label>
              <div className="input-group">
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={isEmailVerified} />
                <button type="button" onClick={handleSendAuthCode} className="btn btn-secondary" disabled={isEmailVerified}>
                  {isEmailSent ? "재전송" : "인증번호 받기"}
                </button>
              </div>
            </div>

            {isEmailSent && !isEmailVerified && (
              <div className="mb-3">
                <label>인증번호</label>
                <div className="input-group">
                  <input type="text" name="authCode" className="form-control" value={formData.authCode} onChange={handleChange} />
                  <button type="button" onClick={handleVerifyAuthCode} className="btn btn-success">확인</button>
                </div>
              </div>
            )}

            {isEmailVerified && (
              <>
                <div className="mb-3">
                  <label>새 비밀번호</label>
                  <input type="password" name="newPassword" className="form-control" value={formData.newPassword} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label>새 비밀번호 확인</label>
                  <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-100" disabled={!isEmailVerified}>
              비밀번호 재설정
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/Login" className="black-link">로그인</Link> | <Link to="/Signup" className="black-link">회원가입</Link>
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

export default FindPassword;
