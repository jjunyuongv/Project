import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ApprovalWrite() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    type: "휴가/근무 변경",
    author: "user1",
    dept: "운영관리부",
    content: "",
    files: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFiles = (e) => {
    setForm((p) => ({ ...p, files: Array.from(e.target.files || []) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[SUBMIT]", form);
    alert("제출 요청을 보냈습니다. (콘솔 확인)");
    navigate("/ApprovalList");
  };

  const handleSaveDraft = () => {
    console.log("[DRAFT SAVE]", form);
    alert("임시저장 했습니다. (콘솔 확인)");
    navigate("/ApprovalList");
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
              <h1 style={styles.heroTitle}>문서 작성</h1>
            </div>
          </section>
        </header>

      <main className="container-xxl py-4 flex-grow-1">
        <form onSubmit={handleSubmit}>
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
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
                <div className="col-md-4">
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
                <div className="col-md-4">
                  <label className="form-label">작성자</label>
                  <input
                    type="text"
                    className="form-control"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">부서</label>
                  <input
                    type="text"
                    className="form-control"
                    name="dept"
                    value={form.dept}
                    onChange={handleChange}
                  />
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
                <div className="col-12">
                  <label className="form-label">첨부</label>
                  <input className="form-control" type="file" multiple onChange={handleFiles} />
                  {form.files?.length > 0 && (
                    <ul className="small text-muted mb-0 mt-2">
                      {form.files.map((f, i) => (
                        <li key={i}>{f.name} ({Math.round(f.size/1024)} KB)</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <Link to="/ApprovalList" className="btn btn-light border">취소</Link>
            <button type="button" className="btn btn-outline-secondary" onClick={handleSaveDraft}>임시저장</button>
            <button type="submit" className="btn btn-primary">제출</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ApprovalWrite;