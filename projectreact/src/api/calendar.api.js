// calendar.api.js
import api from "./axios"; // baseURL가 무엇이든 동작하도록 절대경로 사용

// ---- 유틸: Date -> 'YYYY-MM-DD' ----
const toYMD = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 일정 불러오기 (쿼리 파라미터 start, end: 'YYYY-MM-DD')
export const getEvents = async (start, end) => {
  try {
    const res = await api.get("/api/calendars", {
      params: { start, end }, // 필요시 toYMD(start), toYMD(end)
    });
    return res.data;
  } catch (error) {
    console.error("이벤트 불러오기 실패", error);
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "서버 오류";
    throw new Error(msg);
  }
};

// 일정 생성 (CalendarDTO.CreateEventRequest)
export const createEvent = async (eventData) => {
  try {
    const body = {
      crewEmployeeId: eventData.crewEmployeeId,
      title: eventData.title,
      content: eventData.content ?? "",
      startDate: eventData.startDate, // 'YYYY-MM-DD'
      endDate: eventData.endDate ?? null,
      category: eventData.category,
    };
    const res = await api.post("/api/calendars/events", body);
    return res.data;
  } catch (error) {
    console.error("일정 생성 실패", error);
    const msg = error.response?.data?.message || error.message || "일정 생성 오류";
    throw new Error(msg);
  }
};

// 일정 수정 (CalendarDTO.UpdateEventRequest)
export const updateEvent = async (id, eventData) => {
  try {
    const body = {
      title: eventData.title ?? null,
      content: eventData.content ?? null,
      startDate: eventData.startDate ?? null,
      endDate: eventData.endDate ?? null,
      category: eventData.category ?? null,
    };
    const res = await api.put(`/api/calendars/events/${id}`, body);
    return res.data;
  } catch (error) {
    console.error("일정 수정 실패", error);
    const msg = error.response?.data?.message || error.message || "일정 수정 오류";
    throw new Error(msg);
  }
};

// 일정 삭제
export const deleteEvent = async (id) => {
  try {
    const res = await api.delete(`/api/calendars/events/${id}`);
    return res.data;
  } catch (error) {
    console.error("일정 삭제 실패", error);
    const msg = error.response?.data?.message || error.message || "일정 삭제 오류";
    throw new Error(msg);
  }
};
