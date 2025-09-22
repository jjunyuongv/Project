// src/api/shiftMemos.api.js
import api from "./axios"; // baseURL: "/api" 또는 "http://localhost:8081/api"

export const listShiftMemos = async ({ employeeId, start, end, team }) => {
  const { data } = await api.get("/shift-memos", {
    params: { employeeId, start, end, team },
  });
  return data;
};

export const upsertShiftMemo = async ({ employeeId, memoDate, teamName, content }) => {
  const { data } = await api.post("/shift-memos", {
    employeeId, memoDate, teamName, content,
  });
  return data;
};

export const deleteShiftMemo = async (memoId) => {
  await api.delete(`/shift-memos/${memoId}`);
};
