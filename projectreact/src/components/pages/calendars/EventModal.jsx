import React, { useEffect, useState } from "react";
import "./eventModal.css"; // 중앙 모달/딤드 스타일

/**
 * props:
 * - mode: 'create' | 'edit'
 * - selectedDate: 'YYYY-MM-DD' (기본 선택 날짜)
 * - initialValues: { id, title, category, content, startDate, endDate } | null
 * - onSubmit: (data) => void  // data: { id?, title, category, content, startDate, endDate }
 * - closeModal: () => void
 */
const EventModal = ({ mode = "create", selectedDate, initialValues, onSubmit, closeModal }) => {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("개인일정");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);

  useEffect(() => {
    if (isEdit && initialValues) {
      setTitle(initialValues.title ?? "");
      setCategory(initialValues.category ?? "개인일정");
      setContent(initialValues.content ?? "");
      setStartDate(initialValues.startDate ?? selectedDate);
      setEndDate(initialValues.endDate ?? initialValues.startDate ?? selectedDate);
    } else {
      setTitle("");
      setCategory("개인일정");
      setContent("");
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  }, [isEdit, initialValues, selectedDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit?.({
      id: initialValues?.id,
      title: title.trim(),
      category,
      content,
      startDate,
      endDate,
    });
    // close는 부모에서 처리(성공/실패 후 재조회)
  };

  return (
    <div className="event-backdrop" role="presentation" onClick={closeModal}>
      <div
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-modal-header">
          <h2 id="event-modal-title" className="modal-title">
            {isEdit ? "일정 수정" : `${selectedDate} - 일정 추가`}
          </h2>
          <button className="x-btn" onClick={closeModal} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목"
            />
          </div>

          <div className="form-group">
            <label>분류</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="개인일정">개인일정</option>
              <option value="비행일정">비행일정</option>
              <option value="정비일정">정비일정</option>
              <option value="교육일정">교육일정</option>
              <option value="휴가일정">휴가일정</option>
            </select>
          </div>

          <div className="form-group">
            <label>시작일</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>종료일</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용"
            />
          </div>
        </div>

        <div className="event-modal-footer">
          <button className="save" onClick={handleSubmit}>{isEdit ? "수정 저장" : "저장"}</button>
          <button className="cancel" onClick={closeModal}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
