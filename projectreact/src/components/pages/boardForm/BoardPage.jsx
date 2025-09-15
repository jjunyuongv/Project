import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BoardPage.css";

const SAMPLE_ROWS = [
  { no: 14, title: "공항 접근 차트 및 항로 정보 (Jeppesen Charts)", file: true,  writerId: "admin",    dept: "운영관리부", date: "2025-07-21" },
  { no: 13, title: "2025 승무원 교육자료",                          file: false, writerId: "admin",    dept: "운영관리부", date: "2025-07-21" },
  { no: 12, title: "공항 접근 차트 및 항로 정보 (Jeppesen Charts)", file: false, writerId: "admin",    dept: "운영관리부", date: "2025-07-20" },
  { no: 11, title: "공항 접근 차트 및 항로 정보 (Jeppesen Charts)", file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
  { no: 10, title: "국가별 항공 규제 관련 문서 (NOTAM, AIP 등)",     file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
  { no: 9,  title: "항공법 및 항공청 규정 (국토교통부, FAA, ICAO 등)", file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
  { no: 8,  title: "시뮬레이터 훈련 매뉴얼 (Simulator Training Program)", file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
  { no: 7,  title: "MEL/CDL 목록 (Minimum Equipment List / Configuration Deviation List)", file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
  { no: 6,  title: "장비 목록 및 관리대장 (Equipment List & Component Manual)", file: false, writerId: "dhdldzzz", dept: "운영관리부", date: "2025-07-16" },
];

const PAGE_SIZE = 8;

export default function BoardPage() {
  const [category, setCategory] = useState("전체");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const byKeyword = SAMPLE_ROWS.filter(r =>
      r.title.toLowerCase().includes(keyword) ||
      r.writerId.toLowerCase().includes(keyword) ||
      r.dept.toLowerCase().includes(keyword)
    );
    return byKeyword;
  }, [q, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">운항매뉴얼</h1>
      </div>

      <form className="toolbar" onSubmit={handleSearch}>
        <select
          className="toolbar__select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>전체</option>
          <option>매뉴얼</option>
          <option>규정/법규</option>
          <option>교육</option>
        </select>

        <div className="toolbar__search">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="검색">검색</button>
        </div>

        <Link to="/submit-report" className="toolbar__write">글쓰기</Link>
      </form>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{width: 80}}>번호</th>
              <th>제목</th>
              <th style={{width: 90}}>첨부파일</th>
              <th style={{width: 120}}>작성자ID</th>
              <th style={{width: 120}}>소속부서</th>
              <th style={{width: 120}}>등록일</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">검색 결과가 없습니다.</td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.no}>
                  <td>{r.no}</td>
                  <td className="title-cell">
                    <Link className="linklike" to={`/archive/${r.no}`}>
                      {r.title}
                    </Link>
                  </td>
                  <td>{r.file ? "⬇" : "-"}</td>
                  <td>{r.writerId}</td>
                  <td>{r.dept}</td>
                  <td>{r.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="pagination">
        <li>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <li key={n}>
            <button
              className={n === page ? "is-active" : ""}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          </li>
        ))}
        <li>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            다음
          </button>
        </li>
      </ul>
    </div>
  );
}
