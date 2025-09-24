// src/components/pages/approval/ApprovalWrite.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../LoginForm/AuthContext.jsx";

/* ▼ 변경: 배포/개발 공통 - 기본은 ''(상대경로)로 두고,
   .env에 '/api'가 들어오면 중복 방지를 위해 ''로 정규화 */
const RAW_API_BASE = import.meta?.env?.VITE_API_BASE ?? "";
const API_BASE = RAW_API_BASE.endsWith("/api") ? "" : (RAW_API_BASE || "");

const DEFAULT_APPROVER_ID = Number(import.meta?.env?.VITE_DEFAULT_APPROVER_ID ?? "9001");

const TYPE_MAP = {
  "휴가/근무 변경": "TIMEOFF",
  "정비 승인": "ETC",
  "긴급 운항 변경": "ETC",
  "기타": "ETC",
};

/* === 공통 fetch 유틸(간결 유지) === */
class HttpError extends Error {
  constructor(status, statusText) {
    super(`${status} ${statusText}`.trim());
    this.name = "HttpError";
    this.status = status;
  }
}

// ★ 변경: XSRF 토큰을 쿠키에서 읽고, 모든 fetch에 쿠키 동봉 + 헤더 자동 추가
const getCookie = (name) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];

async function fetchOk(url, init = {}) {
  // ★ 변경: 기본 Accept 유지 + XSRF 헤더 주입(이미 있으면 건드리지 않음)
  const headers = new Headers(init.headers || { Accept: "application/json" });
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include", // ★ 변경: JSESSIONID 등 세션 쿠키 동봉
  });

  if (!res.ok) throw new HttpError(res.status, res.statusText);
  return res;
}

// 응답에서 문서 ID 추출(서버 구현 케이스 커버)
async function extractDocIdFromResponse(res) {
  let docId = null, data = null;
  try {
    const cloned = res.clone();
    try {
      data = await res.json();
      docId = data?.approvalDocId ?? data?.docId ?? data?.id ?? null;
    } catch {
      const txt = (await cloned.text())?.trim();
      if (txt) docId = txt;
    }
  } catch {
    /* noop */
  }
  if (!docId) {
    const loc = res.headers.get("Location");
    if (loc) docId = decodeURIComponent(loc.split("/").pop());
  }
  return { docId, data };
}

function ApprovalWrite() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // 사번: 로그인 정보로 자동 세팅(+수정 불가)
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => {
    if (isLoggedIn && user?.employeeId) setEmployeeId(String(user.employeeId));
    else setEmployeeId("");
  }, [isLoggedIn, user]);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "휴가/근무 변경",
    content: "",
    files: [], // ★ 참고: 여러 개 선택해도 업로드는 첫 번째 파일만 사용
    // TIMEOFF
    timeoffType: "ANNUAL",
    timeoffStart: "",
    timeoffEnd: "",
    timeoffReason: "",
  });

  const category = useMemo(() => TYPE_MAP[form.type] || "ETC", [form.type]);
  const isTimeoff = category === "TIMEOFF";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleFiles = (e) =>
    setForm((p) => ({ ...p, files: Array.from(e.target.files || []) }));

  const validate = () => {
    if (!form.title.trim()) return "제목을 입력하세요.";
    if (!form.content.trim()) return "내용을 입력하세요.";
    if (isTimeoff) {
      if (!form.timeoffStart || !form.timeoffEnd) return "휴가 시작/종료일을 입력하세요.";
      if (form.timeoffEnd < form.timeoffStart) return "휴가 종료일이 시작일보다 빠를 수 없습니다.";
    }
    if (!Number.isInteger(DEFAULT_APPROVER_ID) || DEFAULT_APPROVER_ID <= 0) {
      return "관리자 사번이 유효하지 않습니다. (.env의 VITE_DEFAULT_APPROVER_ID 확인)";
    }
    if (!employeeId) {
      return "로그인 후 이용해 주세요.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    const v = validate();
    if (v) { setErr(v); return; }

    const payload = {
      title: form.title.trim(),
      content: form.content,
      category, // TIMEOFF/ETC
      lines: [{ approvalId: DEFAULT_APPROVER_ID, approvalSequence: 1 }],
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
      setSubmitting(true);

      // 공통 헤더
      const baseHeaders = { Accept: "application/json" };
      if (employeeId && /^\d+$/.test(employeeId)) {
        baseHeaders["X-Employee-Id"] = String(Number(employeeId));
      }

      let res;
      if (form.files?.length > 0) {
        // ★ FormData 업로드: Content-Type은 브라우저가 자동 설정하므로 지정하지 않음
        const fd = new FormData();
        fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        fd.append("file", form.files[0]); // ★ 첫 번째 파일만 업로드
        res = await fetchOk(`${API_BASE}/api/approvals`, {
          method: "POST",
          headers: baseHeaders,
          body: fd,
        });
      } else {
        res = await fetchOk(`${API_BASE}/api/approvals`, {
          method: "POST",
          headers: { ...baseHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const { docId } = await extractDocIdFromResponse(res);
      if (docId) {
        alert("제출되었습니다.");
        navigate(`/ApprovalView/${encodeURIComponent(docId)}`);
      } else {
        alert("제출은 성공했지만 문서 ID를 받지 못했습니다. 목록으로 이동합니다.");
        navigate("/ApprovalList");
      }
    } catch (e2) {
      setErr(e2?.message || String(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">문서 작성</h1>
      </div>

      <main className="container-xxl py-4 flex-grow-1">
        <form onSubmit={handleSubmit}>
          {err && <div className="alert alert-danger" role="alert">{err}</div>}

          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="row g-3">
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
                    placeholder="제목을 입력하세요"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">문서 유형</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleChange}>
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
                    placeholder="내용을 입력하세요"
                  />
                </div>

                {/* 첨부 미리보기 (여러 개 선택 가능하지만 업로드는 첫 파일만) */}
                <div className="col-12">
                  <label className="form-label">첨부</label>
                  <input className="form-control" type="file" multiple onChange={handleFiles} />
                  {form.files?.length > 0 && (
                    <ul className="small text-muted mb-0 mt-2">
                      {form.files.map((f, i) => (
                        <li key={i}>
                          {f.name} ({Math.round(f.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  )}
                  {form.files?.length > 1 && (
                    <div className="form-text">여러 파일을 선택해도 <strong>첫 번째 파일</strong>만 업로드됩니다.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TIMEOFF 상세 */}
          {isTimeoff && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-white"><strong>휴가 / 근무 변경 상세</strong></div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">유형</label>
                    <select className="form-select" name="timeoffType" value={form.timeoffType} onChange={handleChange}>
                      <option value="ANNUAL">연차</option>
                      <option value="HALF">반차</option>
                      <option value="SICK">병가</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">시작일</label>
                    <input type="date" className="form-control" name="timeoffStart" value={form.timeoffStart} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">종료일</label>
                    <input type="date" className="form-control" name="timeoffEnd" value={form.timeoffEnd} onChange={handleChange} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">사유</label>
                    <textarea className="form-control" name="timeoffReason" rows={3} value={form.timeoffReason} onChange={handleChange} placeholder="사유를 입력하세요" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <Link to="/ApprovalList" className="btn btn-light border">취소</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  제출 중...
                </>
              ) : ("제출")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ApprovalWrite;
