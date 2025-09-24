import React, { useEffect, useState } from "react";
import { Container, Table, Button, Form, Spinner } from "react-bootstrap";
import "./WritePage.css";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../LoginForm/AuthContext";
import api from "../../../api/axios";

function WritePage(props) {
  const navigate = useNavigate();

  const [isEndLoading, setIsEndLoading] = useState(false);

  // 로그인 관련
  const { isLoggedIn, user } = useAuth();

  const [formData, setFormData] = useState({ archTitle: "", regUserId: "", archCtnt: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(function () {
    if (isLoggedIn) {
      formData.regUserId = user.employeeId;
    }
    setIsEndLoading(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.fileList = fileList;
    let fileData = new FormData();
    for (let i = 0; i < fileUploadList.length; i++) {
      fileData.append("fileList", fileUploadList[i]);
      fileData.append("sfileList", fileList[i].sfile + fileList[i].ofile.substring(fileList[i].ofile.lastIndexOf(".")));
    }

    let response = await api.post("/archive", formData); // ✅ baseURL=/api
    console.log(formData);
    // 입력 성공
    if (response.data === 1) {
      alert("게시물이 등록되었습니다.");

      if (fileUploadList.length !== 0) {
        response = await api.post("/archivefiles", fileData); // ✅
        if (response.data === 1) {
          alert("파일 업로드 완료");
        } else {
          // 원래 코드 유지 (DELETE body 전달은 서버 구현에 따라 다름)
          api.delete("/archivefiles", fileData); // ✅ 원래 형태 유지
        }
      }

      goList();
    } else {
      alert("에러 발생");
    }
  };

  function goList() {
    navigate("/BoardPage/1");
  }

  /* const handleReset = () => setFormData({ archTitle: "", regUserId: user.employeeId, archCtnt: "" }); */

  // db에 저장하기 위한 파일명을 가진 list
  const [fileList, setFileList] = useState([]);
  // 실제 input으로 받은 파일들
  const [fileUploadList, setFileUploadList] = useState([]);

  const fileDataHandlerAuto = (e) => {
    setFileUploadList(e.target.files);
    let files = [];
    for (let i = 0; i < e.target.files.length; i++) {
      files.push({
        sfile: v4() + e.target.files[i].name.substring(e.target.files[i].name.lastIndexOf(".")),
        ofile: e.target.files[i].name
      });
    }
    setFileList(files);
  }

  if (!isEndLoading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (
    <div className="boardpage">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero__title">게시물 작성</h1>
      </section>

      {/* Card */}
      <div className="form-wrap">
        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <table className="form-table">
              <tbody>
                <tr>
                  <td className="cell-label">제목</td>
                  <td className="cell-field">
                    <input
                      className="input"
                      name="archTitle"
                      value={formData.archTitle}
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td className="cell-label">작성자</td>
                  <td className="cell-field">
                    <Form.Control
                      type="text"
                      name="regUserId"
                      value={formData.regUserId}
                      readOnly
                      className="input-noborder"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="cell-label">첨부파일</td>
                  <td className="cell-field">
                    <Form.Control
                      name="files"
                      type="file"
                      onChange={fileDataHandlerAuto}
                      multiple
                      className="input-noborder"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="cell-label">내용</td>
                  <td className="cell-field">
                    <textarea
                      className="textarea"
                      name="archCtnt"
                      value={formData.archCtnt}
                      onChange={handleChange}
                      rows={14}
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="actions actions-out">
            <Button type="submit" className="btn btn-primary">
              등록하기
            </Button>
            <Button type="button" className="btn btn-ghost" onClick={goList}>
              목록으로
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WritePage;
