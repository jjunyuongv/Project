import { useEffect, useState } from "react";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../LoginForm/AuthContext";
import "./EditPage.css";
import api from "../../../api/axios";

function EditPage(props) {
  const navigate = useNavigate();

  // 로그인 관련
  const { isLoggedIn, user } = useAuth();

  const [isEndLoading, setIsEndLoading] = useState(false);

  const [formData, setFormData] = useState({ archTitle: "", regUserId: "", archCtnt: "", udtUserId: "" });

  const [respData, setRespData] = useState([]);

  const { id } = useParams();

  const getData = async () => {
    const response = await api.get("/archive/" + id); // ✅ baseURL=/api
    setRespData(response.data);
    setFormData({ archTitle: response.data.archTitle, regUserId: response.data.regUserId, udtUserId: user.employeeId, archCtnt: response.data.archCtnt });
  }

  useEffect(function () {
    if (isLoggedIn) {
      formData.udtUserId = user.employeeId;
      getData();
    }
    setIsEndLoading(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let response = await api.post("/archive/" + id, formData); // ✅
    console.log(response.data);
    // 입력 성공
    if (response.data === 1) {
      alert("게시물이 수정되었습니다.");
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

  const handleReset = () => setFormData({ archTitle: respData.archTitle, regUserId: respData.regUserId, archCtnt: respData.archCtnt, udtUserId: user.employeeId });

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

  formData.fileList = fileList;
  let fileData = new FormData();
  for (let i = 0; i < fileUploadList.length; i++) {
    fileData.append("fileList", fileUploadList[i]);
    fileData.append("sfileList", fileList[i].sfile + fileList[i].ofile.substring(fileList[i].ofile.lastIndexOf(".")));
  }

  if (!isEndLoading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (
    <div className="form-page">
      {/* 상단 히어로 */}
      <section className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">게시글 작성</h1>
      </section>

      <form onSubmit={handleSubmit}>
        <Table className="write-table">
          {/* 4열: 라벨/필드/라벨/필드 */}
          <colgroup>
            <col className="col-label" />
            <col className="col-field" />
            <col className="col-label" />
            <col className="col-field" />
          </colgroup>

          <tbody>
            {/* 제목: 오른쪽 3칸을 합쳐서 넓게 사용 */}
            <tr>
              <td className="cell-label">제목</td>
              <td className="cell-field" colSpan={3}>
                <Form.Control
                  type="text"
                  name="archTitle"
                  value={formData.archTitle}
                  onChange={handleChange}
                />
              </td>
            </tr>

            {/* 작성자 / 수정자: 네 칸을 각각 사용 */}
            <tr>
              <td className="cell-label">작성자</td>
              <td className="cell-field">
                <Form.Control
                  type="text"
                  name="regUserId"
                  value={formData.regUserId}
                  readOnly
                />
              </td>
              <td className="cell-label">수정자</td>
              <td className="cell-field">
                <Form.Control
                  type="text"
                  name="udtUserId"
                  value={formData.udtUserId}
                  readOnly
                />
              </td>
            </tr>

            {/* 첨부파일: 오른쪽 3칸 합침 */}
            <tr>
              <td className="cell-label">첨부파일</td>
              <td className="cell-field" colSpan={3}>
                <Form.Control
                  name="files"
                  type="file"
                  onChange={fileDataHandlerAuto}
                  multiple
                />
              </td>
            </tr>

            {/* 내용: 오른쪽 3칸 합침 */}
            <tr>
              <td className="cell-label">내용</td>
              <td className="cell-field" colSpan={3}>
                <Form.Control
                  as="textarea"
                  name="archCtnt"
                  value={formData.archCtnt}
                  onChange={handleChange}
                  rows={12}
                />
              </td>
            </tr>
          </tbody>
        </Table>
        <div className="form-actions sticky">
          <Button className="btn-edit" type="submit">등록하기</Button>
          <Button className="btn-delete" variant="secondary" onClick={handleReset}>초기화</Button>
          <Button className="btn-list" variant="info" onClick={goList}>목록으로</Button>
        </div>
      </form>
    </div>
  );
};

export default EditPage;
