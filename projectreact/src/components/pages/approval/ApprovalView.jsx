import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

function ApprovalView() {
  const { num } = useParams();

  const rows = [
    {
      no: 5,
      title: "1234",
      type: "휴가/근무 변경",
      author: "user1",
      dept: "운영관리부",
      date: "2025-07-21T15:04:25.042",
      status: "APPROVED",
      content: `연차 사용 사유: 개인 일정\n기간: 2025-07-24 ~ 2025-07-26`,
      attachments: [{ name: "연차신청서.pdf", size: "214KB" }],
      line: [
        { seq: 1, approver: "leader1", role: "팀장", status: "APPROVED", date: "2025-07-21T09:10:00", opinion: "확인" },
        { seq: 2, approver: "mgr1", role: "부서장", status: "APPROVED", date: "2025-07-21T12:35:00", opinion: "-" },
      ],
    },
    {
      no: 4,
      title: "123123",
      type: "긴급 운항 변경",
      author: "user1",
      dept: "운영관리부",
      date: "2025-07-20T17:27:58.474",
      status: "APPROVED",
      content: `기상 악화로 인한 임시 운항 변경안입니다.`,
      attachments: [],
      line: [
        { seq: 1, approver: "ops1", role: "운항관리", status: "APPROVED", date: "2025-07-20T17:00:00", opinion: "조치" },
      ],
    },
    {
      no: 3,
      title: "123123123",
      type: "휴가/근무 변경",
      author: "user1",
      dept: "운영관리부",
      date: "2025-07-20T16:51:01.196",
      status: "PENDING",
      content: `근무 교대 변경 요청`,
      attachments: [{ name: "교대표.xlsx", size: "35KB" }],
      line: [
        { seq: 1, approver: "leader1", role: "팀장", status: "PENDING", date: "", opinion: "" },
      ],
    },
    {
      no: 2,
      title: "123123",
      type: "정비 승인",
      author: "user1",
      dept: "정비팀",
      date: "2025-07-20T16:50:08.963",
      status: "REJECTED",
      content: `부품 수급 지연으로 일정 재조정 필요`,
      attachments: [{ name: "정비내역.docx", size: "88KB" }],
      line: [
        { seq: 1, approver: "qa1", role: "품질", status: "APPROVED", date: "2025-07-20T16:30:00", opinion: "OK" },
        { seq: 2, approver: "mgr2", role: "정비장", status: "REJECTED", date: "2025-07-20T16:45:00", opinion: "추가 검토" },
      ],
    },
    {
      no: 1,
      title: "123",
      type: "휴가/근무 변경",
      author: "123",
      dept: "운영관리부",
      date: "2025-07-20T16:35:16.508",
      status: "DRAFT",
      content: `임시 저장된 문서입니다.`,
      attachments: [],
      line: [],
    },
  ];

  const fmtDate = (s, withTime = true) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return withTime ? s.replace("T", " ") : (s.includes("T") ? s.split("T")[0] : s);
    const pad = (n) => String(n).padStart(2, "0");
    const Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
    if (!withTime) return `${Y}-${M}-${D}`;
    const h = pad(d.getHours()), m = pad(d.getMinutes());
    return `${Y}-${M}-${D} ${h}:${m}`;
  };

  const statusInfo = (s) => {
    switch (s) {
      case "APPROVED": return { label: "승인",     cls: "bg-success" };
      case "REJECTED": return { label: "반려",     cls: "bg-danger"  };
      case "PENDING":  return { label: "대기",     cls: "bg-warning text-dark" };
      case "DRAFT":    return { label: "임시저장", cls: "bg-secondary" };
      default:         return { label: s,          cls: "bg-secondary" };
    }
  };

  const doc = useMemo(() => {
    const n = Number(num);
    return rows.find((r) => r.no === n) || rows[0];
  }, [num]);

  const sortedNos = rows.map(r => r.no).sort((a,b)=>b-a);
  const idx = sortedNos.indexOf(doc.no);
  const prevNo = idx > 0 ? sortedNos[idx - 1] : null;
  const nextNo = idx < sortedNos.length - 1 ? sortedNos[idx + 1] : null;

  const styles = {  
    pre: { whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 180 },

    hero: {
      height: 300,
      backgroundImage: "url('/Generated.png')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
    },
    heroMask: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.4)", 
      zIndex: 0,
    },
    heroContent: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    heroTitle: {
      color: "#fff",
      fontSize: "44px",
      fontWeight: 800,
      letterSpacing: "2px",
      textShadow: "0 2px 12px rgba(0,0,0,0.35)",
      margin: 0,
    },

  };

  const info = statusInfo(doc.status);

  

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={styles.hero}>
          <div style={styles.heroMask} />
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>상세 보기</h1>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1">
        <div className="d-flex flex-wrap gap-2 justify-content-end mb-3">
          <Link to="/ApprovalList" className="btn btn-light border shadow-sm">
            <i className="bi bi-list me-1" /> 목록
          </Link>
          <Link to={`/ApprovalEdit?no=${doc.no}`} className="btn btn-primary">
            <i className="bi bi-pencil-square me-1" /> 수정
          </Link>
          <button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>
            <i className="bi bi-printer me-1" /> 인쇄
          </button>
        </div>

        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h3 className="h5 fw-bold mb-3">{doc.title}</h3>
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <th className="bg-light" style={{ width: 160 }}>문서번호</th>
                    <td>{doc.no}</td>
                    <th className="bg-light" style={{ width: 160 }}>상태</th>
                    <td>
                      <span className={`badge rounded-pill ${info.cls}`}>{info.label}</span>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-light">문서 유형</th>
                    <td>{doc.type}</td>
                    <th className="bg-light">작성자 / 부서</th>
                    <td>{doc.author} / {doc.dept}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">작성일</th>
                    <td>{fmtDate(doc.date)}</td>
                    <th className="bg-light">첨부</th>
                    <td>
                      {doc.attachments.length === 0 ? (
                        <span className="text-muted">없음</span>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {doc.attachments.map((f, i) => (
                            <li key={i} className="d-flex align-items-center gap-2">
                              <i className="bi bi-paperclip" aria-hidden="true" />
                              <a href="#!" className="link-secondary text-decoration-none">{f.name}</a>
                              <small className="text-muted">({f.size})</small>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white">
            <strong>내용</strong>
          </div>
          <div className="card-body">
            <div style={styles.pre}>{doc.content}</div>
          </div>
        </div>

        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white">
            <strong>결재 이력</strong>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: 80 }}>순번</th>
                    <th style={{ width: 180 }}>결재자(역할)</th>
                    <th className="text-center" style={{ width: 120 }}>상태</th>
                    <th className="text-center" style={{ width: 180 }}>일시</th>
                    <th>의견</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.line.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">결재 이력이 없습니다.</td></tr>
                  ) : doc.line.map((l) => {
                    const li = statusInfo(l.status);
                    return (
                      <tr key={l.seq}>
                        <td className="text-center">{l.seq}</td>
                        <td>{l.approver} <span className="text-muted">({l.role})</span></td>
                        <td className="text-center"><span className={`badge rounded-pill ${li.cls}`}>{li.label}</span></td>
                        <td className="text-center">{l.date ? fmtDate(l.date) : "-"}</td>
                        <td>{l.opinion || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <nav className="d-flex justify-content-between">
          <div>
            {prevNo ? (
              <Link to={`/ApprovalView/${prevNo}`} className="btn btn-light border shadow-sm">
                <i className="bi bi-arrow-left me-1" /> 이전 문서
              </Link>
            ) : (
              <button className="btn btn-light border shadow-sm" disabled>
                <i className="bi bi-arrow-left me-1" /> 이전 문서
              </button>
            )}
          </div>
          <div>
            {nextNo ? (
              <Link to={`/ApprovalView/${nextNo}`} className="btn btn-light border shadow-sm">
                다음 문서 <i className="bi bi-arrow-right ms-1" />
              </Link>
            ) : (
              <button className="btn btn-light border shadow-sm" disabled>
                다음 문서 <i className="bi bi-arrow-right ms-1" />
              </button>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
}

export default ApprovalView;
