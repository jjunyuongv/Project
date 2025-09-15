import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ModalController from "../modal/ModalController";
import axios from "axios";


function FacilitiesEdit(props) {
  const navigate = useNavigate();
  // const [respData, setRespData] = useState();
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { facilityId } = useParams();
  const [formData, setFormData] = useState({
    facilityName: "",
    facilityType: "",
    facilityLocation: "",
    facilityStatus: "",
    facilityManagerId: ""
  });
  const [modalData, setModalData] = useState({
    employeeId: "",
    employeeName: ""
  });
  const facilityType = ["회의실", "주차장", "식당", "교육실", "사무실"];

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const getData = async () => {
    let response = [];
    response = await axios.get(props.baseUrl + "/api/facilities/" + facilityId);
    let data = response.data;
    formData.facilityName = data.facilityName;
    formData.facilityType = data.facilityType;
    formData.facilityLocation = data.facilityLocation;
    formData.facilityStatus = data.facilityStatus;
    formData.facilityManagerId = data.facilityManagerId;
    modalData.employeeId = data.facilityManagerId;
    modalData.employeeName = data.facilityManagerName;

    setIsEndLoading(true);
  }

  useEffect(function () {
    getData();
  }, []);

  const submitData = async (e) => {
    e.preventDefault();
    formData.facilityManagerId = modalData.employeeId;
    console.log(formData);
    if (modalData.employeeId === "") {
      alert("담당 사원을 선택해주세요.");
      return;
    }

    let response = await axios.post(props.baseUrl + "/api/facilities/" + facilityId, formData);
    // 입력 성공
    if (response.data === 1) {
      alert("시설물 수정 성공!");
      goList();
    } else {
      alert("에러 발생");
    }
  }

  function goList() {
    navigate("/FacilitiesList/1");
  }

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

  let typeData = [];
  facilityType.forEach(element => {
    typeData.push(
      <option key={element} value={element}>{element}</option >
    );
  });

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">시설물 수정</h1>
      </div>
      <div className="table-wrap rounded mt-3">
        <form onSubmit={submitData} method="post">
          <Row className="mb-3">
            <Col>
              <strong>시설물 종류</strong>
              <Form.Control as="select" name="facilityType" defaultValue={formData.facilityType} required onChange={formDataHandler}>
                <option value="">--선택--</option>
                {typeData}
              </Form.Control>
            </Col>
            <Col>
              <strong>시설명</strong>
              <Form.Control name="facilityName" placeholder="시설명 입력..." value={formData.facilityName} onChange={formDataHandler} />
            </Col>
            <Col>
              <strong>현재 사용가능 여부</strong>
              <Form.Control as="select" name="facilityStatus" defaultValue={formData.facilityType} required onChange={formDataHandler}>
                <option value="사용가능">사용가능</option>
                <option value="사용불가">사용불가</option>
              </Form.Control>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <strong>시설위치</strong>
              <Form.Control name="facilityLocation" placeholder="위치 입력..." value={formData.facilityLocation} onChange={formDataHandler} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <strong>담당 사원 번호</strong>
              <Form.Control placeholder="담당 사원 번호" value={modalData.employeeId} onClick={() => { setModalName("EMP"); setIsOpenModal(true); }} readOnly />
            </Col>
            <Col>
              <strong>담당 사원명</strong>
              <Form.Control placeholder="담당 사원명" value={modalData.employeeName} onClick={() => { setModalName("EMP"); setIsOpenModal(true); }} readOnly />
            </Col>
          </Row>

          <div className="d-flex justify-content-center gap-3">
            <Button className="submit-button" type="submit">완료</Button>
            <Button className="cancel-button" onClick={goList}>취소</Button>
          </div>
        </form>
      </div>

      <ModalController openModal={openModal} closeModal={closeModal} isOpen={isOpenModal} modalName={modalName} baseUrl={props.baseUrl} selectData={setModalData} />
    </div>
  </>
  );
}

export default FacilitiesEdit;
