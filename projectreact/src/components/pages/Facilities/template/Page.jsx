import 'bootstrap/';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';
import "../css/MainContentStyle.css";

// count 총 개수
// countPerPage 1페이지마다 보여줄 개수
// pageCount 보여줄 페이지 개수
function Page(props) {
  const [totalPage, setTotalPage] = useState(Math.ceil(props.count / props.pageSize));
  const [totalBlock, setTotalBlock] = useState(Math.ceil(totalPage / props.blockSize));
  const [curPage, setCurPage] = useState(1);
  const [curBlock, setCurBlock] = useState(0);
  const [pages, setPages] = useState([]);

  useEffect(function () {
    setBlock(curBlock * props.blockSize);
  }, [curPage]);

  useEffect(function () {
    setBlockChangeTotalCount(0, Math.ceil(props.count / props.pageSize));
    setTotalPage(Math.ceil(props.count / props.pageSize));
    setTotalBlock(Math.ceil(Math.ceil(props.count / props.pageSize) / props.blockSize));
    setCurBlock(0);
    setCurPage(1);
    
  }, [props.count])

  function setBlockChangeTotalCount(start, totalPage) {
    let end = start + props.blockSize;
    if (start + props.blockSize > totalPage) {
      end = totalPage;
    }

    let block = [];
    for (let i = start; i < end; i++) {
      if (i > totalPage)
        break;
      block.push(
        <Pagination.Item key={i + 1} onClick={(e) => { props.movePage(e, i + 1, props.pageSize); setCurPage(i + 1); }} className={`page ${curPage === i + 1 ? 'activePage' : ''}`}>
          {i + 1}
        </Pagination.Item>
      )
    }
    setPages(block);
  }

  function setBlock(start) {
    let end = start + props.blockSize;
    if (start + props.blockSize > totalPage) {
      end = totalPage;
    }

    let block = [];
    for (let i = start; i < end; i++) {
      if (i > totalPage)
        break;
      block.push(
        <Pagination.Item key={i + 1} onClick={(e) => { props.movePage(e, i + 1, props.pageSize); setCurPage(i + 1) }} className={`page ${curPage === i + 1 ? 'activePage' : ''}`}>
          {i + 1}
        </Pagination.Item>
      )
    }
    setPages(block);
  }

  return (<>
    <Pagination className="justify-content-center page">
      <Pagination.First onClick={(e) => {
        if (totalPage === 0)
          return;
        props.movePage(e, 1, props.pageSize); setCurPage(1); setCurBlock(0);
      }} />
      <Pagination.Prev onClick={(e) => {
        if (totalPage === 0)
          return;
        if (curBlock - 1 < 0) {
          props.movePage(e, 1, props.pageSize);
          setCurPage(1);
        } else {
          setCurBlock(curBlock - 1);
          setCurPage((curBlock - 1) * props.blockSize + props.blockSize);
          props.movePage(e, (curBlock - 1) * props.blockSize + props.blockSize, props.pageSize);
        }
      }} />
      {pages}
      <Pagination.Next onClick={(e) => {
        if (totalPage === 0)
          return;
        if (curBlock + 1 >= totalBlock) {
          props.movePage(e, totalPage, props.pageSize);
          setCurPage(totalPage);
        } else {
          setCurBlock(curBlock + 1);
          setCurPage((curBlock + 1) * props.blockSize + 1);
          props.movePage(e, (curBlock + 1) * props.blockSize + 1, props.pageSize);
        }
      }} />
      <Pagination.Last onClick={(e) => {
        if (totalPage === 0)
          return;
        props.movePage(e, totalPage, props.pageSize); setCurBlock(totalBlock - 1); setCurPage(totalPage);
      }}
      />
    </Pagination>
  </>
  )
}

export default Page;