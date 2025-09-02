import React from "react";
import { Container, Table, Button } from "react-bootstrap";
import "./BoardPage.css";

const ViewPage = () => {
  const board = {
    title: "게시글 제목",
    writer: "홍길동",
    date: "2025-08-14",
    content: "게시글 내용이 여기에 표시됩니다.",
  };

  return (
    <Container className="view-container">
      <h2>게시글 보기</h2>
      <Table className="view-table">
        <tbody>
          <tr>
            <td>제목</td>
            <td>{board.title}</td>
          </tr>
          <tr>
            <td>작성자</td>
            <td>{board.writer}</td>
          </tr>
          <tr>
            <td>작성일</td>
            <td>{board.date}</td>
          </tr>
          <tr>
            <td>내용</td>
            <td style={{ whiteSpace: "pre-wrap" }}>{board.content}</td>
          </tr>
          <tr>
            <td colSpan="2" className="button-row">
              <div class="d-flex gap-3">
              <Button variant="primary">수정</Button>
              <Button variant="secondary">삭제</Button>
              <Button variant="info">목록</Button>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default ViewPage;