// src/components/pages/approval/ApprovalEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../LoginForm/AuthContext.jsx";

/* ▼ 변경: 배포/개발 공통 - 기본은 ''(상대경로)로 두고,
   .env에 '/api'가 들어오면 중복 방지를 위해 ''로 정규화 */
const RAW_API_BASE = import.meta?.env?.VITE_API_BASE ?? "";
const API_BASE = RAW_API_BASE.endsWith("/api") ? "" : (RAW_API_BASE || "");

// 한글 UI ↔ 백엔드 ENUM 매핑
const TYPE_MAP = {
  "휴가/근무 변경": "TIMEOFF",
  "정비 승인": "ETC",
  "긴급 운항 변경": "ETC",
  "기타": "ETC",
};
const TYPE_MAP_REV = {
  TIMEOFF: "휴가/근무 변경",
  SHIFT: "근무 교대",
  ETC: "기타",
};

/* === 공통 fetch 유틸 === */
class HttpError extends Error {
  constructor(status, statusText) {
    super(`${status} ${statusText}`.trim());
    this.name = "HttpError";
    this.status = status;
  }
}

// ★ 변경: XSRF 토큰을 쿠키에서 읽고, 모든 fetch에 쿠키 동봉
const getCookie = (name) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];

async function fetchOk(url, init = {}) {
  // ★ 변경: 기본 Accept, XSRF 헤더 주입
  const headers = new Headers(init.headers || { Accept: "application/json" });
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include", // ★ 변경: JSESSIONID 등 쿠키 동봉
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

function ApprovalEdit() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // :docId 우선, 없으면 ?docId | ?no
  const params = useParams();
  const [searchParams] = useSearchParams();
  const docId =
    params.docId || searchParams.get("docId") || searchParams.get("no") || "";

  // 로그인 사번 표시(수정 불가)
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => {
    if (isLoggedIn && user?.employeeId) setEmployeeId(String(user.employeeId));
    else setEmployeeId("");
  }, [isLoggedIn, user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // 쓰기 화면과 동일한 상태 구조로 확장
  const [form, setForm] = useState({
    title: "",
    type: "휴가/근무 변경", // UI 표시용
    content: "",
    files: [], // (새로 추가할 파일만 담음)
    // TIMEOFF
    timeoffType: "ANNUAL",
    timeoffStart: "",
    timeoffEnd: "",
    timeoffReason: "",
  });

  const [existingFileName, setExistingFileName] = useState("");
  const category = useMemo(() => TYPE_MAP[form.type] || "ETC", [form.type]);
  const isTimeoff = category === "TIMEOFF";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleFiles = (e) =>
    setForm((p) => ({ ...p, files: Array.from(e.target.files || []) }));

  // 상세 로드
  useEffect(() => {
    if (!docId) {
      setErr("문서 ID가 없습니다.");
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchJson(
          `${API_BASE}/api/approvals/${encodeURIComponent(docId)}`,
          { method: "GET", headers: { Accept: "application/json" }, signal: ctrl.signal }
        );

        const uiType = TYPE_MAP_REV[data?.approvalCategory] || "기타";

        // TIMEOFF 데이터 방어적 파싱
        const to = data?.timeoff || {};
        const timeoffType =
          to.timeoffType || to.type || data?.timeoffType || "ANNUAL";
        const timeoffStart = to.start || data?.timeoffStart || "";
        const timeoffEnd = to.end || data?.timeoffEnd || "";
        const timeoffReason = to.reason || data?.timeoffReason || "";

        setForm({
          title: data?.approvalTitle ?? "",
          type: uiType,
          content: data?.approvalContent ?? "",
          files: [],
          timeoffType,
          timeoffStart,
          timeoffEnd,
          timeoffReason,
        });

        setExistingFileName(data?.ofile || "");
      } catch (e) {
        if (e?.name !== "AbortError") setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [docId]);

  const validate = () => {
    if (!form.title.trim()) return "제목을 입력하세요.";
    if (!form.content.trim()) return "내용을 입력하세요.";
    if (!docId) return "문서 ID가 없습니다.";
    if (isTimeoff) {
      if (!form.timeoffStart || !form.timeoffEnd)
        return "휴가 시작/종료일을 입력하세요.";
      if (form.timeoffEnd < form.timeoffStart)
        return "휴가 종료일이 시작일보다 빠를 수 없습니다.";
    }
    return null;
  };

  // PUT 우선 → 405면 PATCH 재시도 (기존 로직 유지)
  const updateDoc = async (payload, headers) => {
    const url = `${API_BASE}/api/approvals/${encodeURIComponent(docId)}`;
    try {
      return await fetchOk(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      if (e instanceof HttpError && e.status === 405) {
        return await fetchOk(url, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });
      }
      throw e;
    }
  };

  /* =========================
     파일 교체 업로드
     - 백엔드: POST /api/approvals/{docId}/file (키: "file")
     - 한 문서당 단일 파일 구조 → 첫 번째 선택 파일만 사용
     ========================= */
  const uploadNewFileIfAny = async () => {
    if (!form.files?.length) return;
    const fd = new FormData();
    fd.append("file", form.files[0]);

    const headers = { Accept: "application/json" }; // Content-Type 자동처리(FormData)
    if (employeeId && /^\d+$/.test(employeeId)) {
      headers["X-Employee-Id"] = String(Number(employeeId));
    }
    const url = `${API_BASE}/api/approvals/${encodeURIComponent(docId)}/file`;
    await fetchOk(url, { method: "POST", headers, body: fd });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: form.content,
      category, // TIMEOFF/ETC
      timeoff: isTimeoff
        ? {
            timeoffType: form.timeoffType,
            start: form.timeoffStart,
            end: form.timeoffEnd,
            reason: form.timeoffReason || "",
          }
        : null,
    };

    try {
      setSaving(true);
      setErr(null);

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (employeeId && /^\d+$/.test(employeeId)) {
        headers["X-Employee-Id"] = String(Number(employeeId));
      }

      // 1) 문서 본문 업데이트 (JSON)
      await updateDoc(payload, headers);

      // 2) 새 파일 있으면 교체 업로드 (multipart)
      await uploadNewFileIfAny();

      alert("수정되었습니다.");
      navigate(`/ApprovalView/${encodeURIComponent(docId)}`);
    } catch (e2) {
      setErr(e2?.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">문서 수정</h1>
      </div>

      <main className="container-xxl py-4 flex-grow-1">
        {err && (
          <div className="alert alert-danger" role="alert">
            {err}
          </div>
        )}

        {loading ? (
          <div className="card shadow-sm mb-3">
            <div className="card-body d-flex align-items-center gap-2">
              <div className="spinner-border" role="status" aria-hidden="true" />
              <span>불러오는 중...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="row g-3">
                  {/* 로그인 사번 표시(읽기전용) */}
                  <div className="col-md-3">
                    <label className="form-label">사번</label>
                    <input
                      type="text"
                      className="form-control"
                      value={employeeId}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">제목</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">문서 유형</label>
                    <select
                      className="form-select"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option>휴가/근무 변경</option>
                      <option>정비 승인</option>
                      <option>긴급 운항 변경</option>
                      <option>기타</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">내용</label>
                    <textarea
                      className="form-control"
                      name="content"
                      rows={8}
                      value={form.content}
                      onChange={handleChange}
                    />
                  </div>

                  {/* 기존 첨부 표시 + 다운로드 링크 */}
                  <div className="col-12">
                    <label className="form-label">기존 첨부</label>
                    {existingFileName ? (
                      <div className="small">
                        <a
                          href={`${API_BASE}/api/approvals/${encodeURIComponent(
                            docId
                          )}/file`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {existingFileName}
                        </a>
                      </div>
                    ) : (
                      <div className="form-text">기존 첨부가 없습니다.</div>
                    )}
                  </div>

                  {/* 새 파일 선택 → 저장 시 교체 업로드 */}
                  <div className="col-12">
                    <label className="form-label">새로 업로드할 첨부</label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={handleFiles}
                    />
                    {form.files?.length > 0 && (
                      <ul className="small text-muted mb-0 mt-2">
                        <li>
                          {form.files[0].name} (
                          {Math.round(form.files[0].size / 1024)} KB)
                        </li>
                      </ul>
                    )}
                    <div className="form-text">
                      새 파일을 선택하고 <strong>저장</strong>하면 기존 파일이
                      교체됩니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TIMEOFF 상세 */}
            {isTimeoff && (
              <div className="card shadow-sm mb-3">
                <div className="card-header bg-white">
                  <strong>휴가 / 근무 변경 상세</strong>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">유형</label>
                      <select
                        className="form-select"
                        name="timeoffType"
                        value={form.timeoffType}
                        onChange={handleChange}
                      >
                        <option value="ANNUAL">연차</option>
                        <option value="HALF">반차</option>
                        <option value="SICK">병가</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">시작일</label>
                      <input
                        type="date"
                        className="form-control"
                        name="timeoffStart"
                        value={form.timeoffStart}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">종료일</label>
                      <input
                        type="date"
                        className="form-control"
                        name="timeoffEnd"
                        value={form.timeoffEnd}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">사유</label>
                      <textarea
                        className="form-control"
                        name="timeoffReason"
                        rows={3}
                        value={form.timeoffReason}
                        onChange={handleChange}
                        placeholder="사유를 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 justify-content-end">
              <Link
                to={`/ApprovalView/${encodeURIComponent(docId || "")}`}
                className="btn btn-light border"
              >
                취소
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default ApprovalEdit;
