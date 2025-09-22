import React, { useEffect, useState } from "react";
import { Container, Table, Button, Form, Spinner } from "react-bootstrap";
import "./BoardPage.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { v4 } from "uuid";
import { useAuth } from "../LoginForm/AuthContext";

function EditPage(props) {

  const navigate = useNavigate();

    // 로그인 관련
  const { isLoggedIn, user } = useAuth();

  const [isEndLoading, setIsEndLoading] = useState(false);

  const [formData, setFormData] = useState({ archTitle: "", regUserId: "", archCtnt: "", udtUserId: "" });

  const [respData, setRespData] = useState([]);

  const { id } = useParams();

  const getData = async () => {

    const response = await axios.get(props.baseUrl + "/api/archive/" + id);
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

    console.log(formData);
    let response = await axios.post(props.baseUrl + "/api/archive/" + id, formData);
    // 입력 성공
    if (response.data === 1) {
      alert("게시물이 수정되었습니다.");
      if (fileUploadList.length !== 0) {
        response = await axios.post(props.baseUrl + "/api/archivefiles", fileData);
        if (response.data === 1) {
          alert("파일 업로드 완료");
        } else {
          axios.delete(props.baseUrl + "/api/archivefiles", fileData);
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
    <Container className="write-container">
      <h2>게시글 작성</h2>
      <Form onSubmit={handleSubmit}>
        <Table className="write-table">
          <tbody>
            <tr>
              <td>제목</td>
              <td>
                <Form.Control type="text" name="archTitle" value={formData.archTitle} onChange={handleChange} />
              </td>
            </tr>
            <tr>
              <td>작성자</td>
              <td>
                <Form.Control type="text" name="regUserId" value={formData.regUserId} readOnly />
              </td>
            </tr>
            <tr>
              <td>수정자</td>
              <td>
                <Form.Control type="text" name="udtUserId" value={formData.udtUserId} readOnly />
              </td>
            </tr>
            <tr>
              <td>내용</td>
              <td>
                <Form.Control as="textarea" name="archCtnt" value={formData.archCtnt} onChange={handleChange} />
              </td>
            </tr>
            <tr>
              <td>첨부파일</td>
              {/* 파일 업로드 버튼 */}
              <td>
                <Form.Control name="files" type="file" placeholder="첨부파일 업로드" onChange={fileDataHandlerAuto} multiple></Form.Control>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="button-row">
                <Button type="submit">등록</Button>
                <Button variant="secondary" onClick={handleReset}>
                  초기화
                </Button>
                <Button variant="info" onClick={goList}>목록</Button>

              </td>
            </tr>
          </tbody>
        </Table>
      </Form>
    </Container>
  );
};

export default EditPage;