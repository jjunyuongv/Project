import React, { useEffect, useState } from "react";
import ShiftMemoModal from "./ShiftMemoModal.jsx";
import {
  listShiftMemos,
  upsertShiftMemo,
  deleteShiftMemo,
} from "../../../api/shiftMemos.api.js";
import "./shiftCalendar.css";

const SHIFT_SEQUENCE = [
  "오전","오전","오전","오전","오전","오전",
  "휴무","휴무",
  "오후","오후","오후","오후","오후","오후",
  "휴무","휴무",
  "야간","야간","야간","야간","야간","야간",
  "휴무","휴무",
];
const TEAMS = ["A조", "B조", "C조", "D조"];
const TEAM_OFFSETS = [0, 6, 12, 18];
const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 로그인 사용자 ID로 교체(필요하면 props로 받도록 바꿔도 됨)
const EMPLOYEE_ID = 1;

const toYYYYMMDD = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const firstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const lastDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const getDayOfYear = (date) => {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff =
    date - startDate +
    (startDate.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
};

export default function ShiftCalendar({ controlsRef, onMonthTitleChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 서버에서 가져온 메모를 맵으로 보관: key = 'YYYY-MM-DD-TEAM'
  const [memosMap, setMemosMap] = useState({}); // { key: { memoId, content } }
  const [loading, setLoading] = useState(false);

  // 메모 모달
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { date:'YYYY-MM-DD', team:'A조' }

  // 상단 타이틀(부모 카드 제목) 동기화
  useEffect(() => {
    onMonthTitleChange?.(
      new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(currentDate)
    );
  }, [currentDate, onMonthTitleChange]);

  // 부모 내비게이션 버튼(prev/next/오늘)과 연결
  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      prev: () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)),
      next: () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)),
      today: () => setCurrentDate(new Date()),
    };
    return () => {
      if (controlsRef) controlsRef.current = null;
    };
  }, [controlsRef]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 월 변경 시 서버에서 메모 조회
  useEffect(() => {
    const start = toYYYYMMDD(firstDayOfMonth(currentDate));
    const end = toYYYYMMDD(lastDayOfMonth(currentDate));
    (async () => {
      setLoading(true);
      try {
        const list = await listShiftMemos({ employeeId: EMPLOYEE_ID, start, end });
        const map = {};
        for (const it of list) {
          const key = `${it.memoDate}-${it.teamName}`;
          map[key] = { memoId: it.memoId, content: it.content };
        }
        setMemosMap(map);
      } catch (e) {
        console.error("교대 메모 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentDate]);

  const getShift = (day, teamIndex) => {
    if (!day) return null;
    const date = new Date(year, month, day);
    const idx = (getDayOfYear(date) + TEAM_OFFSETS[teamIndex]) % SHIFT_SEQUENCE.length;
    return SHIFT_SEQUENCE[idx];
  };

  const handleDayClick = (day, team) => {
    if (!day) return;
    const dateString = toYYYYMMDD(new Date(year, month, day));
    setSelectedCell({ date: dateString, team });
    setShowMemoModal(true);
  };
  const handleCloseMemoModal = () => setShowMemoModal(false);

  // 저장/업서트
  const handleSaveMemo = async (cell, text) => {
    try {
      const saved = await upsertShiftMemo({
        employeeId: EMPLOYEE_ID,
        memoDate: cell.date,
        teamName: cell.team,
        content: text || "",
      });
      const key = `${saved.memoDate}-${saved.teamName}`;
      setMemosMap((prev) => ({ ...prev, [key]: { memoId: saved.memoId, content: saved.content } }));
    } catch (e) {
      console.error("메모 저장 실패:", e);
      alert("메모 저장 중 오류가 발생했습니다.");
    } finally {
      handleCloseMemoModal();
    }
  };

  // 삭제
  const handleDeleteMemo = async (cell) => {
    const key = `${cell.date}-${cell.team}`;
    const target = memosMap[key];
    if (!target?.memoId) {
      handleCloseMemoModal();
      return;
    }
    try {
      await deleteShiftMemo(target.memoId);
      setMemosMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (e) {
      console.error("메모 삭제 실패:", e);
      alert("메모 삭제 중 오류가 발생했습니다.");
    } finally {
      handleCloseMemoModal();
    }
  };

  return (
    <div className="shift-pattern-calendar">
      {loading && <div className="shift-loading">메모 불러오는 중...</div>}

      <table className="shift-table">
        <thead>
          <tr>
            <th className="team-name">구분</th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const dow = date.getDay();
              const isWeekend = dow === 0 || dow === 6;
              return (
                <th key={`h-${day}`} className={isWeekend ? "weekend" : ""}>
                  <div className="header-day-number">{day}</div>
                  <div className="header-day-label">{DAYS_OF_WEEK[dow]}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {TEAMS.map((team, teamIndex) => (
            <tr key={team}>
              <td className="team-name">{team}</td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const shift = getShift(day, teamIndex);
                const dateString = toYYYYMMDD(new Date(year, month, day));
                const key = `${dateString}-${team}`;
                const hasMemo = !!memosMap[key];

                return (
                  <td
                    key={`${team}-${day}`}
                    className={`shift-cell shift-${shift}`}
                    onClick={() => handleDayClick(day, team)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleDayClick(day, team);
                    }}
                    title={hasMemo ? memosMap[key].content : ""}
                  >
                    <div className="shift-code">{shift}</div>

                    {/* 메모가 있으면 체크 배지 표시 (모양/색은 CSS .shift-memo-badge에서 제어) */}
                    {hasMemo && <div className="shift-memo-badge" aria-label="메모 있음" />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ShiftMemoModal
        show={showMemoModal}
        handleClose={handleCloseMemoModal}
        handleSave={handleSaveMemo}
        handleDelete={handleDeleteMemo}
        selectedCell={selectedCell}
        existingMemo={
          selectedCell
            ? memosMap[`${selectedCell.date}-${selectedCell.team}`]?.content || ""
            : ""
        }
      />
    </div>
  );
}
