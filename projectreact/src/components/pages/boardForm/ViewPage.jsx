import React, { useEffect, useState } from "react";
import { Container, Table, Button } from "react-bootstrap";
import "./BoardPage.css";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewPage.css";
import { FileDown } from "lucide-react";
import api from "../../../api/axios";

function ViewPage(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState([]);

  const { id } = useParams();

  const getData = async () => {
    const response = await api.get("/archive/" + id); // ✅ baseURL=/api
    setRespData(response.data);
  }

  useEffect(function () {
    getData();
  }, []);

  function goList() {
    navigate("/BoardPage/1");
  }
  function goEdit() {
    navigate("/EditPage/" + id);
  }
  const confirmDelete = async () => {
    if (confirm("정말 게시글을 삭제하시겠습니까?")) {
      let response = await api.delete("/archive/" + id); // ✅
      if (response.data === 1) {
        alert("삭제 성공");
        goList();
      } else {
        alert("에러 발생");
      }
    }
  }

  const download = async (archId) => {
    const response = await api.get("/archivefiles/" + archId); // ✅
    let ofile = response.data;
    api({
      url: "/archivefiles/download/" + archId,              // ✅
      method: 'GET',
      responseType: 'blob', // 필수
    }).then((res) => {
      ofile.forEach(element => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', element.ofile); // 서버에서 파일명 내려주면 그걸로 설정 가능
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    });
  }

  return (
    <div className="view-page">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title" >게시글 보기</h1>
      </div>

      <div className="view-container">
        <Table className="view-table">
          <tbody>
            <tr>
              <td>제목</td>
              <td>{respData.archTitle}</td>
            </tr>
            <tr>
              <td>작성자</td>
              <td>
                {respData.regUserId}
                <span className="inline-info">
                  &nbsp;| 작성일: {respData.regDt ? respData.regDt.replace("T", " ") : ""}
                </span>
              </td>
            </tr>
            <tr>
              <td>수정자</td>
              <td>
                {respData.udtUserId}
                <span className="inline-info">
                  &nbsp;| 수정일: {respData.udtDt ? respData.udtDt.replace("T", " ") : ""}
                </span>
              </td>
            </tr>

            <tr>
              <td>첨부파일</td>
              <td>
                <Button
                  className="download-btn"
                  hidden={respData.isDownloadfiles === "파일있음" ? false : true}
                  onClick={() => { download(id) }}
                >
                  <FileDown size={20}/>
                </Button>
              </td>
            </tr>
            <tr>
              <td>내용</td>
              <td style={{ whiteSpace: "pre-wrap" }}>{respData.archCtnt}</td>
            </tr>
          </tbody>
        </Table>
        <div className="form-actions sticky">
          <div className="button-row">
            <div className="btn-group-right">
              <Button className="btn-edit" onClick={goEdit}>수정하기</Button>
              <Button className="btn-delete" onClick={confirmDelete}>삭제하기</Button>
              <Button className="btn-list" onClick={goList}>목록으로</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPage;
