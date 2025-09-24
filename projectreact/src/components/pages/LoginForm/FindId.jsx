import React, { useState } from "react";
import { Link } from "react-router-dom";
// ✅ 공용 axios 인스턴스 사용 (baseURL:'/api', withCredentials, 인터셉터 적용)
import api from '../../../api/axios';

function FindId() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    authCode: "",
  });
  const [message, setMessage] = useState("");  
  const [showModal, setShowModal] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [foundId, setFoundId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendAuthCode = async () => {
    const email = formData.email.trim(); // 공백 제거
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      await api.post(
        // ⬇️ '/api' 중복 금지: 인스턴스 baseURL이 이미 '/api'
        "/email/send-auth-code",
        { name: formData.name, email: formData.email, mode: "findId" }
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
    const email = formData.email.trim();
    const code = formData.authCode.trim();
    if (!code) {
      setMessage("인증번호를 입력해주세요.");
      setShowModal(true);
      return;
    }
    try {
      const response = await api.post(
        "/email/verify-auth-code",
        { email, authCode: code }
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
      setMessage(error.response?.data?.message || "인증번호 확인에 실패했습니다.");
      setShowModal(true);
    }
  };

  const handleFindId = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setMessage("이메일 인증을 먼저 완료해주세요.");
      setShowModal(true);
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      setMessage("이름을 입력해주세요.");
      setShowModal(true);
      return;
    }

    try {
      const response = await api.post(
        "/employees/find-id",
        { name, email }
      );

      setFoundId(response.data.foundId);
      setMessage(`아이디를 찾았습니다: ${response.data.foundId}`);
      setShowModal(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "일치하는 아이디를 찾을 수 없습니다.");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <style>
        {`
        .login-card { background-color: #fff; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: #fff; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.2); text-align: center; }
        .modal-message { margin-bottom: 1rem; font-size: 1.1rem; color: #333; }
        .black-link { color: #000; text-decoration: none; transition: color 0.2s ease; }
        .black-link:hover { color: #007bff; text-decoration: underline; }
        .btn { display: inline-block; font-weight: 400; line-height: 1.5; text-align: center; cursor: pointer; border-radius: 0.25rem; transition: all .15s; padding: 0.375rem 0.75rem; }
        .btn-primary { color: #fff; background-color: #0d6efd; border-color: #0d6efd; }
        .btn-primary:hover { background-color: #0b5ed7; border-color: #0a58ca; }
        .btn-secondary { color: #fff; background-color: #6c757d; border-color: #6c757d; }
        .btn-secondary:hover { background-color: #5c636a; border-color: #565e64; }
        .btn-success { color: #fff; background-color: #198754; border-color: #198754; }
        .btn-success:hover { background-color: #157347; border-color: #146c43; }
        .form-control { display: block; width: 100%; padding: 0.375rem 0.75rem; font-size: 1rem; border-radius: 0.25rem; border: 1px solid #ced4da; }
        .input-group { display: flex; }
        .input-group > .form-control { flex-grow: 1; }
        .input-group > .btn { border-top-left-radius: 0; border-bottom-left-radius: 0; }
        .bg-light { background-color: #f8f9fa; }
        .min-vh-100 { min-height: 100vh; }
        .d-flex { display: flex; }
        .flex-column { flex-direction: column; }
        .flex-grow-1 { flex-grow: 1; }
        .justify-content-center { justify-content: center; }
        .align-items-start { align-items: flex-start; }
        .container-xxl { max-width: 1320px; margin-left: auto; margin-right: auto; padding: 1rem; }
        .py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mb-3 { margin-bottom: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 1rem; }
        .w-100 { width: 100%; }
        .alert { position: relative; padding: 1rem; border: 1px solid transparent; border-radius: 0.25rem; }
        .alert-success { color: #0f5132; background-color: #d1e7dd; border-color: #badbcc; }
        `}
      </style>

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
                아이디 찾기
              </h1>
            </div>
          </section>
        </header>

        <main className="container-xxl py-4 flex-grow-1 d-flex justify-content-center align-items-start">
          <div className="login-card">
            <h3 className="text-center mb-4">아이디 찾기</h3>

            {foundId ? (
              <div className="alert alert-success text-center">
                <strong>회원님의 아이디는:</strong> <br />
                <h4 className="mt-2">{foundId}</h4>
              </div>
            ) : (
              <form onSubmit={handleFindId}>
                <div className="mb-3">
                  <label>이름</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label>이메일</label>
                  <div className="input-group">
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={isEmailVerified} />
                    <button type="button" onClick={handleSendAuthCode} className="btn btn-secondary">
                      {isEmailSent ? "재전송" : "인증번호 받기"}
                    </button>
                  </div>
                </div>

                {isEmailSent && !isEmailVerified && (
                  <div className="mb-3">
                    <label>인증번호</label>
                    <div className="input-group">
                      <input type="text" name="authCode" className="form-control" value={formData.authCode} onChange={handleChange} />
                      <button type="button" onClick={handleVerifyAuthCode} className="btn btn-success">
                        확인
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100">
                  아이디 찾기
                </button>
              </form>
            )}

            <div className="text-center mt-3">
              {foundId ? (
                <Link to="/Login" className="black-link">
                  로그인
                </Link>
              ) : (
                <>
                  <Link to="/Login" className="black-link">
                    로그인
                  </Link>{" "}
                  |{" "}
                  <Link to="/Signup" className="black-link">
                    회원가입
                  </Link>
                </>
              )}
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
    </>
  );
}

export default FindId;
