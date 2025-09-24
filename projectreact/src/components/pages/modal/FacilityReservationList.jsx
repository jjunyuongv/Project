// import axios from 'axios';
import { useEffect, useState } from 'react';
import { Badge, Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap';
import ReactModal from 'react-modal';
import "../Facilities/css/MainContentStyle.css";
import "./css/ModalStyle.css";
import Page from "../Facilities/template/Page";
import api from '../../../api/axios';

function FacilityReservationList(props) {
  const [formData, setFormData] = useState({
    searchField: "reservationEmployeeName",
    searchWord: ""
  });
  const [prevSearch, setPrevSearch] = useState({
    searchField: "reservationEmployeeName",
    searchWord: ""
  });

  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  let searchChange = false;

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const getData = async () => {
    // const countResp = await axios.get(props.baseUrl + "/api/facilityReservations/count/" + props.parentData.facilityId);
    // const response = await axios.get(props.baseUrl + "/api/facilityReservations/" + props.parentData.facilityId + "?page=1&size=" + pageSize);
    const countResp = await api.get("/facilityReservations/count/" + props.parentData.facilityId);
    const response  = await api.get("/facilityReservations/" + props.parentData.facilityId + "?page=1&size=" + pageSize);
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  useEffect(function () {
    if (!props.isOpen)   // 닫힐땐 다시 리스트를 가져오지 않게 return 한다
      return;
    setPrevSearch({
      searchField: "reservationEmployeeName",
      searchWord: ""
    })
    setFormData({
      searchField: "reservationEmployeeName",
      searchWord: ""
    })
    getData();

  }, [props.isOpen]);

  const searchData = async (e) => {
    e.preventDefault();
    setPrevSearch({ searchField: formData.searchField, searchWord: formData.searchWord });
    // const countResp = await axios.get(props.baseUrl + "/api/facilityReservations/count/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord);
    // const response = await axios.get(props.baseUrl + "/api/facilityReservations/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=1&size=" + pageSize);
    const countResp = await api.get("/facilityReservations/count/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord);
    const response  = await api.get("/facilityReservations/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=1&size=" + pageSize);
    setCount(countResp.data);
    setRespData(response.data);
    searchChange = true;
  }

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
          <td>{element.reservationStartTime.replace("T", " ")}</td>
          <td>{element.reservationEndTime.replace("T", " ")}</td>
          <td>{element.reservationEmployeeName}</td>
          <td>{getBadge(element.reservationStatus)}</td>
        </tr>
      );
    });
    if (trData.length === 0) {
      trData.push(
        <tr key={"noData"}>
          <td colSpan={5}>결과가 없습니다.</td>
        </tr>);
    }
  };

  const movePage = async (e, page, size) => {
    e.preventDefault();
    let response = [];
    if (prevSearch.searchWord !== "") {
      // 다른 검색을 하였을때 
      if ((prevSearch.searchField !== formData.searchField || prevSearch.searchWord !== formData.searchWord) && searchChange) {
        // response = await axios.get(props.baseUrl + "/api/facilityReservations/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=" + page + "&size=" + size);
        response = await api.get("/facilityReservations/" + props.parentData.facilityId + "?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=" + page + "&size=" + size);
      } else {
        // response = await axios.get(props.baseUrl + "/api/facilityReservations/" + props.parentData.facilityId + "?searchField=" + prevSearch.searchField + "&searchWord=" + prevSearch.searchWord + "&page=" + page + "&size=" + size);
        response = await api.get("/facilityReservations/" + props.parentData.facilityId + "?searchField=" + prevSearch.searchField + "&searchWord=" + prevSearch.searchWord + "&page=" + page + "&size=" + size);
      }
    } else {
      // response = await axios.get(props.baseUrl + "/api/facilityReservations/" + props.parentData.facilityId + "?page=" + page + "&size=" + size);
      response = await api.get("/facilityReservations/" + props.parentData.facilityId + "?page=" + page + "&size=" + size);
    }
    searchChange = false;
    setRespData(response.data);
  }

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading && props.isOpen) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <ReactModal overlayClassName="ModalOverlay" className="ModalContent" isOpen={props.isOpen} ariaHideApp={false}>
      <div className="p-3 text-center">
        <div className="d-flex rounded mb-3 justify-content-between">
          {/* 검색하기 */}
          {props.parentData.facilityName}
          <h2>{props.parentData.reservationFacilityName}</h2>
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" name="searchField" id="searchField" value={formData.searchField} required onChange={formDataHandler}>
                <option value="reservationEmployeeName">예약자</option>
              </Form.Control>
              <Form.Control className="w-25" type="text" name="searchWord" id="searchWord" value={formData.searchWord} placeholder="입력..." onChange={formDataHandler} />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setPrevSearch({
                  searchField: "reservationEmployeeName",
                  searchWord: ""
                })
                setFormData({
                  searchField: "reservationEmployeeName",
                  searchWord: ""
                })
                getData();
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
        </div>
        <div className="table-wrap">
          <Table className="board-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>예약신청일</th>
                <th style={{ width: 90 }}>시작일시</th>
                <th style={{ width: 90 }}>종료일시</th>
                <th style={{ width: 120 }}>예약자</th>
                <th className="w-15">예약상황</th>
              </tr>
            </thead>
            <tbody>
              {trData}
            </tbody>
          </Table>
        </div>
        <Page count={count} pageSize={pageSize} blockSize={blockSize} movePage={movePage} />

        <div>
          <Button className="basic-button mt-3" onClick={() => {
            props.closeModal(true);
            setIsEndLoading(false);
          }}>닫기</Button>
        </div>
      </div>
    </ReactModal >
  </>
  );
}

export default FacilityReservationList;