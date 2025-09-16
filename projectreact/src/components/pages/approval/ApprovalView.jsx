// src/pages/ApprovalView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8081";

/* localStorage("me")에서 로그인 사용자 정보 읽기 */
function useCurrentUser() {
  const [me, setMe] = useState(() => {
    try {
      const raw = localStorage.getItem("me");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "me") {
        try { setMe(e.newValue ? JSON.parse(e.newValue) : null); }
        catch { setMe(null); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return me;
}

/* 여러 필드 중 숫자형 사번 뽑기 */
function extractEmpId(me) {
  const cand = [me?.employeeId, me?.userId, me?.username, me?.loginId];
  for (const c of cand) {
    if (c == null) continue;
    const n = Number(c);
    if (Number.isFinite(n)) return String(n);
  }
  return null;
}

/* 상태 뱃지 */
function statusBadgeInfo(s) {
  switch (String(s || "").toUpperCase()) {
    case "APPROVED": return { label: "승인",  cls: "badge rounded-pill bg-success" };
    case "REJECTED": return { label: "반려",  cls: "badge rounded-pill bg-danger" };
    case "PENDING":  return { label: "대기",  cls: "badge rounded-pill bg-warning text-dark" };
    default:         return { label: s || "-", cls: "badge rounded-pill bg-secondary" };
  }
}

/* 보조 포맷터 */
const toCategoryLabel = (c) =>
  c === "TIMEOFF" ? "휴가/근무 변경" : c === "SHIFT" ? "근무 교대" : c || "-";

const fmtDate = (s, withTime = true) => {
  if (!s) return "-";
  const d = new Date(s);
  const pad = (n) => String(n).padStart(2, "0");
  if (Number.isNaN(d.getTime()))
    return withTime ? s.replace("T", " ") : (s.includes("T") ? s.split("T")[0] : s);
  const Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
  if (!withTime) return `${Y}-${M}-${D}`;
  const h = pad(d.getHours()), m = pad(d.getMinutes());
  return `${Y}-${M}-${D} ${h}:${m}`;
};

function ApprovalView() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { id, num } = useParams();
  const docId = id ?? num;

  const me = useCurrentUser();
  const myEmpId = extractEmpId(me);
  const ADMIN_EMP_ID = "20250001"; // 필요시 .env로 분리

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [deciding, setDeciding] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  // 상세 로딩 (X-Employee-Id 헤더 포함)
  useEffect(() => {
    if (!docId) return;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr(null);
      try {
        const headers = { Accept: "application/json" };
        if (myEmpId) headers["X-Employee-Id"] = myEmpId;
        const res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(docId)}`, {
          headers, signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`상세 조회 실패 (${res.status})`);
        const data = await res.json();
        setDoc(data);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [docId, myEmpId]);

  // 결재 이력 정렬
  const lines = useMemo(() => {
    const arr = doc?.lines || [];
    return [...arr].sort((a, b) => (a.approvalSequence ?? 0) - (b.approvalSequence ?? 0));
  }, [doc]);

  // 관리자 여부
  const isAdmin =
    (myEmpId && myEmpId === ADMIN_EMP_ID) ||
    (Array.isArray(me?.roles) && me.roles.includes("ROLE_ADMIN"));

  // 승인/반려 버튼 노출
  const canDecide =
    doc?.approvalStatus === "PENDING" && (doc?.canApprove === true || isAdmin);

  // 삭제 권한
  const isOwner = useMemo(() => {
    if (!doc || !myEmpId) return false;
    return String(doc.approvalAuthor) === String(myEmpId);
  }, [doc, myEmpId]);

  const canDelete = useMemo(() => {
    if (!doc) return false;
    if (isAdmin) return true;
    if (doc.approvalStatus === "APPROVED") return false;
    return isOwner;
  }, [doc, isAdmin, isOwner]);

  // 승인/반려
  const decide = async (action, reason) => {
    if (!docId) return;
    setDeciding(true);
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(docId)}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Employee-Id": myEmpId, // 필수
        },
        body: JSON.stringify(reason ? { opinion: reason } : {}),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${action} 실패 (${res.status}) ${txt}`);
      }
      navigate(0); // 새로고침
      setRejectOpen(false);
      setRejectReason("");
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setDeciding(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!docId) return;
    if (!window.confirm(`정말 삭제할까요?\n\n문서번호: ${doc?.approvalDocId}\n제목: ${doc?.approvalTitle || ""}`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(docId)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Employee-Id": myEmpId, // 필수
        },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`삭제 실패 (${res.status}) ${txt}`);
      }
      alert("삭제되었습니다.");
      navigate(`/ApprovalList${loc.search || ""}`);
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setDeleting(false);
    }
  };

  const styles = {
    pre: { whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 180 },
    hero: { height: 300, backgroundImage: "url('/Generated.png')", backgroundSize: "cover", backgroundPosition: "center", position: "relative" },
    heroMask: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 0 },
    heroContent: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
    heroTitle: { color: "#fff", fontSize: "44px", fontWeight: 800, letterSpacing: "2px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 },
  };

  const infoDoc = statusBadgeInfo(doc?.approvalStatus);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={styles.hero}>
          <div style={styles.heroMask} />
          <div style={styles.heroContent}><h1 style={styles.heroTitle}>상세 보기</h1></div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1">
        {/* 상단 버튼 */}
        <div className="d-flex flex-wrap gap-2 justify-content-end mb-3">
          <Link to={`/ApprovalList${loc.search || ""}`} className="btn btn-light border shadow-sm">
            <i className="bi bi-list me-1" /> 목록
          </Link>
          <Link to={`/ApprovalEdit?docId=${encodeURIComponent(docId || "")}`} className="btn btn-primary">
            <i className="bi bi-pencil-square me-1" /> 수정
          </Link>
          {canDelete && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDelete}
              disabled={deleting}
              title={isAdmin ? "관리자 권한으로 삭제" : "작성자 본인이 삭제"}
            >
              {deleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                  삭제 중…
                </>
              ) : (
                <>
                  <i className="bi bi-trash3 me-1" />
                  삭제
                </>
              )}
            </button>
          )}
        </div>

        {err && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>상세 조회 중 오류가 발생했습니다.<br />{err}</div>
            <button className="btn btn-sm btn-light" onClick={() => navigate(0)}>재시도</button>
          </div>
        )}
        {loading && (
          <div className="card shadow-sm mb-3">
            <div className="card-body d-flex align-items-center gap-2">
              <div className="spinner-border" role="status" aria-hidden="true" />
              <span>불러오는 중…</span>
            </div>
          </div>
        )}

        {!loading && !err && doc && (
          <>
            {/* 승인/반려 패널 */}
            {canDecide && (
              <div className="card shadow-sm mb-3">
                <div className="card-body d-flex flex-wrap justify-content-end gap-2">
                  <button className="btn btn-success" disabled={deciding} onClick={() => decide("approve")}>
                    <i className="bi bi-check2-circle me-1" /> 승인
                  </button>
                  <button className="btn btn-outline-danger" disabled={deciding} onClick={() => setRejectOpen(v => !v)}>
                    <i className="bi bi-x-circle me-1" /> 반려
                  </button>
                </div>
                {rejectOpen && (
                  <div className="card-body border-top bg-light">
                    <label className="form-label">반려 사유</label>
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger"
                        disabled={deciding || !rejectReason.trim()}
                        onClick={() => decide("reject", rejectReason.trim())}
                      >
                        반려 확정
                      </button>
                      <button className="btn btn-secondary" onClick={() => { setRejectOpen(false); setRejectReason(""); }}>
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 요약 */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h3 className="h5 fw-bold mb-3">{doc.approvalTitle}</h3>
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light" style={{ width: 160 }}>문서번호</th>
                        <td>{doc.approvalDocId}</td>
                        <th className="bg-light" style={{ width: 160 }}>상태</th>
                        <td><span className={infoDoc.cls}>{infoDoc.label}</span></td>
                      </tr>
                      <tr>
                        <th className="bg-light">문서 유형</th>
                        <td>{toCategoryLabel(doc.approvalCategory)}</td>
                        <th className="bg-light">작성자</th>
                        <td>{doc.approvalAuthor}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">작성일</th>
                        <td>{fmtDate(doc.approvalDate)}</td>
                        <th className="bg-light">첨부</th>
                        <td>
                          {doc.ofile && doc.sfile ? (
                            <a
                              href={`${API_BASE}/api/approvals/${encodeURIComponent(doc.approvalDocId)}/file`}
                              className="link-secondary text-decoration-none"
                            >
                              <i className="bi bi-paperclip me-1" />
                              {doc.ofile}
                            </a>
                          ) : (
                            <span className="text-muted">없음</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 내용 */}
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-white"><strong>내용</strong></div>
              <div className="card-body"><div style={styles.pre}>{doc.approvalContent || "-"}</div></div>
            </div>

            {/* 결재 이력 */}
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-white"><strong>결재 이력</strong></div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{ width: 220 }}>결재자</th>
                        <th className="text-center" style={{ width: 140 }}>상태</th>
                        <th className="text-center" style={{ width: 200 }}>일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-4">
                            결재 이력이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        lines.map((l) => {
                          const li = statusBadgeInfo(l.approvalLineStatus);
                          const isPending = String(l.approvalLineStatus).toUpperCase() === "PENDING" && !l.approvalLineDate;
                          return (
                            <tr key={l.approvalLineIdx}>
                              {/* 결재자: 대기면 '-' */}
                              <td className="text-center">
                                {isPending ? (
                                  "-"
                                ) : (
                                  <>
                                    <div className="fw-semibold">{l.approverName || "-"}</div>
                                    {l.approvalId != null && (
                                      <div className="small text-muted">{l.approvalId}</div>
                                    )}
                                  </>
                                )}
                              </td>

                              {/* 상태 */}
                              <td className="text-center">
                                <span className={li.cls}>{li.label}</span>
                              </td>

                              {/* 일시 */}
                              <td className="text-center">
                                {l.approvalLineDate ? fmtDate(l.approvalLineDate) : "-"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <nav className="d-flex justify-content-between">
              <button className="btn btn-light border shadow-sm" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1" /> 이전
              </button>
              <Link to={`/ApprovalList${loc.search || ""}`} className="btn btn-light border shadow-sm">
                목록으로
              </Link>
            </nav>
          </>
        )}

        {!loading && !err && !doc && (
          <div className="alert alert-warning" role="alert">문서를 찾을 수 없습니다.</div>
        )}
      </main>
    </div>
  );
}

export default ApprovalView;
