import { useEffect } from "react";
// ✅ 공용 axios 인스턴스 (baseURL: '/api', withCredentials, 인터셉터 포함)
import api from "../../../api/axios";

function GoogleRedirect() {
  useEffect(() => {
    const PARENT_ORIGIN = window.location.origin; // ← 배포/개발 공통
    console.log("GoogleRedirect mounted, URL:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errParam = params.get("error");
    console.log("Received code:", code, "error:", errParam);

    (async () => {
      if (!code) {
        console.log("No code found in URL");
        return;
      }
      try {
        // 🔁 하드코딩 URL 제거, 프록시/리버스프록시 환경 공통 사용
        const { data: user } = await api.post("/auth/google", { code });

        if (user && window.opener) {
          console.log("Sending user to parent window:", user);
          window.opener.postMessage({ type: "google-login", user }, PARENT_ORIGIN);
          window.close();
        } else if (user) {
          console.log("User received (no parent window):", user);
        }
      } catch (err) {
        console.error("Google login error:", err);
        if (window.opener) {
          window.opener.postMessage(
            { type: "google-login", error: err?.message || String(err) },
            PARENT_ORIGIN
          );
          window.close();
        }
      }
    })();
  }, []);

  return <div>구글 로그인 처리 중... 콘솔을 확인하세요.</div>;
}

export default GoogleRedirect;
