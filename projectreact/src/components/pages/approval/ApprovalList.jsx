// src/pages/ApprovalList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8081";

const statusInfo = (s) => {
  switch (s) {
    case "APPROVED": return { label: "승인", cls: "badge rounded-pill bg-success" };
    case "REJECTED": return { label: "반려", cls: "badge rounded-pill bg-danger" };
    case "PENDING":  return { label: "대기",  cls: "badge rounded-pill bg-warning text-dark" };
    default:         return { label: s || "-", cls: "badge rounded-pill bg-secondary" };
  }
};

const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return (s.includes("T") ? s.split("T")[0] : s);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function ApprovalList() {
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
    totalPages: 0, totalElements: 0, number: 0, first: true, last: true,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // URL 쿼리싱크
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

        const res = await fetch(`${API_BASE}/api/approvals?` + params.toString(), {
          headers: { Accept: "application/json" },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`목록 조회 실패 (${res.status}) ${txt}`);
        }
        const data = await res.json();
        setRows(Array.isArray(data.content) ? data.content : []);
        setPageInfo({
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
          number: data.number ?? page,
          first: data.first ?? (page === 0),
          last: data.last ?? ((data.number ?? page) >= ((data.totalPages ?? 0) - 1)),
        });
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [page, status]);

  const styles = useMemo(() => ({
    hero: {
      height: 300,
      backgroundImage: "url('/Generated.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
    },
    heroMask: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 0 },
    heroContent: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
    heroTitle: { color: "#fff", fontSize: "44px", fontWeight: 800, letterSpacing: "2px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 },
  }), []);

  const goPrev = useCallback(() => {
    if (pageInfo.first) return;
    setPage((p) => Math.max(0, p - 1));
  }, [pageInfo.first]);

  const goNext = useCallback(() => {
    if (pageInfo.last) return;
    setPage((p) => p + 1);
  }, [pageInfo.last]);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={styles.hero}>
          <div style={styles.heroMask} />
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>전자 결재</h1>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1">
        {/* 상단 바 */}
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          {/* 상태 필터 */}
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" type="button">
              {status === "ALL" ? "전체 상태"
                : status === "PENDING" ? "대기"
                : status === "APPROVED" ? "승인"
                : status === "REJECTED" ? "반려" : status}
            </button>
            <ul className="dropdown-menu">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                <li key={s}>
                  <button className="dropdown-item" onClick={() => { setPage(0); setStatus(s); }}>
                    {s === "ALL" ? "전체 상태" : s === "PENDING" ? "대기" : s === "APPROVED" ? "승인" : "반려"}
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
              onKeyDown={(e) => { if (e.key === "Enter") setPage(0); }}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setPage(0)}>
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
                <th className="text-center" style={{ width: 90 }}>번호</th>
                <th>제목</th>
                <th className="text-center" style={{ width: 160 }}>유형</th>
                <th className="text-center" style={{ width: 140 }}>작성자</th>
                <th className="text-center" style={{ width: 140 }}>작성일</th>
                <th className="text-center" style={{ width: 120 }}>상태</th>
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
                  <td colSpan={6} className="text-center text-muted py-5">데이터가 없습니다.</td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const info = statusInfo(r.approvalStatus);
                  const displayNo = page * SIZE + (idx + 1);
                  const qs = sp.toString();
                  const to = `/ApprovalView/${encodeURIComponent(r.approvalDocId)}${qs ? `?${qs}` : ""}`;

                  return (
                    <tr key={r.approvalDocId}>
                      <td className="text-center">{displayNo}</td>
                      <td className="text-truncate" style={{ maxWidth: 900 }}>
                        <Link to={to} className="link-primary fw-semibold align-middle">
                          {r.approvalTitle || "(제목 없음)"}
                        </Link>
                        {/* NEW 배지 (노랑) */}
                        {r.isNew && (
                          <span className="badge rounded-pill bg-warning text-dark ms-2 align-middle">N</span>
                        )}
                      </td>
                      <td className="text-center">
                        {r.approvalCategory === "TIMEOFF" ? "휴가/근무 변경"
                          : r.approvalCategory === "SHIFT" ? "근무 교대"
                          : "기타"}
                      </td>
                      <td className="text-center">{r.approvalAuthor}</td>
                      <td className="text-center">{fmtDate(r.approvalDate)}</td>
                      <td className="text-center"><span className={info.cls}>{info.label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지 네비 */}
        <nav className="mt-3 d-flex justify-content-center align-items-center gap-2" aria-label="페이지네이션">
          <button className="btn btn-light border" onClick={() => setPage(0)} disabled={pageInfo.first}>« 처음</button>
          <button className="btn btn-light border" onClick={goPrev} disabled={pageInfo.first}>이전</button>
          <span className="mx-2 small text-muted">
            {pageInfo.totalPages > 0 ? `${page + 1} / ${pageInfo.totalPages}` : `0 / 0`}
          </span>
          <button className="btn btn-light border" onClick={goNext} disabled={pageInfo.last || rows.length === 0}>다음</button>
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
