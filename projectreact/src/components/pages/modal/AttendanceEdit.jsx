// import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import ReactModal from 'react-modal';
import "../Facilities/css/MainContentStyle.css";
import "./css/ModalStyle.css";
import { useAuth } from '../LoginForm/AuthContext';
import api from '../../../api/axios';

function AttendanceEdit(props) {
  const [formData, setFormData] = useState({
    attendanceEditEmployeeId: "",
    attendanceEditEmployeeName: "",
    attendanceReason: props.parentData.attendanceReason,
    attendanceStatus: props.parentData.attendanceStatus,
    attendanceId: props.parentData.attendanceId,
    attendanceEmployeeId: props.parentData.attendanceEmployeeId,
    attendanceEmployeeName: props.parentData.attendanceEmployeeName
  });
  // 로그인 관련
  const { isLoggedIn, user } = useAuth();
  const [isEndLoading, setIsEndLoading] = useState(false);

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function getData() {
    setFormData({
      ...formData,
      attendanceReason: props.parentData.attendanceReason,
      attendanceStatus: props.parentData.attendanceStatus,
      attendanceId: props.parentData.attendanceId,
      attendanceEmployeeId: props.parentData.attendanceEmployeeId,
      attendanceEmployeeName: props.parentData.attendanceEmployeeName
    });
  }

  const submitData = async (e) => {
    e.preventDefault();

    // let response = await axios.post(props.baseUrl + "/api/attendances/" + formData.attendanceId, formData);
    let response = await api.post("/attendances/" + formData.attendanceId, formData);
    // 입력 성공
    if (response.data === 1) {
      alert("수정 성공!");
      props.closeModal(true);
    } else {
      alert("에러 발생");
    }
  }

  useEffect(function () {
    if (!props.isOpen)   // 닫힐땐 다시 리스트를 가져오지 않게 return 한다
      return;
    if (isLoggedIn) {
      formData.attendanceEditEmployeeId = user.employeeId;
      formData.attendanceEditEmployeeName = user.name;
    }
    getData();
    setIsEndLoading(true);

  }, [props.isOpen]);

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading && props.isOpen) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <ReactModal overlayClassName="ModalOverlay" className="ModalContent" isOpen={props.isOpen} ariaHideApp={false}>
      <div className="p-3">
        <h4 className="text-center">근태 수정</h4>
        <div className="mt-3 table-wrap">
          <form onSubmit={(e) => submitData(e)} method="post" className="">
            <div className="rounded mb-3">
              <strong><h5>근태관리</h5></strong>
              <div className="d-flex mb-3">
                <InputGroup className="gap-3">
                  <Col>
                    <strong>일자</strong>
                    <Form.Control disabled type="text" name="attendanceDate" id="attendanceDate" value={props.parentData.attendanceDate} readOnly />
                  </Col>
                </InputGroup>
              </div>
              <strong><h5>사원</h5></strong>
              <div className="d-flex mb-3">
                <InputGroup className="gap-3">
                  <Col>
                    <strong>사번</strong>
                    <Form.Control disabled type="text" name="attendanceEmployeeId" id="attendanceEmployeeId" value={formData.attendanceEmployeeId} readOnly />
                  </Col>
                  <Col>
                    <strong>이름</strong>
                    <Form.Control disabled type="text" name="attendanceEmployeeName" id="attendanceEmployeeName" value={formData.attendanceEmployeeName} readOnly />
                  </Col>
                </InputGroup>
              </div>
              <strong><h5>상태</h5></strong>
              <Form.Control as="select" className="mb-3" name="attendanceStatus" id="attendanceStatus" defaultValue={formData.attendanceStatus} required onChange={formDataHandler}>
                <option value="휴가">휴가</option>
                <option value="병가">병가</option>
                <option value="지각">지각</option>
                <option value="조퇴">조퇴</option>
                <option value="출근">출근</option>
                <option value="퇴근">퇴근</option>
                <option value="결근">결근</option>
              </Form.Control>
              <strong><h5>수정자</h5></strong>
              <div className="d-flex mb-3">
                <InputGroup className="gap-3">
                  <Col>
                    <strong>사번</strong>
                    <Form.Control disabled type="text" name="attendanceEditEmployeeId" id="attendanceEditEmployeeId" value={formData.attendanceEditEmployeeId} readOnly />
                  </Col>
                  <Col>
                    <strong>이름</strong>
                    <Form.Control disabled type="text" name="attendanceEditEmployeeName" id="attendanceEditEmployeeName" value={formData.attendanceEditEmployeeName} readOnly />
                  </Col>
                </InputGroup>
              </div>
              <strong>수정사유</strong>
              <Form.Control type="text" name="attendanceReason" id="attendanceReason" value={formData.attendanceReason} onChange={formDataHandler} />
              <div className="text-center">
                <Button type="submit" className="basic-button mt-3">수정</Button>
              </div>
            </div>
          </form>
        </div>
        <div className="text-center">
          <Button className="basic-button mt-3" onClick={() => {
            setFormData({
              ...formData,
              attendanceStatus: props.parentData.attendanceStatus,
              attendanceReason: props.parentData.attendanceReason
            });
            props.closeModal();
          }}>닫기</Button>
        </div>
      </div >
    </ReactModal >
  </>
  );
}

export default AttendanceEdit;