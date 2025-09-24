// import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import ReactModal from 'react-modal';
import "../Facilities/css/MainContentStyle.css";
import "./css/ModalStyle.css";
import { useAuth } from '../LoginForm/AuthContext';
import api from '../../../api/axios';

function FacilityReservationWrite(props) {
  const [formData, setFormData] = useState({
    reservationFacilityId: props.parentData.facilityId,
    reservationFacilityName: props.parentData.facilityName,
    reservationFacilityType: props.parentData.facilityType,
    reservationEmployeeId: "",
    reservationEmployeeName: "",
    reservationStatus: "대기",
    reservationStartTime: "",
    reservationEndTime: "",
    reservationDate: ""
  });
  // 로그인 관련
  const { isLoggedIn, user } = useAuth();
  const [isEndLoading, setIsEndLoading] = useState(false);

  const now = new Date();
  // 현재시간 예약시간 비교 위해 필요
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const submitData = async (e) => {
    e.preventDefault();
    if (formData.reservationStartTime === "" || formData.reservationEndTime === "") {
      alert("예약일시를 입력해주세요");
      return;
    }

    // let response = await axios.post(props.baseUrl + "/api/facilityReservations", formData);
    let response = await api.post("/facilityReservations", formData);
    // 입력 성공
    if (response.data === 1) {
      alert("예약신청 성공!");
      setFormData({ ...formData, reservationStartTime: "", reservationEndTime: "", reservationDate: "" });
      props.closeModal();
    } else {
      alert("에러 발생");
    }
  }

  useEffect(function () {
    if (!props.isOpen)
      return;

    if (isLoggedIn) {
      formData.reservationEmployeeId = user.employeeId;
      formData.reservationEmployeeName = user.name;
    }
    setIsEndLoading(true);
  }, [!props.isOpen]);

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading && props.isOpen) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <ReactModal overlayClassName="ModalOverlay" className="ModalContent" isOpen={props.isOpen} ariaHideApp={false}>
      <div className="p-3">
        <h4 className="text-center">예약</h4>
        <div className="mt-5 table-wrap">
          <form onSubmit={(e) => submitData(e)} method="post" className="">
            <div className="rounded mb-3">
              <strong><h5>예약시설</h5></strong>
              <div className="d-flex mb-3">
                <InputGroup className="gap-3">
                  <Col>
                    <strong>종류</strong>
                    <Form.Control type="text" name="reservationFacilityType" id="reservationFacilityType" value={props.parentData.facilityType} readOnly />
                  </Col>
                  <Col>
                    <strong>시설명</strong>
                    <Form.Control type="text" name="reservationFacilityName" id="reservationFacilityName" value={props.parentData.facilityName} readOnly />
                  </Col>
                </InputGroup>
              </div>
              <strong><h5>예약자</h5></strong>
              <div className="d-flex mb-3">
                <InputGroup className="gap-3">
                  <Col>
                    <strong>사번</strong>
                    <Form.Control type="text" name="reservationEmployeeId" id="reservationEmployeeId" value={formData.reservationEmployeeId} readOnly />
                  </Col>
                  <Col>
                    <strong>이름</strong>
                    <Form.Control type="text" name="reservationEmployeeName" id="reservationEmployeeName" value={formData.reservationEmployeeName} readOnly />
                  </Col>
                </InputGroup>
              </div>
              <strong><h5>예약일시</h5></strong>
              <InputGroup className="gap-3">
                <Col>
                  <strong>시작일시</strong>
                  <Form.Control name="reservationStartTime" id="reservationStartTime" type="datetime-local" value={formData.reservationStartTime} onChange={(e) => {
                    if (formData.reservationEndTime >= e.target.value || formData.reservationEndTime === "") {
                      formDataHandler(e);
                    } else {
                      alert("종료일시 이전으로 선택해주세요");
                    }

                  }}></Form.Control>
                </Col>
                <Col>
                  <strong>종료일시</strong>
                  <Form.Control className="mb-3" name="reservationEndTime" id="reservationEndTime" type="datetime-local" value={formData.reservationEndTime} min={localTime} onChange={(e) => {
                    if (e.target.value <= localTime) {
                      alert("현재 이후로 선택해주세요");
                    }
                    else if (formData.reservationStartTime <= e.target.value || formData.reservationStartTime === "") {
                      formDataHandler(e);
                    } else {
                      alert("시작 일시 이후로 선택해주세요");
                    }
                  }}></Form.Control>
                </Col>
              </InputGroup>
              <div className="text-center">
                <Button type="submit" className="basic-button mt-3">신청</Button>
              </div>
            </div>
          </form>
        </div>
        <div className="text-center">
          <Button className="basic-button mt-3" onClick={() => {
            setFormData({ ...formData, reservationStartTime: "", reservationEndTime: "", reservationDate: "" });
            props.closeModal();
          }}>닫기</Button>
        </div>
      </div >
    </ReactModal >
  </>
  );
}

export default FacilityReservationWrite;