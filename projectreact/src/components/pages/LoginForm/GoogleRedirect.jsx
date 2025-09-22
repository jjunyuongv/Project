import { useEffect } from "react";

function GoogleRedirect() {
  useEffect(() => {
    const PARENT_ORIGIN = "http://localhost:5173"; // 부모 창 origin
    console.log("GoogleRedirect mounted, URL:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    console.log("Received code:", code);

    if (code) {
      fetch(`http://localhost:8081/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include"
      })
        .then(async (res) => {
          console.log("Fetch response status:", res.status);
          const data = await res.json().catch(() => null);
          console.log("Fetch response data:", data);
          return data;
        })
        .then(user => {
          if (user && window.opener) {
            console.log("Sending user to parent window:", user);
            window.opener.postMessage({ type: "google-login", user }, PARENT_ORIGIN);
            window.close();
          } else if (user) {
            console.log("User received (no parent window):", user);
          }
        })
        .catch(err => {
          console.error("Google login error:", err);
          if (window.opener) {
            window.opener.postMessage({ type: "google-login", error: err.message }, PARENT_ORIGIN);
            window.close();
          }
        });
    } else {
      console.log("No code found in URL");
    }
  }, []);

  return <div>구글 로그인 처리 중... 콘솔 확인하세요.</div>;
}

export default GoogleRedirect;
