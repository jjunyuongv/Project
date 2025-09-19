// @ts-nocheck
import React, { useEffect } from "react"; // ★ 변경: useEffect 사용을 위해 구조분해 추가
import { Navigate, useLocation } from "react-router-dom";
import useAuthRedirect from "./useAuthRedirect";
import "./Modal.css";

const ProtectedRoute = ({ children }) => {
    const { showModal, handleConfirm, shouldRedirect, isLoggedIn } = useAuthRedirect();
    const location = useLocation();

    // ★ 추가: 모달 표시 중에는 배경 스크롤 잠금
    useEffect(() => {
        if (!showModal) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [showModal]);

    if (isLoggedIn) {
        return children;
    }

    if (shouldRedirect) {
        // 로그인 페이지로 이동할 때, 현재 경로를 state에 저장
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    if (showModal) {
        // ★ 변경: 블라인드 동작을 위해 "children"을 렌더하지 않음(배경 자체 미렌더 → 완전 가림)
        return (
            <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-content">
                    <p className="modal-message">로그인이 필요합니다.</p>
                    <button onClick={handleConfirm} className="btn-primary-KHS">
                        확인
                    </button>
                </div>
            </div>
        );
    }

    // ★ 추가 설명: showModal/shouldRedirect 판단 전 초기 상태에서는 아무것도 렌더하지 않음(깜빡임 방지)
    return null;
};

export default ProtectedRoute;
