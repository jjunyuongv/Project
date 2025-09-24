import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";

import ShiftCalendar from "./ShiftCalendar.jsx";
import DayDetailModal from "./DayDetailModal.jsx";
import EventModal from "./EventModal.jsx";

import {
  getEvents as apiGetEvents,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  getMyEvents as apiGetMyEvents,
} from "../../../api/calendar.api.js";

import { useAuth } from "../LoginForm/AuthContext.jsx";

import "./calendars.css";

const CATEGORY_LIST = ["개인일정", "비행일정", "정비일정", "교육일정", "휴가일정"];
const CREW_EMPLOYEE_ID = 1;

/** Date|string -> 'YYYY-MM-DD' */
const toYMD = (input) => {
  const d = input instanceof Date ? input : new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const formatYM = (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;

export default function CalendarsPage() {
  const fcRef = useRef(null);
  const shiftCtrlRef = useRef(null);

  const { user } = useAuth() || {};
  const EMP_ID = user?.employeeId ?? CREW_EMPLOYEE_ID;

  const [calendarType, setCalendarType] = useState("일반"); // '일반' | '교대'
  const [viewType, setViewType] = useState("dayGridMonth");
  const [events, setEvents] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(CATEGORY_LIST);
  const [loading, setLoading] = useState(false);
  const [titleYM, setTitleYM] = useState("");
  const [shiftTitle, setShiftTitle] = useState("");

  // "내 일정만" 토글만 유지 (교대 포함 제거)
  const [showMine, setShowMine] = useState(false);

  // 현재 조회 범위
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  // 모달 상태
  const [detailOpen, setDetailOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create"); // 'create' | 'edit'
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
  const [initialForEdit, setInitialForEdit] = useState(null);

  const isGeneral = calendarType === "일반";

  /* ===== 서버 조회 (FullCalendar 범위에 맞춰) ===== */
  const handleDatesSet = async (arg) => {
    if (!isGeneral) return;

    const start = arg.start;
    const endEx = new Date(arg.end);
    endEx.setDate(endEx.getDate() - 1); // exclusive -> inclusive

    setTitleYM(formatYM(arg.view.currentStart));
    setRangeStart(start);
    setRangeEnd(endEx);

    setLoading(true);
    try {
      const data = showMine
        ? await apiGetMyEvents(toYMD(start), toYMD(endEx), EMP_ID)
        : await apiGetEvents(toYMD(start), toYMD(endEx));
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("일정 로딩 에러:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ===== 상단 컨트롤 ===== */
  const changeView = (v) => {
    if (!isGeneral) return;
    setViewType(v);
    fcRef.current?.getApi().changeView(v);
  };
  const goPrev = () =>
    isGeneral ? fcRef.current?.getApi().prev() : shiftCtrlRef.current?.prev();
  const goNext = () =>
    isGeneral ? fcRef.current?.getApi().next() : shiftCtrlRef.current?.next();
  const goToday = () =>
    isGeneral ? fcRef.current?.getApi().today() : shiftCtrlRef.current?.today();

  /* ===== 카테고리 필터 (프론트) ===== */
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const cat = ev.category || ev.type || ev.kind;
      if (!cat) return true;
      return selectedCategories.includes(cat);
    });
  }, [events, selectedCategories]);

  // DayDetailModal 비교용: start를 'YYYY-MM-DD'로 통일
  const modalEvents = useMemo(
    () =>
      filteredEvents.map((ev) => ({
        ...ev,
        start: toYMD(ev.start),
      })),
    [filteredEvents]
  );

  /* ===== 일반↔교대 전환 시 일반이면 재조회 ===== */
  useEffect(() => {
    if (isGeneral) {
      const api = fcRef.current?.getApi();
      if (!api) return;
      const v = api.view;
      const start = v.activeStart;
      const endEx = new Date(v.activeEnd);
      endEx.setDate(endEx.getDate() - 1);
      setTitleYM(formatYM(v.currentStart));
      setRangeStart(start);
      setRangeEnd(endEx);
      (async () => {
        setLoading(true);
        try {
          const data = showMine
            ? await apiGetMyEvents(toYMD(start), toYMD(endEx), EMP_ID)
            : await apiGetEvents(toYMD(start), toYMD(endEx));
          setEvents(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarType]);

  // "내 일정만" 토글 변경 시 현재 범위 재조회
  useEffect(() => {
    if (!isGeneral || !rangeStart || !rangeEnd) return;
    (async () => {
      setLoading(true);
      try {
        const data = showMine
          ? await apiGetMyEvents(toYMD(rangeStart), toYMD(rangeEnd), EMP_ID)
          : await apiGetEvents(toYMD(rangeStart), toYMD(rangeEnd));
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMine]);

  /* ===== 날짜/이벤트 클릭 → 상세 or 새 일정 ===== */
  const openDetailOrCreate = (dateObj) => {
    const dateStr = toYMD(dateObj);
    setSelectedDate(dateStr);
    const has = modalEvents.some((e) => e.start === dateStr);
    if (has) setDetailOpen(true);
    else {
      setEditorMode("create");
      setInitialForEdit(null);
      setEditorOpen(true);
    }
  };
  const handleDateClick = (info) => openDetailOrCreate(info.date);
  const handleEventClick = (info) => openDetailOrCreate(info.event.start);

  /* ===== 현재 범위 재조회 ===== */
  const refetchRange = async () => {
    if (!rangeStart || !rangeEnd) return;
    setLoading(true);
    try {
      const data = showMine
        ? await apiGetMyEvents(toYMD(rangeStart), toYMD(rangeEnd), EMP_ID)
        : await apiGetEvents(toYMD(rangeStart), toYMD(rangeEnd));
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ===== 생성/수정 저장 ===== */
  const toNumericId = (id) => {
    if (typeof id === "number") return id;
    const m = String(id).match(/^event-(\d+)$/);
    return m ? Number(m[1]) : null; // shift-*는 null
  };

  const handleEditorSubmit = async (data) => {
    try {
      if (data.id) {
        const numeric = toNumericId(data.id);
        if (numeric != null) {
          await apiUpdateEvent(numeric, {
            title: data.title,
            content: data.content,
            startDate: data.startDate,
            endDate: data.endDate,
            category: data.category,
          });
        }
      } else {
        await apiCreateEvent({
          crewEmployeeId: EMP_ID,
          title: data.title,
          content: data.content,
          startDate: data.startDate ?? selectedDate,
          endDate: data.endDate ?? data.startDate ?? selectedDate,
          category: data.category,
        });
      }
    } catch (e) {
      console.error("저장 실패:", e);
    } finally {
      setEditorOpen(false);
      await refetchRange();
    }
  };

  /* ===== 삭제 ===== */
  const handleDelete = async (id) => {
    const numeric = toNumericId(id);
    if (numeric == null) {
      console.warn("삭제 가능한 이벤트 id가 아닙니다:", id);
      return;
    }
    try {
      await apiDeleteEvent(numeric);
    } catch (e) {
      console.error("일정 삭제 실패:", e);
    } finally {
      setDetailOpen(false);
      await refetchRange();
    }
  };

  /* ===== 상세 모달에서 수정 누르면 편집 모달 열기 ===== */
  const handleEditRequest = (eventItem) => {
    setDetailOpen(false);
    setEditorMode("edit");
    setSelectedDate(eventItem.start);
    setInitialForEdit({
      id: eventItem.id,
      title: eventItem.title ?? "",
      category: eventItem.category ?? "개인일정",
      content:
        (eventItem.extendedProps && eventItem.extendedProps.content) || "",
      startDate: eventItem.start,
      endDate: eventItem.end ? toYMD(eventItem.end) : eventItem.start,
    });
    setEditorOpen(true);
  };

  return (
    <div className={`calendar-shell ${isGeneral ? "with-aside" : "single"}`}>
      {/* 좌측: 필터 (일반만) */}
      {isGeneral && (
        <aside className="card filter-card">
          <div className="card-header">
            <h3 className="card-title">필터</h3>
          </div>
          <div className="card-body">
            {/* "내 일정만 보기"만 남김 */}
            <div className="filter-row" style={{ marginBottom: 12 }}>
              <label className="check-row" style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={showMine}
                  onChange={(e) => setShowMine(e.target.checked)}
                />
                <span>내 일정만 보기</span>
              </label>
            </div>

            <ul className="filter-list">
              {CATEGORY_LIST.map((full) => (
                <li key={full}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(full)}
                      onChange={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(full)
                            ? prev.filter((x) => x !== full)
                            : [...prev, full]
                        )
                      }
                    />
                    <span>{full.replace("일정", "")}일정</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* 우측: 캘린더 카드 */}
      <section className="card calendar-card">
        <div className="card-chrome">
          {isGeneral && (
            <div className="left-tabs">
              <button
                className={`seg ${viewType === "dayGridMonth" ? "active" : ""}`}
                onClick={() => changeView("dayGridMonth")}
              >
                월간
              </button>
              <button
                className={`seg ${viewType === "timeGridWeek" ? "active" : ""}`}
                onClick={() => changeView("timeGridWeek")}
              >
                주간
              </button>
              <button
                className={`seg ${viewType === "timeGridDay" ? "active" : ""}`}
                onClick={() => changeView("timeGridDay")}
              >
                일간
              </button>

              <button
                className="btn-green"
                onClick={() => {
                  setEditorMode("create");
                  setSelectedDate(toYMD(new Date()));
                  setInitialForEdit(null);
                  setEditorOpen(true);
                }}
              >
                + 새 일정
              </button>
            </div>
          )}

          {/* 일반/교대 토글 우측 정렬 */}
          <div className="right-type" style={{ marginLeft: "auto" }}>
            <div className="pill-toggle" role="tablist" aria-label="달력 종류">
              <button
                role="tab"
                aria-selected={isGeneral}
                className={`pill ${isGeneral ? "active" : ""}`}
                onClick={() => setCalendarType("일반")}
              >
                일반
              </button>
              <button
                role="tab"
                aria-selected={!isGeneral}
                className={`pill ${!isGeneral ? "active" : ""}`}
                onClick={() => setCalendarType("교대")}
              >
                교대
              </button>
            </div>
          </div>
        </div>

        {/* 제목 + 내비 */}
        <div className="card-subheader">
          <h2 className="calendar-title">
            {isGeneral ? titleYM || " " : shiftTitle || " "}
          </h2>
          <div className="nav-pack">
            <button className="square" onClick={goPrev} aria-label="이전">
              &lt;
            </button>
            <button className="square" onClick={goToday}>
              오늘
            </button>
            <button className="square" onClick={goNext} aria-label="다음">
              &gt;
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="card-body calendar-body">
          {isGeneral ? (
            <>
              {loading && <div className="loading">불러오는 중...</div>}
              <FullCalendar
                ref={fcRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={koLocale}
                initialView={viewType}
                headerToolbar={false}
                events={filteredEvents}
                dayMaxEventRows={2}
                height="auto"
                contentHeight="auto"
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                  hour12: false,
                }}
              />
            </>
          ) : (
            <ShiftCalendar
              controlsRef={shiftCtrlRef}
              onMonthTitleChange={(txt) => setShiftTitle(txt)}
            />
          )}
        </div>
      </section>

      {/* 상세 모달 */}
      <DayDetailModal
        show={detailOpen}
        handleClose={() => setDetailOpen(false)}
        selectedDate={selectedDate}
        events={modalEvents}
        onAddEvent={(dateStr) => {
          setSelectedDate(dateStr);
          setDetailOpen(false);
          setEditorMode("create");
          setInitialForEdit(null);
          setEditorOpen(true);
        }}
        onEdit={handleEditRequest}
        onDelete={handleDelete}
      />

      {/* 생성/수정 모달 */}
      {editorOpen && (
        <EventModal
          mode={editorMode}
          selectedDate={selectedDate}
          initialValues={initialForEdit}
          closeModal={() => setEditorOpen(false)}
          onSubmit={handleEditorSubmit}
        />
      )}
    </div>
  );
}
