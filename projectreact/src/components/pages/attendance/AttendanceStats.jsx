// import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "../Facilities/template/NavigatePage";
import { useAuth } from "../LoginForm/AuthContext";
import api from "../../../api/axios";


function AttendanceStats(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { page, month, searchField, searchWord } = useParams();
  const [formData, setFormData] = useState({
    searchField: "employeeName",
    searchWord: ""
  });

  // 로그인 관련
  const { isLoggedIn, user } = useAuth();
  let isManager = false;
  if (isLoggedIn) {
    isManager = user.role === "MANAGER" ? true : false;
  }

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const getData = async () => {
    let response = [];
    let countResp = [];
    // let dataUrl = props.baseUrl + "/api/attendances/stat";
    let dataUrl = "/attendances/stat";
    if (searchField && searchWord) {
      setFormData({ searchField: searchField, searchWord: searchWord });
      countResp = await api.get(dataUrl + "/count?month=" + month + "&searchField=" + searchField + "&searchWord=" + searchWord);
      response = await api.get(dataUrl + "?month=" + month + "&searchField=" + searchField + "&searchWord=" + searchWord + "&page=" + page + "&size=" + pageSize);
    } else {
      setFormData({ searchField: "employeeName", searchWord: "" });
      countResp = await api.get(dataUrl + "/count?month=" + month);
      response = await api.get(dataUrl + "?month=" + month + "&page=" + page + "&size" + pageSize);
    }

    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  useEffect(function () {
    if (isLoggedIn)
      if (!isManager) {
        alert("권한이 없습니다.");
        history.back();
      }
    getData();
  }, []);

  useEffect(function () {
    if (!isEndLoading)
      return;
    getData();
  }, [page, searchField, searchWord, month]);

  function movePage(e, page, searchChange = false) {
    e.preventDefault();
    let moveUrl = month !== undefined ? "/AttendanceStats/" + page + "/month/" + month : "/AttendanceStats/" + page;
    if (searchChange) {
      navigate(moveUrl + "/" + formData.searchField + "/" + formData.searchWord);
    } else if (searchField && searchWord) {
      navigate(moveUrl + "/" + searchField + "/" + searchWord);
    } else {
      navigate(moveUrl);
    }
  }

  function movePageMonth(searchMonth) {
    if (searchMonth === "") {
      return;
    }

    if (searchField && searchWord) {
      navigate("/AttendanceStats/1/month/" + searchMonth + "/" + searchField + "/" + searchWord);
    } else {
      navigate("/AttendanceStats/1/month/" + searchMonth);
    }
  }

  function goAttendanceList(e) {
    e.preventDefault();
    navigate("/AttendanceList/1");
  }

  const searchData = async (e) => {
    e.preventDefault();
    if (isNaN(formData.searchWord) && formData.searchField == "employeeId") {
      alert("사번은 숫자로만 검색해주세요");
      return;
    }
    movePage(e, 1, true);
  }

  // 사번, 사원명, 출퇴근, 지각, 조퇴, 휴가, 병가, 결근
  let trData = [];
  if (Array.isArray(respData)) {
    respData.forEach(element => {
      trData.push(
        <tr key={element.employeeId}>
          <td>{element.employeeId}</td>
          <td>{element.employeeName}</td>
          <td>{element.commute === null ? 0 : element.commute}</td>
          <td>{element.late === null ? 0 : element.late}</td>
          <td>{element.leaveEarly === null ? 0 : element.leaveEarly}</td>
          <td>{element.vacation === null ? 0 : element.vacation}</td>
          <td>{element.sick === null ? 0 : element.sick}</td>
          <td>{element.absence === null ? 0 : element.absence}</td>
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

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading) {
    return <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">근태 통계</h1>
      </div>
      <div className="d-flex justify-content-center align-items-center"><Spinner animation="border" role="status" /></div>
    </div>
  }

  return (<>
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">근태 통계</h1>
      </div>

      <div>
        <div className="table-wrap rounded mt-3">
          <Button className="basic-button m-1" onClick={(e) => { goAttendanceList(e); }}>
            &lt; 근태 리스트
          </Button>
          <br />
          {/* 검색하기 */}
          <strong>월별 조회</strong>
          <Form.Control className="mb-2" type="month" value={month} onChange={(e) => { movePageMonth(e.target.value); }} ></Form.Control>
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" className="w-10" name="searchField" id="searchField" value={formData.searchField} required onChange={formDataHandler}>
                <option value="employeeName">사원명</option>
                <option value="employeeId">사번</option>
              </Form.Control>
              <Form.Control className="w-50" type="text" name="searchWord" id="searchWord" placeholder="입력..." value={formData.searchWord} required onChange={formDataHandler} />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setFormData({
                  searchField: "employeeName",
                  searchWord: ""
                });
                const now = new Date();
                navigate("/AttendanceStats/1/month/" + now.getFullYear() + "-" + String((now.getMonth() + 1)).padStart(2, "0"));
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th className="w-10">사번</th>
              <th className="w-10">사원명</th>
              <th className="w-10">출퇴근</th>
              <th className="w-10">지각</th>
              <th className="w-10">조퇴</th>
              <th className="w-10">휴가</th>
              <th className="w-10">병가</th>
              <th className="w-10">결근</th>
            </tr>
          </thead>
          <tbody>
            {trData}
          </tbody>
        </table>
      </div>

      <NavigatePage key={page + "-" + searchField + "-" + searchWord + "-" + count + "-" + month} count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} curPage={parseInt(page)} />
    </div>
  </>
  );
}

export default AttendanceStats;
