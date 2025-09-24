// import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap';
import ReactModal from 'react-modal';
import "../Facilities/css/MainContentStyle.css";
import "./css/ModalStyle.css";
import Page from "../Facilities/template/Page";
import api from '../../../api/axios';

function EmpModal(props) {
  const [formData, setFormData] = useState({
    searchField: "employeeName",
    searchWord: ""
  });
  const [prevSearch, setPrevSearch] = useState({
    searchField: "employeeName",
    searchWord: ""
  });
  const [respData, setRespData] = useState();
  const [count, setCount] = useState(0);
  const pageSize = 5;
  const blockSize = 3;
  const [isEndLoading, setIsEndLoading] = useState(false);
  let searchChange = false;

  const setModalData = (key, value) => {
    props.selectData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const formDataHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const getData = async () => {
    // const countResp = await axios.get(props.baseUrl + "/api/employees/count")
    const countResp = await api.get("/employees/count");
    // const response = await axios.get(props.baseUrl + "/api/employees?page=1&size=" + pageSize);
    const response  = await api.get("/employees?page=1&size=" + pageSize);
    setCount(countResp.data);
    setRespData(response.data);
    setIsEndLoading(true);
  }

  useEffect(function () {
    if (!props.isOpen)   // 닫힐땐 다시 리스트를 가져오지 않게 return 한다
      return;

    getData();

  }, [props.isOpen]);


  const searchData = async (e) => {
    e.preventDefault();
    if (formData.searchWord == "") {
      alert("검색어를 입력해주세요.");
      return;
    }
    setPrevSearch({ searchField: formData.searchField, searchWord: formData.searchWord });
    // const countResp = await axios.get(props.baseUrl + "/api/employees/count?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord);
     const countResp = await api.get("/employees/count?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord);
     // const response = await axios.get(props.baseUrl + "/api/employees?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=1&size=" + pageSize);
    const response  = await api.get("/employees?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=1&size=" + pageSize);
    setCount(countResp.data);
    setRespData(response.data);
    searchChange = true;
  }

  let trData = [];

  if (Array.isArray(respData)) {
    respData.forEach(element => {
      // console.log(element);
      trData.push(
        <tr key={element.employeeId}>
          <td>{element.employeeId}</td>
          <td>{element.employeeName}</td>
          <td><Button size="sm" className="basic-button" onClick={() => {
            setModalData("employeeId", element.employeeId);
            setModalData("employeeName", element.employeeName);
            // 다시 초기화
            setPrevSearch({
              searchField: "employeeName",
              searchWord: ""
            });
            props.closeModal();
          }}>선택</Button></td>
        </tr>
      );
    });
    if (trData.length === 0) {
      trData.push(
        <tr key={"noData"}>
          <td colSpan={3}>결과가 없습니다.</td>
        </tr>);
    }
  };

  const movePage = async (e, page, size) => {
    e.preventDefault();
    let response = [];
    if (prevSearch.searchWord !== "") {
      // 다른 검색을 하였을때 
      if ((prevSearch.searchField !== formData.searchField || prevSearch.searchWord !== formData.searchWord) && searchChange) {
        // response = await axios.get(props.baseUrl + "/api/employees?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=" + page + "&size=" + size);
        response = await api.get("/employees?searchField=" + formData.searchField + "&searchWord=" + formData.searchWord + "&page=" + page + "&size=" + size);
      } else {
        // response = await axios.get(props.baseUrl + "/api/employees?searchField=" + prevSearch.searchField + "&searchWord=" + prevSearch.searchWord + "&page=" + page + "&size=" + size);
        response = await api.get("/employees?searchField=" + prevSearch.searchField + "&searchWord=" + prevSearch.searchWord + "&page=" + page + "&size=" + size);
      }
    } else {
      // response = await axios.get(props.baseUrl + "/api/employees?page=" + page + "&size=" + size);
      response = await api.get("/employees?page=" + page + "&size=" + size);
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
          <form onSubmit={searchData} method="post">
            <InputGroup>
              <Form.Control as="select" name="searchField" id="searchField" value={formData.searchField} required onChange={formDataHandler}>
                <option value="employeeName">이름</option>
              </Form.Control>
              <Form.Control className="w-25" type="text" name="searchWord" id="searchWord" value={formData.searchWord} placeholder="입력..." onChange={formDataHandler} required />
              <Button className="basic-button" type="submit">검색</Button>
              <Button className="basic-button mx-3" onClick={(e) => {
                e.preventDefault();
                setPrevSearch({
                  searchField: "employeeName",
                  searchWord: ""
                });
                setFormData({
                  searchField: "employeeName",
                  searchWord: ""
                });
                getData();
              }}> 검색 초기화</Button>
            </InputGroup>
          </form>
          <div>
            <Button className="basic-button" onClick={() => {
              setPrevSearch({
                searchField: "employeeName",
                searchWord: ""
              });
              setFormData({
                searchField: "employeeName",
                searchWord: ""
              })
              props.closeModal();
            }}>닫기</Button>
          </div>
        </div>
        <div className="table-wrap">
          <Table hover bordered className="board-table text-center">
            <thead>
              <tr>
                <th>사번</th>
                <th className="w-50">이름</th>
                <th>선택</th>
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
            setPrevSearch({
              searchField: "employeeName",
              searchWord: ""
            });
            setFormData({
              searchField: "employeeName",
              searchWord: ""
            })
            props.closeModal();
          }}>닫기</Button>
        </div>
      </div>
    </ReactModal >
  </>
  );
}

export default EmpModal;