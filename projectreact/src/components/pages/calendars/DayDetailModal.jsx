import React from "react";
import "./dayDetailModal.css";

const categoryColors = {
  "개인일정": "#ef4444",
  "비행일정": "#4ecdc4",
  "정비일정": "#45b7d1",
  "교육일정": "#f093fb",
  "휴가일정": "#ff6b6b",
};

const formatDetailDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const options = { month: "long", day: "numeric", weekday: "short" };
  return new Intl.DateTimeFormat("ko-KR", options).format(date);
};

function DayDetailModal({
  show,
  handleClose,
  selectedDate,     // 'YYYY-MM-DD'
  events,           // [{ id, title, category, start: 'YYYY-MM-DD', extendedProps?... }]
  onAddEvent,
  onEdit,           // (eventItem) => void
  onDelete,         // (id) => void
}) {
  if (!show) return null;

  const eventsForDay = (events || []).filter((e) => e.start === selectedDate);

  return (
    <div className="modal-backdrop day-detail-modal" onClick={handleClose}>
      <div className="modal-content modal-theme" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{formatDetailDate(selectedDate)}</h2>
        </div>

        {eventsForDay.length > 0 ? (
          <ul className="day-detail-list">
            {eventsForDay.map((event) => (
              <li key={event.id} className="day-detail-item">
                <span
                  className="category-dot"
                  style={{ backgroundColor: categoryColors[event.category] || "#6c757d" }}
                />
                <div className="day-detail-meta">
                  <span className="day-detail-title">{event.title}</span>
                  <span className="day-detail-cat">{event.category}</span>
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    className="btn ghost"
                    onClick={() => onEdit?.(event)}
                  >
                    수정
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (window.confirm("이 일정을 삭제할까요?")) {
                        onDelete?.(event.id);
                      }
                    }}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-events">
            <p>등록된 일정이 없습니다.</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn primary" onClick={() => onAddEvent?.(selectedDate)}>
            + 일정 추가
          </button>
          <button className="btn ghost" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default DayDetailModal;
