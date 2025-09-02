import React from "react";
import { Link } from "react-router-dom";

function Login() {
  const styles = {
    hero: {
      height: 300,
      backgroundImage: "url(/Generated.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    heroMask: {
      background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.35))",
    },
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">

      <header>
        
        <section className="position-relative" style={styles.hero}>
          <div className="position-absolute top-0 start-0 w-100 h-100" style={styles.heroMask} />
          <div className="container-xxl position-relative" style={{ zIndex: 1 }}>
            <div className="py-5">
              <h1 className="display-5 fw-bold text-white mb-0">로그인</h1>
            </div>
          </div>
        </section>
      </header>

      <main className="container-xxl py-4 flex-grow-1 d-flex justify-content-center align-items-start">
        <div className="card p-4 shadow-sm mt-4" style={{ width: 400 }}>
          <h3 className="mb-4 text-center">로그인</h3>
          <form>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">아이디</label>
              <input type="text" className="form-control" id="username" placeholder="아이디 입력" />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">비밀번호</label>
              <input type="password" className="form-control" id="password" placeholder="비밀번호 입력" />
            </div>
            <button type="submit" className="btn btn-primary w-100">로그인</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;