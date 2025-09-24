// src/pages/ApprovalList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom"; // ★ 정리: useNavigate/useAuth 제거

// ▼ 변경: 배포/개발 공통 - 기본은 ''(상대경로)로 두고,
// .env에 '/api'가 들어오면 중복 방지를 위해 ''로 정규화
const RAW_API_BASE = import.meta?.env?.VITE_API_BASE ?? "";
const API_BASE = RAW_API_BASE.endsWith("/api") ? "" : (RAW_API_BASE || "");

/* === 공통 유틸(간단 유지) === */
class HttpError extends Error {
  constructor(status, statusText) {
    super(`${status} ${statusText}`.trim());
    this.name = "HttpError";
    this.status = status;
  }
}

// ★ 변경: XSRF 쿠키 읽기 유틸 추가(서버가 CookieCsrfTokenRepository 쓸 때 필요)
const getCookie = (name) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];

async function fetchOk(url, init = {}) {
  // ★ 변경: fetch에도 쿠키 동봉 + XSRF 헤더 자동 추가
  const headers = new Headers(init.headers || { Accept: "application/json" });
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include", // ★ 변경: 세션 쿠키(JSESSIONID) 포함
  });

  if (!res.ok) throw new HttpError(res.status, res.statusText);
  return res;
}

async function fetchJson(url, init) {
  const res = await fetchOk(url, init);
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const statusInfo = (s) => {
  switch (s) {
    case "APPROVED":
      return { label: "승인", cls: "badge rounded-pill bg-success" };
    case "REJECTED":
      return { label: "반려", cls: "badge rounded-pill bg-danger" };
    case "PENDING":
      return { label: "대기", cls: "badge rounded-pill bg-warning text-dark" };
    default:
      return { label: s || "-", cls: "badge rounded-pill bg-secondary" };
  }
};

const statusLabel = (s) =>
  s === "ALL"
    ? "전체 상태"
    : s === "PENDING"
    ? "대기"
    : s === "APPROVED"
    ? "승인"
    : s === "REJECTED"
    ? "반려"
    : s;

const categoryLabel = (c) =>
  c === "TIMEOFF" ? "휴가/근무 변경" : c === "SHIFT" ? "근무 교대" : "기타";

const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.includes("T") ? s.split("T")[0] : s;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function ApprovalList() {
  // ★ 정리: 페이지 내부 로그인 오버레이/가드 제거 (전역 ProtectedRoute가 처리)

  const [sp, setSp] = useSearchParams();
  const SIZE = 10;

  const pageFromQ = Math.max(0, parseInt(sp.get("page") || "0", 10));
  const statusFromQ = sp.get("status") || "ALL";
  const qFromQ = sp.get("q") || "";

  const [page, setPage] = useState(pageFromQ);
  const [status, setStatus] = useState(statusFromQ);
  const [q, setQ] = useState(qFromQ);

  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 0,
    totalElements: 0,
    number: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // URL 쿼리 싱크
  useEffect(() => {
    const next = new URLSearchParams();
    if (page > 0) next.set("page", String(page));
    if (status && status !== "ALL") next.set("status", status);
    if (q) next.set("q", q);
    setSp(next, { replace: true });
  }, [page, status, q, setSp]);

  // 목록 로드
  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(SIZE));
        if (status && status !== "ALL") params.set("status", status);
        if (q) params.set("q", q); // ★ 변경: 검색어(q)도 서버로 전달

        const data = await fetchJson(
          `${API_BASE}/api/approvals?${params.toString()}`,
          {
            headers: { Accept: "application/json" },
            signal: ctrl.signal,
          }
        );

        const {
          content = [],
          totalPages = 0,
          totalElements = 0,
          number = page,
          first = page === 0,
          last = number >= totalPages - 1,
        } = data || {};

        setRows(Array.isArray(content) ? content : []);
        setPageInfo({ totalPages, totalElements, number, first, last });
      } catch (e) {
        if (e?.name !== "AbortError") setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [page, status, q]); // ★ 변경: q 바뀌면 재조회

  const goPrev = useCallback(() => {
    if (pageInfo.first) return;
    setPage((p) => Math.max(0, p - 1));
  }, [pageInfo.first]);

  const goNext = useCallback(() => {
    if (pageInfo.last) return;
    setPage((p) => p + 1);
  }, [pageInfo.last]);

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">전자 결재</h1>
      </div>

      <main className="container-xxl py-4 flex-grow-1">
        {/* 상단 바 */}
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          {/* 상태 필터 */}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              type="button"
            >
              {statusLabel(status)}
            </button>
            <ul className="dropdown-menu">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                <li key={s}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setPage(0);
                      setStatus(s);
                    }}
                  >
                    {statusLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 검색 */}
          <div className="input-group" style={{ maxWidth: 520 }}>
            <input
              type="text"
              className="form-control"
              placeholder="제목으로 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setPage(0);
              }}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setPage(0)}
            >
              <i className="bi bi-search" />
            </button>
          </div>

          <Link to="/ApprovalWrite" className="btn btn-primary ms-auto">
            <i className="bi bi-pencil-square me-1" /> 글쓰기
          </Link>
        </div>

        {/* 에러 */}
        {err && (
          <div className="alert alert-danger" role="alert">
            {err}
          </div>
        )}

        {/* 목록 */}
        <div className="table-responsive shadow-sm rounded-3 bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: 90 }}>
                  번호
                </th>
                <th>제목</th>
                <th className="text-center" style={{ width: 160 }}>
                  유형
                </th>
                <th className="text-center" style={{ width: 140 }}>
                  작성자
                </th>
                <th className="text-center" style={{ width: 140 }}>
                  작성일
                </th>
                <th className="text-center" style={{ width: 120 }}>
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border" role="status" aria-hidden="true" />
                    <div className="small mt-2">불러오는 중…</div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const info = statusInfo(r.approvalStatus);
                  const displayNo = page * SIZE + (idx + 1);
                  const qs = sp.toString();
                  const to = `/ApprovalView/${encodeURIComponent(
                    r.approvalDocId
                  )}${qs ? `?${qs}` : ""}`;

                  return (
                    <tr key={r.approvalDocId}>
                      <td className="text-center">{displayNo}</td>
                      <td className="text-truncate" style={{ maxWidth: 900 }}>
                        <Link
                          to={to}
                          className="link-primary fw-semibold align-middle"
                        >
                          {r.approvalTitle || "(제목 없음)"}
                        </Link>
                        {/* NEW 배지 (노랑) */}
                        {r.isNew && (
                          <span className="badge rounded-pill bg-warning text-dark ms-2 align-middle">
                            N
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {categoryLabel(r.approvalCategory)}
                      </td>
                      <td className="text-center">{r.approvalAuthor}</td>
                      <td className="text-center">{fmtDate(r.approvalDate)}</td>
                      <td className="text-center">
                        <span className={info.cls}>{info.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지 네비 */}
        <nav
          className="mt-3 d-flex justify-content-center align-items-center gap-2"
          aria-label="페이지네이션"
        >
          <button
            className="btn btn-light border"
            onClick={() => setPage(0)}
            disabled={pageInfo.first}
          >
            « 처음
          </button>
          <button
            className="btn btn-light border"
            onClick={goPrev}
            disabled={pageInfo.first}
          >
            이전
          </button>
          <span className="mx-2 small text-muted">
            {pageInfo.totalPages > 0
              ? `${page + 1} / ${pageInfo.totalPages}`
              : `0 / 0`}
          </span>
          <button
            className="btn btn-light border"
            onClick={goNext}
            disabled={pageInfo.last || rows.length === 0}
          >
            다음
          </button>
          <button
            className="btn btn-light border"
            onClick={() => setPage(Math.max(0, pageInfo.totalPages - 1))}
            disabled={pageInfo.last || rows.length === 0}
          >
            마지막 »
          </button>
        </nav>
      </main>
    </div>
  );
}

export default ApprovalList;
