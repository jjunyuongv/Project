// import axios from "axios";

import { useEffect, useState } from "react";
import { Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "./template/NavigatePage";
import ModalController from "../modal/ModalController";
import { useAuth } from "../LoginForm/AuthContext";
import api from "../../../api/axios";


function FacilityReservationApproval(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { page, searchField, searchWord } = useParams();
  const [formData, setFormData] = useState({
    searchField: "reservationEmployeeName",
    searchWord: ""
  });

  // 로그인 관련
  const { isLoggedIn, user } = useAuth();
  let isManager = false;
  if (isLoggedIn) {
    isManager = user.role === "MANAGER" ? true : false;
  }

  // modal창에게 주고싶은 데이터
  const [parentData, setParentData] = useState({
    facilityId: "",
    facilityType: "",
    facilityName: ""
  });

  // modal이 열려있다면 true
  const [isOpenModal, setIsOpenModal] = useState(false);
  // 사용하는 modal의 종류
  const [modalName, setModalName] = useState("NONE");

  function openModal() {
    setIsOpenModal(true);
  }

  function closeModal() {
    setIsOpenModal(false);
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
      setFormData({ searchField: formData.searchField, searchWord: formData.searchWord });
      // countResp = await axios.get(props.baseUrl + "/api/facilityReservations/approval/count?searchField=" + searchField + "&searchWord=" + searchWord);
      countResp = await api.get("/facilityReservations/approval/count?searchField=" + searchField + "&searchWord=" + searchWord);
      // response = await axios.get(props.baseUrl + "/api/facilityReservations/approval?searchField=" + searchField + "&searchWord=" + searchWord + "&page=" + page + "&size" + pageSize);
      response = await api.get("/facilityReservations/approval?searchField=" + searchField + "&searchWord=" + searchWord + "&page=" + page + "&size=" + pageSize); 
    } else {
      setFormData({ searchField: "reservationEmployeeName", searchWord: "" });
      // countResp = await axios.get(props.baseUrl + "/api/facilityReservations/approval/count");
      countResp = await api.get("/facilityReservations/approval/count");
      // response = await axios.get(props.baseUrl + "/api/facilityReservations/approval?page=" + page + "&size=" + pageSize);
      response = await api.get("/facilityReservations/approval?page=" + page + "&size=" + pageSize);
    }
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  useEffect(function () {
    getData();
  }, [page, searchField, searchWord]);

  function movePage(e, page, searchChange = false) {
    e.preventDefault();
    if (searchChange) {
      navigate("/FacilityReservationApproval/" + page + "/" + formData.searchField + "/" + formData.searchWord);
    }
    else if (searchField && searchWord) {
      navigate("/FacilityReservationApproval/" + page + "/" + searchField + "/" + searchWord);
    } else {
      navigate("/FacilityReservationApproval/" + page);
    }
  }

  function goList(e) {
    e.preventDefault();
    navigate("/FacilitiesList/1");
  }

  const searchData = async (e) => {
    e.preventDefault();
    movePage(e, 1, true);
  }

  const approval = async (e, reservationId, reservationStatus) => {
    e.preventDefault();
    if (confirm(reservationStatus + " 하시겠습니까?")) {
      const approvalData = { reservationStatus: reservationStatus };

      // let response = await axios.post(props.baseUrl + "/api/facilityReservations/" + reservationId, approvalData);
      let response = await api.post("/facilityReservations/" + reservationId, approvalData);
      // 입력 성공
      if (response.data === 1) {
        alert("결재완료");
        getData();
      } else {
        alert("에러 발생");
      }
    }
  }

  useEffect(function () {
    if (isLoggedIn) {
      if (!isManager) {
        alert("권한이 없습니다.");
        history.back();
      }
      getData();
    }
  }, []);

  useEffect(function () {
    if (!isEndLoading)
      return;
    getData();
  }, [page, searchField, searchWord]);


  function getBadge(status) {
    switch (status) {
      case "대기":
        return <h5><Badge pill bg="secondary">대기</Badge></h5>;
      case "승인":
        return <h5><Badge pill bg="success">승인</Badge></h5>;
      case "반려":
        return <h5><Badge pill bg="danger">반려</Badge></h5>;
      default:
        return <h5><Badge pill bg="secondary">Error</Badge></h5>;
    }
  }

  let trData = [];
  if (Array.isArray(respData)) {
    respData.forEach(element => {
      trData.push(
        <tr key={element.reservationId}>
          <td>{element.reservationDate.replace("T", " ")}</td>
          <td>{element.reservationFacilityName}</td>
          <td>{element.reservationEmployeeName}</td>
          <td>{element.reservationStartTime.replace("T", " ")}</td>
          <td>{element.reservationEndTime.replace("T", " ")}</td>
          <td>{getBadge(element.reservationStatus)}</td>
          <td>
            <Button className="submit-button" size="sm" onClick={(e) => {
              e.preventDefault();
              approval(e, element.reservationId, "승인");
            }}>승인</Button>
            <Button className="cancel-button mx-1" size="sm" onClick={(e) => {
              approval(e, element.reservationId, "반려");
            }}>반려</Button>
          </td>
          <td>
            <Button className="basic-button" size="sm" onClick={() => { setParentData({ facilityId: element.reservationFacilityId, facilityName: element.reservationFacilityName }); setModalName("FRLIST"); setIsOpenModal(true); }}>
              보기
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
        <h1 className="hero__title">시설물</h1>
      </div>
      <div className="d-flex justify-content-center"><Spinner animation="border" role="status" /></div>
    </div>
  }

  return (<>
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">시설물</h1>
      </div>

      <div>
        <div className="table-wrap rounded mt-3">
          <Button className="basic-button mb-3 mx-1" onClick={(e) => { goList(e); }}>
            &lt;&nbsp;돌아가기
          </Button>
          {/* 검색하기 */}
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" className="w-10" name="searchField" id="searchField" value={formData.searchField} required onChange={formDataHandler}>
                <option value="reservationEmployeeName">예약자</option>
              </Form.Control>
              <Form.Control className="w-50" type="text" name="searchWord" id="searchWord" placeholder="입력..." value={formData.searchWord} required onChange={formDataHandler} />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setFormData({
                  searchField: "reservationEmployeeName",
                  searchWord: ""
                });
                navigate("/FacilityReservationApproval/1");
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th className="w-15">작성일</th>
              <th className="w-15">시설물명</th>
              <th className="w-10">예약자</th>
              <th className="w-15">시작일시</th>
              <th className="w-15">종료일시</th>
              <th className="w-5">상태</th>
              <th className="w-15">결재</th>
              <th className="w-10">예약상황</th>
            </tr>
          </thead>
          <tbody>
            {trData}
          </tbody>
        </table>
      </div>

      <NavigatePage key={page + "-" + searchField + "-" + searchWord + "-" + count} count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} curPage={parseInt(page)} />
      <ModalController openModal={openModal} closeModal={closeModal} isOpen={isOpenModal} modalName={modalName} baseUrl={props.baseUrl} parentData={parentData} />
    </div>
  </>
  );
}

export default FacilityReservationApproval;