// import axios from "axios";
import { useEffect, useState } from "react";
import { Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "../Facilities/template/NavigatePage";
import ModalController from "../modal/ModalController";
import { useAuth } from "../LoginForm/AuthContext";
import api from "../../../api/axios";


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
  let isManager = false;
  if (isLoggedIn) {
    isManager = user.role === "MANAGER" ? true : false;
  }

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
    // let countUrl = props.baseUrl + "/api/attendances/count";
    // let dataUrl = props.baseUrl + "/api/attendances";
    let countUrl = "/attendances/count";
    let dataUrl = "/attendances";
    if (searchField && searchWord) {
      setFormData({ searchField: searchField, searchWord: searchWord });
      if (date !== undefined) {
        countResp = await api.get(countUrl + "?date=" + date + "&searchField=" + searchField + "&searchWord=" + searchWord);
        response = await api.get(dataUrl + "?date=" + date + "&searchField=" + searchField + "&searchWord=" + searchWord + "&page=" + page + "&size=" + pageSize);
      } else {
        countResp = await api.get(countUrl + "?searchField=" + searchField + "&searchWord=" + searchWord);
        response = await api.get(dataUrl + "?searchField=" + searchField + "&searchWord=" + searchWord + "&page=" + page + "&size=" + pageSize);
      }
    } else {
      setFormData({ searchField: "employeeName", searchWord: "" });
      if (date !== undefined) {
        countResp = await api.get(countUrl + "?date=" + date);
        response = await api.get(dataUrl + "?date=" + date + "&page=" + page + "&size=" + pageSize);
      } else {
        countResp = await api.get(countUrl);
        response = await api.get(dataUrl + "?page=" + page + "&size=" + pageSize);
      }
    }

    // 출근시각 퇴근 시각 여부로 출근/퇴근 버튼 비활성화
    if (isLoggedIn) {
      curEmp = await api.get(dataUrl + "/" + user.employeeId);
      if (curEmp.data.attendanceStart === null) {
        setEmpState(0);
      } else if(curEmp.data.attendanceEnd === null){
        setEmpState(1);
      } else{
        setEmpState(2);
      }
    }
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  const checkIn = async () => {
    if (!confirm("출근처리 하시겠습니까?")) {
      return;
    }
    if (isLoggedIn) {
      let response = await api.post("/attendances/checkin/" + user.employeeId);
      if (response.data === 1) {
        alert("출근시각이 저장되었습니다.");
        getData();
      } else {
        alert("오류발생");
      }
    }
  }

  const checkOut = async () => {
    if (!confirm("퇴근처리 하시겠습니까?")) {
      return;
    }
    if (isLoggedIn) {
      let response = await api.post("/attendances/checkout/" + user.employeeId);
      if (response.data === 1) {
        alert("퇴근시각이 저장되었습니다.");
        getData();
      } else {
        alert("오류발생");
      }
    }
  }

  // 오늘 근태 ROW추가 자동으로 9:20분에 추가되도록 했지만 서버를 계속 켜놔야하기때문에
  // 데이터가 없을 때 추가하도록 함
  // 모든 직원 등록하려면 이걸로
  const insertToday = async () => {
    let response = [];
    // let dataUrl = props.baseUrl + "/api/attendances";
    let dataUrl = "/attendances";
    response = await api.post(dataUrl);
    if (response.data === 1) {
      getData();
    } else {
      getData();
      alert("오류 발생");
    }
  }

  useEffect(function () {
    // 로그인 안되어있을 때는 데이터를 불러오지 않음
    if (isLoggedIn) {
      insertToday();
    }
  }, []);

  useEffect(function () {
    if (!isEndLoading)
      return;
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

  function getBadge(status) {
    switch (status) {
      case "결근":
        return <h5><Badge pill bg="danger">결근</Badge></h5>;
      case "휴가":
        return <h5><Badge pill bg="primary">휴가</Badge></h5>;
      case "병가":
        return <h5><Badge pill bg="info">병가</Badge></h5>;
      case "지각":
        return <h5><Badge pill bg="warning">지각</Badge></h5>;
      case "조퇴":
        return <h5><Badge pill bg="secondary">조퇴</Badge></h5>;
      case "출근":
        return <h5><Badge pill bg="success">출근</Badge></h5>;
      case "퇴근":
        return <h5><Badge pill bg="dark">퇴근</Badge></h5>;
      default:
        return <h5><Badge pill bg="secondary">Error</Badge></h5>;
    }
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
          <td>{getBadge(element.attendanceStatus)}</td>
          <td hidden={!isManager}>
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
    return <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">근태</h1>
      </div>
      <div className="d-flex justify-content-center align-items-center"><Spinner animation="border" role="status" /></div>
    </div>
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
          <Button className="basic-button m-1" hidden={!isManager} onClick={(e) => { goAttendanceStatsPage(e); }}>
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
              <th className="w-10" hidden={!isManager}>관리</th>
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
