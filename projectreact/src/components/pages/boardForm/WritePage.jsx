import React, { useState } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import "./BoardPage.css";

const WritePage = () => {
  const [formData, setFormData] = useState({ title: "", writer: "", content: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("폼 제출:", formData);
  };

  const handleReset = () => setFormData({ title: "", writer: "", content: "" });

  return (
    <Container className="write-container">
      <h2>게시글 작성</h2>
      <Form onSubmit={handleSubmit}>
        <Table className="write-table">
          <tbody>
            <tr>
              <td>제목</td>
              <td>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} />
              </td>
            </tr>
            <tr>
              <td>작성자</td>
              <td>
                <Form.Control type="text" name="writer" value={formData.writer} onChange={handleChange} />
              </td>
            </tr>
            <tr>
              <td>내용</td>
              <td>
                <Form.Control as="textarea" name="content" value={formData.content} onChange={handleChange} />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="button-row">
                <Button type="submit">등록</Button>
                <Button variant="secondary" onClick={handleReset}>
                  초기화
                </Button>
                <Button variant="info">목록</Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Form>
    </Container>
  );
};

export default WritePage;