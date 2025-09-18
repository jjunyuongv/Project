// @ts-nocheck
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthRedirect from "./useAuthRedirect";
import "./Modal.css";

const ProtectedRoute = ({ children }) => {
    const { showModal, handleConfirm, shouldRedirect, isLoggedIn } = useAuthRedirect();
    const location = useLocation();

    if (isLoggedIn) {
        return children;
    }

    if (shouldRedirect) {
        // 로그인 페이지로 이동할 때, 현재 경로를 state에 저장
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    if (showModal) {
        return (
            <>
                {children}
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">로그인이 필요합니다.</p>
                        <button onClick={handleConfirm} className="btn-primary-KHS">
                            확인
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default ProtectedRoute;
