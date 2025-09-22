import React, { useState, useEffect } from 'react';
import './shiftMemoModal.css';

function ShiftMemoModal({ show, handleClose, handleSave, handleDelete, selectedCell, existingMemo }) {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (show) {
      setText(existingMemo || '');
      setIsEditing(!existingMemo);
    }
  }, [show, existingMemo]);

  const onSave = () => {
    handleSave(selectedCell, text);
  };
  
  const onDelete = () => {
    handleDelete(selectedCell);
  };

  const handleEnterEditMode = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setText(existingMemo || '');
    if (!existingMemo) {
      handleClose();
    } else {
      setIsEditing(false);
    }
  };
  
  const formatModalDate = (cell) => {
    if (!cell) return '';
    const date = new Date(cell.date + 'T00:00:00');
    const dateString = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    return `${dateString} (${cell.team})`;
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content shift-memo-modal">
        <div className="memo-modal-header">
          <h2>{formatModalDate(selectedCell)}</h2>
        </div>
        
        <div className="memo-modal-body">
          {isEditing ? (
            <div className="form-group">
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="메모를 입력하세요..." 
                rows="5"
                autoFocus
              />
            </div>
          ) : (
            <div className="memo-view-content">
              {text ? <p>{text}</p> : <p className="no-memo-text">작성된 메모가 없습니다.</p>}
            </div>
          )}
        </div>

        <div className="modal-actions">
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} className="cancel-btn">취소</button>
              <button onClick={onSave} className="save-btn">저장</button>
            </>
          ) : (
            <>
              {text && <button onClick={onDelete} className="delete-btn">삭제</button>}
              <div style={{ flexGrow: 1 }} />
              <button onClick={handleEnterEditMode} className="edit-btn">수정</button>
              <button onClick={handleClose} className="cancel-btn">닫기</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default ShiftMemoModal;