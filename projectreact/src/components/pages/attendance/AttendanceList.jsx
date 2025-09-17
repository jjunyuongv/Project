import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "../Facilities/template/NavigatePage";
import ModalController from "../modal/ModalController";
import { useAuth } from "../reportform/AuthContext";


function AttendanceList(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { page, date, searchField, searchWord } = useParams();
  const [formData, setFormData] = useState({
    searchField: "employeeName",
    searchWord: ""
  });
  // -1 : 로그인안됨 or 오류, 0 : 아무버튼도 누르지 않았을때, 1 : 출근버튼을 누른 후, 2 : 퇴근버튼을 누른 후
  const [empState, setEmpState] = useState(-1);
  const searchDate = date === undefined ? "" : date;

  // 로그인 관련
  const { isLoggedIn, user } = useAuth();

  // modal창에게 주고싶은 데이터
  const [parentData, setParentData] = useState({
    attendanceStatus: "",
    attendanceId: "",
    attendanceDate: "",
    attendanceEmployeeId: "",
    attendanceEmployeeName: ""
  });

  // modal이 열려있다면 true
  const [isOpenModal, setIsOpenModal] = useState(false);
  // 사용하는 modal의 종류
  const [modalName, setModalName] = useState("NONE");

  function openModal() {
    setIsOpenModal(true);
  }

  function closeModal(isUpdate) {
    setIsOpenModal(false);
    if (isUpdate === true) {
      getData();
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
    let countResp = [];
    let curEmp;
    let countUrl = props.baseUrl + "/api/attendances/count";
    let dataUrl = props.baseUrl + "/api/attendances";
    if (searchField && searchWord) {
      setFormData({ searchField: searchField, searchWord: searchWord });
      if (date !== undefined) {
        countResp = await axios.get(countUrl + "/" + date + "/" + searchField + "/" + searchWord);
        response = await axios.get(dataUrl + "/" + date + "/" + searchField + "/" + searchWord + "/page/" + page + "/" + pageSize);
      } else {
        countResp = await axios.get(countUrl + "/" + searchField + "/" + searchWord);
        response = await axios.get(dataUrl + "/" + searchField + "/" + searchWord + "/page/" + page + "/" + pageSize);
      }
    } else {
      setFormData({ searchField: "employeeName", searchWord: "" });
      if (date !== undefined) {
        countResp = await axios.get(countUrl + "/" + date);
        response = await axios.get(dataUrl + "/" + date + "/page/" + page + "/" + pageSize);
      } else {
        countResp = await axios.get(countUrl);
        response = await axios.get(dataUrl + "/page/" + page + "/" + pageSize);
      }
    }

    if (isLoggedIn) {
      curEmp = await axios.get(dataUrl + "/" + user.employeeId);
      switch (curEmp.data.attendanceStatus) {
        case "결근":
          setEmpState(0);
          break;
        case "출근", "지각":
          setEmpState(1);
          break;
        case "퇴근", "조퇴":
          setEmpState(2);
          break;
      }
    }
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  const checkIn = async () => {
    if(!confirm("출근처리 하시겠습니까?")){
      return;
    }
    if (isLoggedIn) {
      let response = await axios.post("/api/attendances/checkin/" + user.employeeId);
      if(response.data === 1){
        alert("출근시각이 저장되었습니다.");
        getData();
      } else {
        alert("오류발생");
      }
    }
  }

  const checkOut = async () => {
    if(!confirm("퇴근처리 하시겠습니까?")){
      return;
    }
    if (isLoggedIn) {
      let response = await axios.post("/api/attendances/checkout/" + user.employeeId);
      if(response.data === 1){
        alert("퇴근시각이 저장되었습니다.");
        getData();
      } else {
        alert("오류발생");
      }
    }
  }

  // const insertToday = async () => {
  //   let response = [];
  //   let dataUrl = props.baseUrl + "/api/attendances";
  //   response = await axios.post(dataUrl);
  //   if (response.data === 1) {
  //     alert("오늘 등록 성공");
  //   } else {
  //     alert("오류가 났거나 이미 등록됨");
  //   }
  // }

  useEffect(function () {
    // insertToday();
    getData();
  }, []);

  useEffect(function () {
    getData();
  }, [page, searchField, searchWord, date]);

  function movePage(e, page, searchChange = false) {
    e.preventDefault();
    let moveUrl = date !== undefined ? "/AttendanceList/" + page + "/date/" + date : "/AttendanceList/" + page;
    if (searchChange) {
      navigate(moveUrl + "/" + formData.searchField + "/" + formData.searchWord);
    } else if (searchField && searchWord) {
      navigate(moveUrl + "/" + searchField + "/" + searchWord);
    } else {
      navigate(moveUrl);
    }
  }

  function movePageDate(searchDate) {
    if (searchDate === "") {
      return;
    }

    if (searchField && searchWord) {
      navigate("/AttendanceList/1/date/" + searchDate + "/" + searchField + "/" + searchWord);
    } else {
      navigate("/AttendanceList/1/date/" + searchDate);
    }
  }

  function goAttendanceStatsPage(e) {
    e.preventDefault();
    const now = new Date();
    navigate("/AttendanceStats/1/month/" + now.getFullYear() + "-" + String((now.getMonth() + 1)).padStart(2, "0"));
  }

  const searchData = async (e) => {
    e.preventDefault();
    if (isNaN(formData.searchWord) && formData.searchField == "employeeId") {
      alert("사번은 숫자로만 검색해주세요");
      return;
    }
    movePage(e, 1, true);
  }

  let trData = [];
  if (Array.isArray(respData)) {
    respData.forEach(element => {
      trData.push(
        <tr key={element.attendanceId}>
          <td>{element.attendanceDate}</td>
          <td>{element.attendanceEmployeeId}</td>
          <td>{element.attendanceEmployeeName}</td>
          <td>{element.attendanceStart}</td>
          <td>{element.attendanceEnd}</td>
          <td>{element.attendanceStatus}</td>
          {/* <td>{element.attendanceReason}</td>
          <td>{element.attendanceEditEmployeeName}</td> */}
          <td>
            <Button className="basic-button" size="sm" onClick={(e) => {
              e.preventDefault();
              setParentData({
                attendanceId: element.attendanceId,
                attendanceDate: element.attendanceDate,
                attendanceEmployeeId: element.attendanceEmployeeId,
                attendanceEmployeeName: element.attendanceEmployeeName,
                attendanceStatus: element.attendanceStatus,
                attendanceReason: element.attendanceReason
              });
              setModalName("ATTEDIT");
              setIsOpenModal(true);
            }}>
              수정
            </Button>
          </td>
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
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">근태</h1>
      </div>

      <div>
        <div className="table-wrap rounded mt-3">
          <Button className="basic-button m-1" disabled={empState === 0 ? false : true} onClick={() => { checkIn(); }}>
            출근
          </Button>
          <Button className="basic-button m-1" disabled={empState === 1 ? false : true} onClick={() => { checkOut(); }}>
            퇴근
          </Button>
          <Button className="basic-button m-1" onClick={(e) => { goAttendanceStatsPage(e); }}>
            월별 직원 통계
          </Button>
          <br />
          {/* 검색하기 */}
          <strong>날짜검색</strong>
          <Form.Control className="mb-2" type="date" value={searchDate} onChange={(e) => { movePageDate(e.target.value); }} ></Form.Control>
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" className="w-10" name="searchField" id="searchField" value={formData.searchField} required onChange={formDataHandler}>
                <option value="employeeName">사원명</option>
                <option value="employeeId">사번</option>
                <option value="attendanceStatus">상태</option>
              </Form.Control>
              <Form.Control className="w-50" type="text" name="searchWord" id="searchWord" placeholder="입력..." value={formData.searchWord} required onChange={formDataHandler} />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setFormData({
                  searchField: "employeeName",
                  searchWord: ""
                });
                navigate("/AttendanceList/1");
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>일자</th>
              <th className="w-10">사번</th>
              <th className="w-10">사원명</th>
              <th style={{ width: 90 }}>출근시각</th>
              <th style={{ width: 90 }}>퇴근시각</th>
              <th className="w-10">상태</th>
              <th className="w-10">관리</th>
            </tr>
          </thead>
          <tbody>
            {trData}
          </tbody>
        </table>
      </div>

      <NavigatePage key={page + "-" + searchField + "-" + searchWord + "-" + count + "-" + date} count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} curPage={parseInt(page)} />
      <ModalController openModal={openModal} closeModal={closeModal} isOpen={isOpenModal} modalName={modalName} baseUrl={props.baseUrl} parentData={parentData} />
    </div>
  </>
  );
}

export default AttendanceList;
