// src/components/pages/BoardPage.jsx (경로는 프로젝트 구조에 맞게)
// 기존 로직은 유지, 요청 URL만 api 인스턴스로 교체

import { FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavigatePage from "../Facilities/template/NavigatePage";
import "./BoardPage.css";
import api from "../../../api/axios";

// ✅ 공용 axios 인스턴스 사용 (baseURL: /api 또는 VITE_API_BASE)

const PAGE_SIZE = 8;

export default function BoardPage(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState([]);
  const [count, setCount] = useState(0);

  /* const [category, setCategory] = useState("전체");
  const [q, setQ] = useState(""); */
  const pageSize = 5;
  const blockSize = 3;
  /* const [isEndLoading, setIsEndLoading] = useState(false); */
  const { page, searchField, searchWord } = useParams();
  const [formData, setFormData] = useState({
    searchField: "archTitle",
    searchWord: ""
  });
  const now = new Date();
  // 현재시간 등록시간 비교 위해 필요
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);

  function movePage(e, page, searchChange = false) {
    e.preventDefault();
    if (searchChange) {
      navigate("/BoardPage/" + page + "/" + formData.searchField + "/" + formData.searchWord);
    } else {
      navigate("/BoardPage/" + page);
    }
  }

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const getData = async () => {
    let response = [];
    let countResp = []
    if (searchField && searchWord) {
      setFormData({ searchField: searchField, searchWord: searchWord });
      // ✅ baseURL=/api 이므로 여기서는 /archive 로 시작
      countResp = await api.get("/archive/count/" + searchField + "/" + searchWord);
      response = await api.get("/archive/" + searchField + "/" + searchWord + "/page/" + page + "/" + PAGE_SIZE);
    } else {
      setFormData({ searchField: "archTitle", searchWord: "" });
      countResp = await api.get("/archive/count");
      // 기존 코드 유지(5 고정) — 기본 동작 보존
      response = await api.get("/archive/page/" + page + "/" + 5);
    }
    setCount(countResp.data);
    setRespData(response.data);
    // setIsEndLoading(true);
  }

  useEffect(function () {
    getData();
  }, []);

  useEffect(function () {
    getData();
  }, [page, searchField, searchWord]);

  const download = async (archId) => {
    // ✅ 파일 메타 조회
    const response = await api.get("/archivefiles/" + archId);
    let ofile = response.data;

    // ✅ blob 다운로드 (baseURL=/api)
    api({
      url: "/archivefiles/download/" + archId,
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

  const searchData = async (e) => {
    e.preventDefault();
    movePage(e, 1, true);
  }
  let trData = [];
  if (Array.isArray(respData)) {
    respData.forEach(element => {
      trData.push(
        <tr key={element.archId}>
          {Math.floor((new Date (localTime).getTime() -new Date (element.regDt).getTime())/60000) < 1440 ?
          (<td><h5><Badge className="badge-plain">NEW</Badge></h5></td>) :(<td>{element.archId}</td>)}
          <td><Link onClick={(e) => { goView(e, element.archId) }}>{element.archTitle} </Link></td>
          <td><Button className="icon-button" hidden={element.isDownloadfiles === "파일있음" ? 
            false : true} onClick={() => { download(element.archId) }}>
              <FileDown size={20} /> </Button></td>
          <td>{element.regUserId}</td>
          <td>{element.regDt.replace("T"," ")}</td>
        </tr>
      );
    });
    if (trData.length === 0) {
      trData.push(
        <tr key={"noData"}>
          <td colSpan={8}>결과가 없습니다.</td>
        </tr>);
    }
  };

 /*  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  }; */

  function goWrite(e) {
    e.preventDefault();
    navigate("/WritePage");
  }
  function goView(e, id) {
    e.preventDefault();
    navigate("/ViewPage/" + id);
  }

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">문서보관소</h1>
      </div>

      <div className="search-container mt-4">
      <div className="search-wrap" >
        <form onSubmit={searchData} method="post" className="my-2">
          <InputGroup>
            <select className="search-select" name="searchField" id="searchField" 
              value={formData.searchField} 
              required onChange={formDataHandler}>

              <option value="archTitle">제목</option>
              <option value="archCtnt">내용</option>
            </select>
            
            <Form.Control className="srchWord" type="text" 
            name="searchWord" id="searchWord" 
            placeholder="검색어를 입력하세요" value={formData.searchWord} required onChange={formDataHandler} />
            <Button className="basic-button" type="submit">검색</Button>
            <Button className="basic-button mx-3" onClick={(e) => {
              e.preventDefault();
              setFormData({
                searchField: "archTitle",
                searchWord: ""
              });
              navigate("/BoardPage/1");
            }}> 검색 초기화</Button>
            <Button
              variant="primary"
              className="basic-button write-btn rounded-0"
              onClick={goWrite}
            >
              글쓰기
            </Button>
          </InputGroup>
        </form>

<div className="board-table-container">
  <table className="board-table mx-auto" >
          <thead>
            <tr>
              <th width= "11%">번호</th>
              <th width= "40%">제목</th>
              <th width= "10%">첨부파일</th>
              <th width= "13%">작성자ID</th>
              {/* <th style={{width: 120}}>소속부서</th> */}
              <th width= "13%">등록일</th>
            </tr>
          </thead>

          <tbody>
            {trData}
          </tbody>

        </table>
        <NavigatePage 
        key={page + "-" + searchField + "-" + searchWord + "-" + count} 
        count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} curPage={parseInt(page)} />
      </div>
      </div>
      </div>
      </div>
  );
}
