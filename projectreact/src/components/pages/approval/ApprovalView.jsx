// src/components/pages/approval/ApprovalView.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// ▼ 변경: 배포/개발 공통 - 기본은 ''(상대경로)로 두고,
// .env에 '/api'가 들어오면 중복 방지를 위해 ''로 정규화
const RAW_API_BASE = import.meta?.env?.VITE_API_BASE ?? "";
const API_BASE = RAW_API_BASE.endsWith("/api") ? "" : (RAW_API_BASE || "");

const DEV_EMP_ID = import.meta?.env?.VITE_DEV_EMP_ID || null;

// 프로젝트 구조에 맞춰 경로 확인
import { useAuth } from "../LoginForm/AuthContext";

/* 공통 유틸 */
const safeParse = (raw) => {
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

// ★ 변경: XSRF 토큰을 쿠키에서 읽어와서 모든 fetch에 쿠키 동봉 + 헤더 주입
const getCookie = (name) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];

async function apiFetch(input, init = {}) {
  // ★ 변경: 기본 Accept 지정 + XSRF 헤더 추가
  const headers = new Headers(init.headers || { Accept: "application/json" });
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
  }

  const res = await fetch(input, {
    ...init,
    headers,
    credentials: "include", // ★ 변경: JSESSIONID 등 쿠키 포함
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`.trim());
  }
  try { return await res.json(); } catch { return null; }
}

/* localStorage("me")에서 로그인 사용자 정보 읽기 (폴백용) */
function useCurrentUser() {
  const [me, setMe] = useState(() => safeParse(localStorage.getItem("me")));
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "me") setMe(safeParse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return me;
}

/* 여러 필드 중 숫자형 사번 뽑기 */
function extractEmpId(me) {
  const cand = [
    me?.employeeId, me?.employee_id, me?.empId, me?.emp_id,
    me?.userId, me?.user_id, me?.id,
    me?.username, me?.loginId, me?.login_id,
    me?.member?.employeeId, me?.employee?.employeeId
  ];
  for (const c of cand) {
    if (c == null) continue;
    const digits = String(c).match(/\d+/g)?.join("") ?? "";
    if (digits.length >= 3) return digits;
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

  // ✅ 로그인/역할
  const { isLoggedIn, user } = useAuth();
  const isManager = isLoggedIn && user?.role === "MANAGER";

  // 폴백용 localStorage me
  const me = useCurrentUser();

  // ✅ 사번 추출 우선순위: user → localStorage("me") → DEV_EMP_ID
  const myEmpIdFromUser = extractEmpId(user);
  const myEmpIdFromMe   = extractEmpId(me);
  const myEmpId = myEmpIdFromUser || myEmpIdFromMe || DEV_EMP_ID || null;

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
      setLoading(true);
      setErr(null);
      try {
        const headers = { Accept: "application/json" };
        if (myEmpId) headers["X-Employee-Id"] = myEmpId;
        const data = await apiFetch(
          `${API_BASE}/api/approvals/${encodeURIComponent(docId)}`,
          { headers, signal: ctrl.signal }
        );
        setDoc(data);
      } catch (e) {
        if (e?.name !== "AbortError") setErr(String(e?.message || e));
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

  // 서버 canApprove 우선(없으면 false로 간주)
  const canDecide = useMemo(() =>
    !!doc && doc.approvalStatus === "PENDING" && doc?.canApprove === true
  , [doc]);

  // 서버 canDelete 우선(없으면 작성자 & 미승인)
  const canDelete = useMemo(() => {
    if (!doc) return false;
    if (typeof doc.canDelete === "boolean") return doc.canDelete === true;
    const isOwner = myEmpId && String(doc.approvalAuthor) === String(myEmpId);
    return isOwner && doc.approvalStatus !== "APPROVED";
  }, [doc, myEmpId]);

  // 🔒 UI 노출 조건: 매니저 제한
  const canDecideUI = isManager && canDecide;
  const canDeleteUI = isManager && canDelete;

  // 🔒 작성자 여부
  const isOwner = useMemo(() =>
    !!doc && !!myEmpId && String(doc.approvalAuthor) === String(myEmpId)
  , [doc, myEmpId]);

  // ★ NEW: 수정 가능 여부(작성자 && PENDING 상태만)
  const isPending = useMemo(() =>
    String(doc?.approvalStatus || "").toUpperCase() === "PENDING"
  , [doc]); // ★ NEW

  const canEdit = isOwner && isPending; // ★ NEW

  // 승인/반려
  const decide = async (action, reason) => {
    if (!docId) return;
    if (!myEmpId) { alert("로그인 정보(사번)를 찾지 못했습니다. 다시 로그인해 주세요."); return; }
    setDeciding(true);
    try {
      await apiFetch(
        `${API_BASE}/api/approvals/${encodeURIComponent(docId)}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Employee-Id": myEmpId,
          },
          body: JSON.stringify(reason ? { opinion: reason } : {}),
        }
      );
      navigate(0);
      setRejectOpen(false);
      setRejectReason("");
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setDeciding(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!docId) return;
    if (!myEmpId) { alert("로그인 정보(사번)를 찾지 못했습니다. 다시 로그인해 주세요."); return; }
    if (!window.confirm(`정말 삭제할까요?\n\n문서번호: ${doc?.approvalDocId}\n제목: ${doc?.approvalTitle || ""}`)) {
      return;
    }
    setDeleting(true);
    try {
      await apiFetch(
        `${API_BASE}/api/approvals/${encodeURIComponent(docId)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json", "X-Employee-Id": myEmpId },
        }
      );
      alert("삭제되었습니다.");
      navigate(`/ApprovalList${loc.search || ""}`);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setDeleting(false);
    }
  };

  // ✅ 수정 버튼 클릭 시: 작성자 + PENDING 상태만 허용
  const handleEditClick = (e) => {
    e.preventDefault();
    if (!docId) return;
    if (!isOwner) {
      alert("글쓴이가 아닙니다.");
      return;
    }
    if (!isPending) {                          // ★ NEW
      alert("승인/반려된 문서는 수정할 수 없습니다."); // ★ NEW
      return;                                  // ★ NEW
    }
    navigate(`/ApprovalEdit?docId=${encodeURIComponent(docId || "")}`);
  };

  const infoDoc = statusBadgeInfo(doc?.approvalStatus);

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">상세 보기</h1>
      </div>

      <main className="container-xxl py-4 flex-grow-1">
        {!myEmpId && (
          <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
            <div>로그인 사번을 찾지 못해 권한 버튼이 숨겨질 수 있습니다. (useAuth / localStorage "me" 확인)</div>
          </div>
        )}

        {/* 상단 버튼 */}
        <div className="d-flex flex-wrap gap-2 justify-content-end mb-3">
          <Link to={`/ApprovalList${loc.search || ""}`} className="btn btn-light border shadow-sm">
            <i className="bi bi-list me-1" /> 목록
          </Link>

          {/* 🔒 버튼은 항상 보이되, 승인/반려시 비활성화 */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditClick}
            disabled={!canEdit}                                         // ★ NEW
            title={!canEdit ? "승인/반려된 문서는 수정할 수 없습니다." : undefined} // ★ NEW
          >
            <i className="bi bi-pencil-square me-1" /> 수정
          </button>

          {/* 🔒 매니저이면서 삭제 권한 있을 때만 렌더 */}
          {canDeleteUI && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDelete}
              disabled={deleting}
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
            {/* 🔒 매니저이면서 서버가 결재 가능하다고 내려준 경우에만 렌더 */}
            {canDecideUI && (
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
              <div className="card-body">
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 180 }}>
                  {doc.approvalContent || "-"}
                </div>
              </div>
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
                      {(lines?.length ?? 0) === 0 ? (
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
                              <td className="text-center">
                                {isPending ? "-" : (l.approvalId != null ? String(l.approvalId) : "-")}
                              </td>
                              <td className="text-center"><span className={li.cls}>{li.label}</span></td>
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
