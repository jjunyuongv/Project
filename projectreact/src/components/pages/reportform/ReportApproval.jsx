// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

function ReportApproval() {
  const [rows, setRows] = useState([
    { no: 1, title: "항공기 이상 보고서", author: "user1", date: "2025-07-20", status: "PENDING" },
    { no: 2, title: "운항 상황 보고", author: "user2", date: "2025-07-21", status: "PENDING" },
  ]);

  const statusInfo = (s) => {
    switch(s){
      case "APPROVED": return { label:"승인", cls:"bg-success" };
      case "REJECTED": return { label:"반려", cls:"bg-danger" };
      case "PENDING": return { label:"대기", cls:"bg-warning text-dark" };
      default: return { label: s, cls:"bg-secondary" };
    }
  };

  const handleApprove = (no) => setRows(rows.map(r => r.no === no ? {...r, status: "APPROVED"} : r));
  const handleReject  = (no) => setRows(rows.map(r => r.no === no ? {...r, status: "REJECTED"} : r));

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
      background: "rgba(0,0,0,.35)",
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
      fontWeight: 800,
      textShadow: "0 2px 12px rgba(0,0,0,.35)",
    },
  };
  
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header>
        <section style={styles.hero}>
          <div style={styles.heroMask} />
          <div style={styles.heroContent}>
            <h1 className="display-5 mb-0" style={styles.heroTitle}>업무 보고 결재</h1>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1">
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <select defaultValue="" className="form-select w-auto">
            <option value="">번호</option>
            <option value="">제목</option>
            <option value="">작성자</option>
            <option value="">작성일</option>
          </select>

          <div className="input-group" style={{ maxWidth: 420 }}>
            <input type="text" className="form-control" placeholder="검색어를 입력하세요" />
            <button type="button" className="btn btn-outline-secondary">
              <i className="bi bi-search"></i>
              <span className="visually-hidden">검색</span>
            </button>
          </div>
        </div>

        <div className="table-responsive shadow-sm rounded-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{width:90}}>번호</th>
                <th>제목</th>
                <th className="text-center" style={{width:140}}>작성자</th>
                <th className="text-center" style={{width:140}}>작성일</th>
                <th className="text-center" style={{width:120}}>상태</th>
                <th className="text-center" style={{width:180}}>결재</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const info = statusInfo(r.status);
                return (
                  <tr key={r.no}>
                    <td className="text-center">{r.no}</td>
                    <td>{r.title}</td>
                    <td className="text-center">{r.author}</td>
                    <td className="text-center">{r.date}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${info.cls}`}>{info.label}</span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-success me-1" disabled={r.status!=="PENDING"} onClick={()=>handleApprove(r.no)}>승인</button>
                      <button className="btn btn-sm btn-danger" disabled={r.status!=="PENDING"} onClick={()=>handleReject(r.no)}>반려</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default ReportApproval;
