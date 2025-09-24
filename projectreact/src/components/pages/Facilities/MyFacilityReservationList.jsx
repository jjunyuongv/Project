// import axios from "axios";

import { useEffect, useState } from "react";
import { Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "./template/NavigatePage";
import ModalController from "../modal/ModalController";
import api from "../../../api/axios";


function MyFacilityReservationList(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { employeeId, page } = useParams();

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

  const confirmDelete = async (reservationId) => {
    if (confirm("예약 신청을 취소하시겠습니까?")) {
      // let response = await axios.delete(props.baseUrl + "/api/facilityReservations/" + reservationId);
      let response = await api.delete("/facilityReservations/" + reservationId);
      if (response.data === 1) {
        alert("삭제완료");
        getData();
      } else {
        alert("에러발생");
      }
    }
  }

  const getData = async () => {
    let response = [];
    let countResp = []
    // countResp = await axios.get(props.baseUrl + "/api/facilityReservations/count?searchField=reservationEmployeeId&searchWord=" + employeeId);
    countResp = await api.get("/facilityReservations/count?searchField=reservationEmployeeId&searchWord=" + employeeId);
    // response = await axios.get(props.baseUrl + "/api/facilityReservations?searchField=reservationEmployeeId&searchWord=" + employeeId + "&page=" + page + "&size=" + pageSize);
    response = await api.get("/facilityReservations?searchField=reservationEmployeeId&searchWord=" + employeeId + "&page=" + page + "&size=" + pageSize);
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }


  function goList(e) {
    e.preventDefault();
    navigate("/FacilitiesList/1");
  }

  function movePage(e, page) {
    e.preventDefault();
    navigate("/MyFacilityReservationList/" + "101" + "/" + page);
  }

  useEffect(function () {
    if (!isEndLoading)
      return;
    getData();
  }, [page]);

  useEffect(function () {
    getData();
  }, []);


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
            <Button className="basic-button" size="sm" onClick={() => { setParentData({ facilityId: element.reservationFacilityId, facilityName: element.reservationFacilityName }); setModalName("FRLIST"); setIsOpenModal(true); }}>
              보기
            </Button>
          </td>
          <td>
            <Button className="cancel-button" size="sm" disabled={element.reservationStatus !== "대기" ? true : false} onClick={() => { confirmDelete(element.reservationId); }}>
              취소
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

      <div className="table-wrap mt-3">
        <Button className="basic-button mb-3 mx-1" onClick={(e) => { goList(e); }}>
          &lt;&nbsp;돌아가기
        </Button>
        <table className="board-table">
          <thead>
            <tr>
              <th className="w-15">작성일</th>
              <th className="w-15">시설명</th>
              <th className="w-10">예약자</th>
              <th className="w-15">시작일시</th>
              <th className="w-15">종료일시</th>
              <th className="w-10">상태</th>
              <th className="w-10">시설물</th>
              <th className="w-10">취소</th>
            </tr>
          </thead>
          <tbody>
            {trData}
          </tbody>
        </table>
      </div>

      <NavigatePage key={page + "-" + count} count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} curPage={parseInt(page)} />
      <ModalController openModal={openModal} closeModal={closeModal} isOpen={isOpenModal} modalName={modalName} baseUrl={props.baseUrl} parentData={parentData} />
    </div>
  </>
  );
}

export default MyFacilityReservationList;