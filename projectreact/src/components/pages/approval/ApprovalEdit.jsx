// src/components/pages/approval/ApprovalEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../LoginForm/AuthContext.jsx";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8081";

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

function ApprovalEdit() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // 라우트 파라미터(:docId) 우선, 없으면 쿼리스트링(docId|no) 사용
  const params = useParams();
  const [searchParams] = useSearchParams();
  const docId =
    params.docId ||
    searchParams.get("docId") ||
    searchParams.get("no") ||
    "";

  // 로그인 사번 자동 주입(수정 불가)
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => {
    if (isLoggedIn && user?.employeeId) setEmployeeId(String(user.employeeId));
    else setEmployeeId("");
  }, [isLoggedIn, user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "휴가/근무 변경", // UI 표시용
    content: "",
    files: [], // 미리보기만, 전송 X
  });

  const category = useMemo(() => TYPE_MAP[form.type] || "ETC", [form.type]);

  const styles = {
    hero: {
      height: 300,
      backgroundImage: "url('/Generated.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
    },
    heroMask: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 0 },
    heroContent: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    heroTitle: { color: "#fff", fontSize: "44px", fontWeight: 800, letterSpacing: "2px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 },
  };

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
        const res = await fetch(
          `${API_BASE}/api/approvals/${encodeURIComponent(docId)}`,
          { method: "GET", headers: { Accept: "application/json" }, signal: ctrl.signal }
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`상세 조회 실패 (${res.status}) ${txt}`);
        }
        const data = await res.json();

        setForm({
          title: data.approvalTitle ?? "",
          type: TYPE_MAP_REV[data.approvalCategory] || "기타",
          content: data.approvalContent ?? "",
          files: [],
        });
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || String(e));
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
    return null;
  };

  // PUT 우선 → 405면 PATCH로 재시도
  const updateDoc = async (payload, headers) => {
    let res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(docId)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.status === 405) {
      res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(docId)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
    }
    return res;
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
      category, // TIMEOFF/SHIFT/ETC
    };

    try {
      setSaving(true);
      setErr(null);

      const headers = { "Content-Type": "application/json", Accept: "application/json" };
      if (employeeId && /^\d+$/.test(employeeId)) {
        headers["X-Employee-Id"] = String(Number(employeeId));
      }

      const res = await updateDoc(payload, headers);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`수정 실패 (${res.status}) ${txt}`);
      }

      alert("수정되었습니다.");
      navigate(`/ApprovalView/${encodeURIComponent(docId)}`);
    } catch (e2) {
      setErr(e2.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={styles.hero}>
          <div style={styles.heroMask} />
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>문서 수정</h1>
          </div>
        </section>
      </header>

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
                    <div className="form-text">로그인한 사번이 자동으로 입력됩니다.</div>
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

                  {/* 첨부: 미리보기만, 전송 X */}
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
                  </div>
                </div>
              </div>
            </div>

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
