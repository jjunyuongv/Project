import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./navbar.css";

const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

export default function Navbar() {
  return (
    <header className="nav-root">
      <div className="nav-container">
        <Link to="/" className="nav-brand" aria-label="홈으로">
          <span className="nav-emoji" role="img" aria-label="plane">✈️</span>
        </Link>

        <nav className="nav-links" aria-label="주요 메뉴">
          <NavLink to="/ApprovalList"  className={linkClass}>결재</NavLink>
          <NavLink to="/BoardPage"    className={linkClass}>문서보관</NavLink>
          <NavLink to="/ReportList"    className={linkClass}>업무보고</NavLink>
          <NavLink to="/ChatMain"  className={linkClass}>메신저</NavLink>
          <NavLink to="/Calendars"  className={linkClass}>일정</NavLink>
        </nav>

        <Link to="/Login" className="nav-login" aria-label="로그인">로그인</Link>
      </div>
    </header>
  );
}
