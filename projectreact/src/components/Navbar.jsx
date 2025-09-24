// @ts-nocheck
import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from './pages/LoginForm/AuthContext';
import "./navbar.css";
import "./pages/LoginForm/modal.css";

const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

const googleColors = [
    '#4285F4', // 파란색
    '#DB4437', // 빨간색
    '#F4B400', // 노란색
    '#4285F4', // 파란색
    '#0F9D58', // 초록색
    '#DB4437', // 빨간색
];

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // ---------------------------
    // 환영 모달 표시
    // ---------------------------
    useEffect(() => {
        if (isLoggedIn && user) {
            const welcomeShown = localStorage.getItem('welcomeShown');
            if (!welcomeShown) {
                setShowWelcomeModal(true);
                localStorage.setItem('welcomeShown', 'true'); // 한 번만 표시
            }
        }
    }, [isLoggedIn, user]);

    const handleWelcomeConfirm = () => {
        setShowWelcomeModal(false); // 모달 닫기
        navigate("/"); // 메인페이지로 이동
        setTimeout(() => {
            window.location.reload(); // 0.5초 딜레이
        }, 500);
    };

    const handleLogout = () => setShowLogoutModal(true);

    const handleConfirmLogout = async () => {
        try {
            await logout();
            setShowLogoutModal(false);
            navigate("/");
        } catch (error) {
            console.error("로그아웃 처리 중 오류 발생:", error);
            setShowLogoutModal(false);
            navigate("/");
        }
    };

    // 구글 철자에 색상 적용 함수
    const getGoogleColor = (index) => ({
        color: googleColors[index % googleColors.length],
        fontWeight: 'bold',
        fontSize: '0.8em',
    });

    return (
        <>
            <header className="nav-root">
                <div className="nav-container">
                    {/* 로고 */}
                    <Link to="/" className="nav-brand" aria-label="홈으로">
                        <span className="nav-emoji" role="img" aria-label="plane">✈️</span>
                    </Link>

                    {/* 메뉴 */}
                    <nav className="nav-links" aria-label="주요 메뉴">
                        <NavLink to="/ApprovalList" className={linkClass}>결재</NavLink>
                        <NavLink to="/BoardPage/1" className={linkClass}>문서보관</NavLink>
                        <NavLink to="/ChatMain" className={linkClass}>메신저</NavLink>
                        <NavLink to="/Calendars" className={linkClass}>일정</NavLink>
                        <NavLink to="/FacilitiesList/1" className={linkClass}>시설물</NavLink>
                        <NavLink to="/AttendanceList/1" className={linkClass}>근태</NavLink>
                        <NavLink to="/MyPage" className={linkClass}>마이페이지</NavLink>
                        {/* ✅ 슬래시 추가 (상대경로 → 절대경로) */}
                        <NavLink to="/LocationMain" className={linkClass}>오시는길</NavLink>
                    </nav>

                    {/* 로그인 / 로그아웃 영역 */}
                    {isLoggedIn && user ? (
                        <div className="nav-auth-container" key={user.employeeId}>
                            <span className="nav-username">
                                {user.loginId.startsWith("kakao_") && (
                                    <span style={{ color: '#FEE500', fontWeight: 'bold', marginRight: '3px', fontSize: '0.8em' }}>
                                        Kakao
                                    </span>
                                )}
                                {user.loginId.startsWith("google_") && (
                                    <>
                                        {/* "Google" 텍스트 색상별로 표시 */}
                                        {"Google".split('').map((char, index) => (
                                            <span key={index} style={getGoogleColor(index)}>
                                                {char}
                                            </span>
                                        ))}
                                    </>
                                )}
                                {/* 실제 사용자 이름 */}
                                {user.name}님
                            </span>
                            <button onClick={handleLogout} className="nav-logout-btn">로그아웃</button>
                        </div>
                    ) : (
                        <Link to="/Login" className="nav-login nav-auth-container">로그인</Link>
                    )}
                </div>
            </header>

            {/* 로그아웃 모달 */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">로그아웃되었습니다.</p>
                        <button onClick={handleConfirmLogout} className="btn-primary-KHS">확인</button>
                    </div>
                </div>
            )}

            {/* 환영 모달 */}
            {showWelcomeModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">{user?.name}님, 환영합니다!</p>
                        <button onClick={handleWelcomeConfirm} className="btn-primary-KHS">확인</button>
                    </div>
                </div>
            )}
        </>
    );
}
