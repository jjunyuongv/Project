import 'bootstrap/';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Pagination, Spinner } from 'react-bootstrap';
import "../css/MainContentStyle.css";

// count 총 개수
// countPerPage 1페이지마다 보여줄 개수
// pageCount 보여줄 페이지 개수
// NavigatePage는 처음 부터 페이지 관련 변수들을 선언 및 초기화하고 변경되지 않음
// navigate()를 사용해 useParams() 사용하는 곳에서 쓰임
function NavigatePage(props) {
  const totalPage = Math.ceil(props.count / props.pageSize);
  const totalBlock = Math.ceil(totalPage / props.blockSize);
  const curPage = props.curPage;
  const curBlock = Math.floor((props.curPage - 1) / props.blockSize);
  const [pages, setPages] = useState([]);
  const [isEndLoading, setIsEndLoading] = useState(false);
  useEffect(function () {
    setBlock();
  }, []);


  function setBlock() {
    let start = curBlock * props.blockSize;
    let end = curBlock * props.blockSize + props.blockSize;
    if (end > totalPage) {
      end = totalPage;
    }
    let block = [];
    for (let i = start; i < end; i++) {
      if (i > totalPage)
        break;
      block.push(
        <Pagination.Item key={i + 1} onClick={(e) => { props.movePage(e, i + 1); }} className={`page ${curPage === i + 1 ? 'activePage' : ''}`}>
          {i + 1}
        </Pagination.Item>
      )
    }
    setPages(block);
    setIsEndLoading(true);
  }

  // 백엔드에서 데이터 가져오기 전 로딩중인걸 표시
  if (!isEndLoading) {
    return <div className="d-flex justify-content-center"><Spinner animation="border" role="status" /></div>
  }

  return (<>
    <Pagination className="justify-content-center page">
      <Pagination.First onClick={(e) => {
        if (totalPage === 0)
          return;
        props.movePage(e, 1);
      }} />
      <Pagination.Prev onClick={(e) => {
        if (totalPage === 0)
          return;
        if (curBlock - 1 < 0) {
          props.movePage(e, 1,);
        } else {
          props.movePage(e, (curBlock - 1) * props.blockSize + props.blockSize);
        }
      }} />
      {pages}
      <Pagination.Next onClick={(e) => {
        if (totalPage === 0)
          return;
        if (curBlock + 1 >= totalBlock) {
          props.movePage(e, totalPage);
        } else {
          props.movePage(e, (curBlock + 1) * props.blockSize + 1);
        }
      }} />
      <Pagination.Last onClick={(e) => {
        if (totalPage === 0)
          return;
        props.movePage(e, totalPage);
      }} />
    </Pagination>
  </>
  )
}

export default NavigatePage;