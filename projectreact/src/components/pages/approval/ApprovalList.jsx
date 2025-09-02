import React from "react";
import { Link } from "react-router-dom";
import "./board.css";

function ApprovalList() {
  const rows = [
    { no: 5, title: "1234",       type: "휴가/근무 변경", author: "user1", date: "2025-07-21T15:04:25.042", status: "APPROVED" },
    { no: 4, title: "123123",     type: "긴급 운항 변경", author: "user1", date: "2025-07-20T17:27:58.474", status: "APPROVED" },
    { no: 3, title: "123123123",  type: "휴가/근무 변경", author: "user1", date: "2025-07-20T16:51:01.196", status: "PENDING"   },
    { no: 2, title: "123123",     type: "정비 승인",     author: "user1", date: "2025-07-20T16:50:08.963", status: "REJECTED"  },
    { no: 1, title: "123",        type: "휴가/근무 변경", author: "123",   date: "2025-07-20T16:35:16.508", status: "DRAFT"     },
  ];

  const fmtDate = (s) => (s?.includes("T") ? s.split("T")[0] : s);

  const statusInfo = (s) => {
    switch (s) {
      case "APPROVED": return { label: "승인",     cls: "bg-success" };
      case "REJECTED": return { label: "반려",     cls: "bg-danger"  };
      case "PENDING":  return { label: "대기",     cls: "bg-warning text-dark" };
      case "DRAFT":    return { label: "임시저장", cls: "bg-secondary" };
      default:         return { label: s,          cls: "bg-secondary" };
    }
  };
  const styles = {
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
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <select defaultValue="" className="form-select w-auto">
            <option value="">번호</option>
            <option value="">제목</option>
            <option value="">유형</option>
            <option value="">작성자</option>
            <option value="">작성일</option>
          </select>
          <div className="input-group" style={{ maxWidth: 420 }}>
            <input type="text" className="form-control" placeholder="검색어를 입력하세요" />
            <button type="button" className="btn btn-outline-secondary">
              <i className="bi bi-search" aria-hidden="true"></i>
              <span className="visually-hidden">검색</span>
            </button>
          </div>

          <Link to="/ApprovalWrite" className="btn btn-primary ms-auto">
            <i className="bi bi-pencil-square me-1" aria-hidden="true"></i> 글쓰기
          </Link>
        </div>

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
                <th className="text-center" style={{ width: 160 }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const info = statusInfo(r.status);
                return (
                  <tr key={r.no}>
                    <td className="text-center">{r.no}</td>
                    <td className="text-truncate" style={{ maxWidth: 600 }}>
                      <Link
                        to={`/ApprovalView/${r.no}`}
                        className="board-title text-decoration-underline fw-semibold"
                        title={r.title}
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="text-center">{r.type}</td>
                    <td className="text-center">{r.author}</td>
                    <td className="text-center">{fmtDate(r.date)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${info.cls}`}>{info.label}</span>
                    </td>
                    <td className="text-center">
                      
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <nav className="mt-3" aria-label="페이지네이션">
          <ul className="pagination justify-content-center mb-0">
            <li className="page-item disabled"><span className="page-link">&laquo;</span></li>
            <li className="page-item active"><span className="page-link">1</span></li>
            <li className="page-item disabled"><span className="page-link">&raquo;</span></li>
          </ul>
        </nav>
      </main>
    </div>
  );
}

export default ApprovalList;
