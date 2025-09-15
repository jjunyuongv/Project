// SockJS 등 일부 라이브러리가 window 대신 global을 참조하는 경우가 있어 안전하게 매핑
if (typeof global === 'undefined') {
  window.global = window;
}