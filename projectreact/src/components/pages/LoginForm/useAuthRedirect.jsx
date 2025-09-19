// @ts-nocheck
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const useAuthRedirect = () => {
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    } else {
      setShowModal(false);
      setShouldRedirect(false);
    }
  }, [isLoggedIn]);

  const handleConfirm = () => {
    setShowModal(false);
    setShouldRedirect(true);
  };

  // ★ 추가: showModal일 때 뒤 화면(children) 렌더를 막기 위한 플래그
  // - '확인'을 눌러 shouldRedirect가 true가 된 순간엔 렌더 막지 않도록 예외 처리
  //   (즉시 <Navigate/>가 작동하며 화면 깜빡임 최소화)
  const blockChildren = showModal && !shouldRedirect && !isLoggedIn; // ★ 추가

  // ★ 추가: 블라인드가 떠 있는 동안 스크롤 잠금
  useEffect(() => {
    if (!blockChildren) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blockChildren]); // ★ 추가

  return {
    showModal,
    handleConfirm,
    shouldRedirect,
    isLoggedIn,
    blockChildren, // ★ 추가: ProtectedRoute에서 children 렌더 제어에 사용
  };
};

export default useAuthRedirect;
