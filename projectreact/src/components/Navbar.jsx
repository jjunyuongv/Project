// @ts-nocheck
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from './pages/reportform/AuthContext';
import "./navbar.css";
import "./pages/reportform/modal.css";

const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ 로그아웃 모달 상태

    // ✅ 로그아웃 버튼 클릭 핸들러: 즉시 모달을 띄웁니다.
    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    // ✅ 모달 '확인' 버튼 클릭 핸들러: 실제로 로그아웃을 처리하고 페이지를 이동합니다.
    const handleConfirmLogout = async () => {
        try {
            await logout(); // 로그아웃 API 호출
            setShowLogoutModal(false); // 모달 닫기
            navigate("/"); // 메인 페이지로 이동
        } catch (error) {
            console.error("로그아웃 처리 중 오류 발생:", error);
            setShowLogoutModal(false);
            navigate("/");
        }
    };

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
                        <NavLink to="/BoardPage" className={linkClass}>문서보관</NavLink>
                        <NavLink to="/ReportList" className={linkClass}>업무보고</NavLink>
                        <NavLink to="/ChatMain" className={linkClass}>메신저</NavLink>
                        <NavLink to="/Calendars" className={linkClass}>일정</NavLink>
                        <NavLink to="/FacilitiesList/1" className={linkClass}>시설물</NavLink>
                        <NavLink to="/AttendanceList/1" className={linkClass}>근태</NavLink>
                    </nav>

                    {/* 로그인 / 로그아웃 영역 */}
                    {isLoggedIn ? (
                        <div className="nav-auth-container">
                            <span className="nav-username">{user.name}님</span>
                            <button onClick={handleLogout} className="nav-logout-btn">로그아웃</button>
                        </div>
                    ) : (
                        <Link to="/Login" className="nav-login nav-auth-container">로그인</Link>
                    )}
                </div>
            </header>

            {/* ✅ 로그아웃 메시지 모달 추가 */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">로그아웃되었습니다.</p>
                        <button onClick={handleConfirmLogout} className="btn-primary">확인</button>
                    </div>
                </div>
            )}
        </>
    );
}