// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from './AuthContext';
import './signup.css';
import './modal.css';

function Signup() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const departments = {
        "운항": ["기장", "부기장", "항공교통관제사", "운항관리사"],
        "객실 서비스": ["사무장", "승무원"],
        "지상 지원": ["지상 관리자", "수하물 관리사", "항공기 정비사", "보안 검색 요원"]
    };

    const [formData, setFormData] = useState({
        name: "",
        gender: "",   // ✅ 성별 추가
        loginId: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        phone: "",
        department: "",
        job: ""
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [authCode, setAuthCode] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [authTimer, setAuthTimer] = useState(0);

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/", { replace: true });
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (!isEmailSent || isEmailVerified) return;
        const timerId = setInterval(() => {
            setAuthTimer(prev => {
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
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: null
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "이름을 입력해주세요";
        if (!formData.gender) newErrors.gender = "성별을 선택해주세요";
        if (!formData.loginId) newErrors.loginId = "아이디를 입력해주세요";
        if (!formData.email.includes("@")) newErrors.email = "유효한 이메일이 아닙니다";
        if (formData.password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
        if (!formData.address) newErrors.address = "주소를 입력해주세요";
        if (!formData.phone) newErrors.phone = "휴대폰번호를 입력해주세요";
        if (!formData.department) newErrors.department = "부서를 선택해주세요";
        if (!formData.job) newErrors.job = "직무를 선택해주세요";
        return newErrors;
    };

    const handleSendAuthCode = async () => {
        if (!formData.email) {
            setMessage("이메일을 입력해주세요.");
            setShowModal(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage("유효한 이메일 형식이 아닙니다.");
            setShowModal(true);
            return;
        }

        try {
            await axios.post("http://localhost:8081/api/email/send-auth-code", { 
                email: formData.email,
                mode: "signup"
            });
            setIsEmailSent(true);
            setAuthTimer(300);
            setMessage("이메일로 인증번호가 발송되었습니다.");
            setShowModal(true);
        } catch (error) {
            console.error(error);
            const serverMessage = error.response?.data?.message || error.response?.data || "이메일 전송에 실패했습니다.";
            setMessage(serverMessage);
            setShowModal(true);
        }
    };

    const handleVerifyAuthCode = async () => {
        const trimmedCode = authCode.trim();
        if (!trimmedCode) {
            setMessage("인증번호를 입력해주세요.");
            setShowModal(true);
            return;
        }
        try {
            const response = await axios.post("http://localhost:8081/api/email/verify-auth-code", {
                email: formData.email,
                authCode: authCode
            });
            if (response.data.success) {
                setIsEmailVerified(true);
                setAuthTimer(0); 
                setMessage("인증이 완료되었습니다!");
                setShowModal(true);
            } else {
                setMessage(response.data.message || "인증번호가 일치하지 않습니다.");
                setShowModal(true);
            }
        } catch (error) {
            console.error("인증 실패:", error);
            setMessage(error.response?.data.message || "인증번호 확인에 실패했습니다.");
            setShowModal(true);
        }
    };

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
                "http://localhost:8081/api/employees/signup",
                formData,
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
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const daumAPI = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setFormData((prev) => ({ ...prev, address: data.address }));
            }
        }).open();
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header>
                <section className="hero">
                    <div className="hero-mask" />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <h1 className="hero-title">회원가입</h1>
                    </div>
                </section>
            </header>

            <main className="main-container">
                <div className="signup-card">
                    <h3 className="text-center" style={{ marginBottom: '24px' }}>회원가입</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">이름</label>
                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
                            {errors.name && <div className="text-danger">{errors.name}</div>}
                        </div>

                        {/* ✅ 성별 선택 (라벨 없이 바로 표시) */}
                        <div className="form-group" style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="남자"
                                    checked={formData.gender === "남자"}
                                    onChange={handleChange}
                                />
                                남자
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="여자"
                                    checked={formData.gender === "여자"}
                                    onChange={handleChange}
                                />
                                여자
                            </label>
                        </div>
                        {errors.gender && <div className="text-danger">{errors.gender}</div>}

                        {/* ✅ 부서 선택 */}
                        <div className="form-group">
                            <label className="form-label">부서</label>
                            <select
                                className="form-control"
                                name="department"
                                value={formData.department}
                                onChange={(e) => {
                                    setFormData({ ...formData, department: e.target.value, job: "" });
                                    setErrors(prev => ({ ...prev, department: null, job: null }));
                                }}
                            >
                                <option value="">부서를 선택하세요</option>
                                {Object.keys(departments).map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            {errors.department && <div className="text-danger">{errors.department}</div>}
                        </div>

                        {/* ✅ 직무 선택 */}
                        {formData.department && (
                            <div className="form-group">
                                <label className="form-label">직무</label>
                                <select
                                    className="form-control"
                                    name="job"
                                    value={formData.job}
                                    onChange={handleChange}
                                >
                                    <option value="">직무를 선택하세요</option>
                                    {departments[formData.department].map(job => (
                                        <option key={job} value={job}>{job}</option>
                                    ))}
                                </select>
                                {errors.job && <div className="text-danger">{errors.job}</div>}
                            </div>
                        )}

                        {/* 아이디, 이메일, 인증, 비밀번호, 주소, 휴대폰 기존 코드 유지 */}
                        <div className="form-group">
                            <label className="form-label">아이디</label>
                            <input type="text" className="form-control" name="loginId" value={formData.loginId} onChange={handleChange} />
                            {errors.loginId && <div className="text-danger">{errors.loginId}</div>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">이메일</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} disabled={isEmailVerified} />
                            {errors.email && <div className="text-danger">{errors.email}</div>}
                            <button type="button" onClick={handleSendAuthCode} className="btn-primary-KHS auth-button" disabled={isEmailVerified}>
                                {isEmailSent ? "재전송" : "인증번호 받기"}
                            </button>
                        </div>

                        {isEmailSent && !isEmailVerified && (
                            <div className="form-group">
                                <label className="form-label">인증번호</label>
                                <input type="text" className="form-control" value={authCode} onChange={(e) => setAuthCode(e.target.value)} />
                                <div style={{ fontSize: '14px', color: '#0d6efd', marginTop: '8px' }}>남은 시간: {formatTime(authTimer)}</div>
                                <button type="button" onClick={handleVerifyAuthCode} className="btn-primary-KHS auth-button">인증 확인</button>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">비밀번호</label>
                            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                            {errors.password && <div className="text-danger">{errors.password}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">비밀번호 확인</label>
                            <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                            {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">주소</label>
                            <div style={{ display: "flex", gap: "8px", whiteSpace: "nowrap" }}>
                                <input type="text" className="form-control" name="address" value={formData.address} readOnly />
                                <button type="button" onClick={daumAPI} className="btn-primary-KHS">주소검색</button>
                            </div>
                            {errors.address && <div className="text-danger">{errors.address}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">휴대폰번호</label>
                            <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                            {errors.phone && <div className="text-danger">{errors.phone}</div>}
                        </div>

                        <button type="submit" className="btn-primary-KHS">가입하기</button>
                    </form>

                    <div className="login-link-container">
                        이미 계정이 있나요?{" "}
                        <Link to="/Login" className="black-link">로그인</Link>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">{message}</p>
                        <button onClick={closeModal} className="btn-primary-KHS">확인</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;
