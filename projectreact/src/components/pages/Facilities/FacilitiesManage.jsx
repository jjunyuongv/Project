import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavigatePage from "./template/NavigatePage";
import ModalController from "../modal/ModalController";
import { useAuth } from "../reportform/AuthContext";


function FacilitiesManage(props) {
  const navigate = useNavigate();
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  const { page, searchField, searchWord } = useParams();
  const [formData, setFormData] = useState({
    searchField: "facilityName",
    searchWord: ""
  });

  // modal창에게 주고싶은 데이터
  const [parentData, setParentData] = useState({
    facilityId: "",
    facilityType: "",
    facilityName: ""
  });

  // 로그인 정보
  const { isLoggedIn, user } = useAuth();

  function goWrite(e) {
    e.preventDefault();
    navigate("/FacilitiesWrite");
  }

  function goMyReservation(e) {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/MyFacilityReservationList/" + user.employeeId + "/1");
    } else {
      alert("로그인 상태일때만 접근 가능합니다");
    }
  }

  function goFacilityReservationApproval(e) {
    e.preventDefault();
    navigate("/FacilityReservationApproval/1");
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
      countResp = await axios.get(props.baseUrl + "/api/facilities/count/" + searchField + "/" + searchWord);
      response = await axios.get(props.baseUrl + "/api/facilities/" + searchField + "/" + searchWord + "/page/" + page + "/" + pageSize);
    } else {
      setFormData({ searchField: "facilityName", searchWord: "" });
      countResp = await axios.get(props.baseUrl + "/api/facilities/count");
      response = await axios.get(props.baseUrl + "/api/facilities/page/" + page + "/" + pageSize);
    }
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  useEffect(function () {
    getData();
  }, []);

  useEffect(function () {
    getData();
  }, [page, searchField, searchWord]);

  function movePage(e, page, searchChange = false) {
    e.preventDefault();
    if (searchChange) {
      navigate("/FacilitiesList/" + page + "/" + formData.searchField + "/" + formData.searchWord);
    } else if (searchField && searchWord) {
      navigate("/FacilitiesList/" + page + "/" + searchField + "/" + searchWord);
    } else {
      navigate("/FacilitiesList/" + page);
    }
  }

  const confirmDelete = async (facilityId) => {
    if (confirm("정말 이 시설을 삭제하시겠습니까?")) {
      let response = await axios.delete(props.baseUrl + "/api/facilities/" + facilityId);
      if (response.data === 1) {
        alert("삭제 성공");
        getData();
      } else {
        alert("에러 발생");
      }
    }
  }

  const searchData = async (e) => {
    e.preventDefault();
    movePage(e, 1, true);
  }

  let trData = [];
  if (Array.isArray(respData)) {
    respData.forEach(element => {
      trData.push(
        <tr key={element.facilityId}>
          <td>{element.facilityType}</td>
          <td>{element.facilityName}</td>
          <td>{element.facilityLocation}</td>
          <td>{element.facilityStatus}</td>
          <td>{element.facilityManagerName}</td>
          <td>
            <Button className="basic-button" size="sm" disabled={element.facilityStatus === "사용불가" ? true : false} onClick={() => { setParentData({ facilityId: element.facilityId, facilityType: element.facilityType, facilityName: element.facilityName }); setModalName("FRWRITE"); setIsOpenModal(true); }}>
              {element.facilityStatus === "사용불가" ? "불가" : "예약"}
            </Button>
          </td>
          <td>
            <Button className="basic-button" size="sm" onClick={() => { setParentData({ facilityId: element.facilityId }); setModalName("FRLIST"); setIsOpenModal(true); }}>
              보기
            </Button>
          </td>
          <td>
            <Button className="basic-button" size="sm" onClick={() => { navigate("/FacilitiesEdit/" + element.facilityId); }}>
              수정
            </Button>
            <Button className="cancel-button m-1" size="sm" onClick={() => { confirmDelete(element.facilityId); }}>
              삭제
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
        <h1 className="hero__title">시설물</h1>
      </div>

      <div>
        <div className="table-wrap rounded mt-3">
          {/* 유저 */}
          <Button className="text-left basic-button mb-3 mx-1" onClick={(e) => { goWrite(e); }}>
            시설 등록
          </Button>
          <Button className="text-left basic-button mb-3 mx-1" onClick={(e) => { goMyReservation(e); }}>
            내 예약
          </Button>
          {/* 매니저 */}
          <Button className="text-left basic-button mb-3 mx-1" onClick={(e) => { goFacilityReservationApproval(e); }}>
            시설물 예약대기
          </Button>
          {/* 검색하기 */}
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" className="w-10" name="searchField" id="searchField" defaultValue={formData.searchField} required onChange={formDataHandler}>
                <option value="facilityName">시설명</option>
                <option value="facilityType">종류</option>
              </Form.Control>
              <Form.Control className="w-50" type="text" name="searchWord" id="searchWord" placeholder="입력..." value={formData.searchWord} required onChange={formDataHandler} />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setFormData({
                  searchField: "facilityName",
                  searchWord: ""
                });
                navigate("/FacilitiesList/1");
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>종류</th>
              <th>시설명</th>
              <th className="w-25">위치</th>
              <th style={{ width: 120 }}>사용여부</th>
              <th style={{ width: 120 }}>관리자명</th>
              <th className="w-10">예약</th>
              <th className="w-10">예약상황</th>
              <th className="w-10">관리</th>
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

export default FacilitiesManage;
