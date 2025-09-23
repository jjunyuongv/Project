// @ts-nocheck
import React, { useEffect } from "react"; // ★ useEffect 사용
import { Navigate, useLocation } from "react-router-dom";
import useAuthRedirect from "./useAuthRedirect";
import "./modal.css";

/* ──────────────────────────────────────────────────────────────────────────
   ★ 추가: 중복 안전(ref-count) 스크롤 잠금 유틸
   - 여러 곳에서 잠금이 걸려도 카운트를 올리고, 각각의 해제 지점에서 카운트를 내립니다.
   - 카운트가 0이 될 때만 실제로 잠금을 해제합니다.
   - iOS 사파리에서 배경 스크롤/바운스를 막기 위해 touchmove도 제어합니다.
   ────────────────────────────────────────────────────────────────────────── */
let __scrollLockCount = 0;
const __preventTouchMove = (e) => {
  // 모달 내부 스크롤은 허용
  if (e.target.closest(".modal-content")) return;
  e.preventDefault();
};

function lockScroll() {
  if (__scrollLockCount === 0) {
    document.documentElement.classList.add("scroll-lock");
    document.body.classList.add("scroll-lock");
    // iOS 대비: 배경 터치 스크롤 방지
    window.addEventListener("touchmove", __preventTouchMove, { passive: false });
  }
  __scrollLockCount++;
}

function unlockScroll() {
  __scrollLockCount = Math.max(0, __scrollLockCount - 1);
  if (__scrollLockCount === 0) {
    document.documentElement.classList.remove("scroll-lock");
    document.body.classList.remove("scroll-lock");
    window.removeEventListener("touchmove", __preventTouchMove);
  }
}
/* ────────────────────────────────────────────────────────────────────────── */

const ProtectedRoute = ({ children }) => {
  const { showModal, handleConfirm, shouldRedirect, isLoggedIn } = useAuthRedirect();
  const location = useLocation();

  /* ★ 변경: 모달 표시 동안만 스크롤 잠금, 해제도 확실히
     - 의존성: showModal
     - cleanup은 이전 showModal 상태 기준으로 호출되므로, "모달이 켜져 있던" 경우에만 해제 */
  useEffect(() => {
    if (showModal) lockScroll();
    return () => {
      if (showModal) unlockScroll();
    };
  }, [showModal]);

  /* ★ 추가: 라우트 변경 시(페이지 떠날 때) 혹시 남아있을 잠금을 반드시 해제
     - location.key가 바뀌면 cleanup 실행 */
  useEffect(() => {
    return () => {
      unlockScroll(); // 세이프가드
    };
  }, [location.key]);

  /* ★ 추가: 로그인 완료 or 리다이렉트 조건이 되면 잠금 해제 보장
     - 모달이 닫히지 않고 바로 Navigate가 렌더되는 경우를 커버 */
  useEffect(() => {
    if (isLoggedIn || shouldRedirect) {
      unlockScroll();
    }
  }, [isLoggedIn, shouldRedirect]);

  if (isLoggedIn) {
    return children;
  }

  if (shouldRedirect) {
    // 로그인 페이지로 이동할 때, 현재 경로를 state에 저장
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  if (showModal) {
    // ★ 기존 구조 유지: 배경을 렌더하지 않아 완전 블라인드
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

  // 초기 판별중 깜빡임 방지
  return null;
};

export default ProtectedRoute;
