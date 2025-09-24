// ChatMain.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./chat.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../LoginForm/AuthContext";

/* =============================== */
/* ======== 공통 fetch 헬퍼 ======== */
/* =============================== */
// 쿠키에서 CSRF 토큰 꺼내기
function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];
}
// localStorage.me에서 사번 추출
function extractEmpIdFromLocalStorage() {
  try {
    const me = JSON.parse(localStorage.getItem("me") || "null");
    const candidates = [
      me?.employeeId, me?.employee_id, me?.empId, me?.emp_id,
      me?.userId, me?.user_id, me?.id,
      me?.member?.employeeId, me?.employee?.employeeId,
    ];
    for (const c of candidates) {
      if (c == null) continue;
      const digits = String(c).match(/\d+/g)?.join("") ?? "";
      if (digits) return digits;
    }
    return null;
  } catch {
    return null;
  }
}
// 공통 fetch: 쿠키 포함 + CSRF + X-Employee-Id 자동 주입
async function apiFetch(url, init = {}) {
  const headers = new Headers(init.headers || { Accept: "application/json" });

  // CSRF
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
  }
  // 사번 헤더
  if (!headers.has("X-Employee-Id")) {
    const emp = extractEmpIdFromLocalStorage();
    if (emp) headers.set("X-Employee-Id", emp);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    // 에러 본문을 최대한 살려서 던짐
    let msg = `${res.status} ${res.statusText}`.trim();
    try {
      const t = await res.text();
      if (t) msg = t;
    } catch {}
    throw new Error(msg);
  }
  return res;
}
// JSON 바로 파싱
async function apiJson(url, init = {}) {
  const r = await apiFetch(url, init);
  try {
    return await r.json();
  } catch {
    return null;
  }
}

/* =============================== */
/* ========== REST API =========== */
/* =============================== */
async function apiCreateDirectRoom(meId, otherId) {
  return apiJson(`/api/chat/rooms/direct?userA=${meId}&userB=${otherId}`, {
    method: "POST",
  });
}
async function apiCreateGroupRoom({ name, memberIds }) {
  return apiJson(`/api/chat/rooms/group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, memberIds }),
  });
}
async function apiGetMyRooms(meId) {
  return apiJson(`/api/chat/rooms/my?me=${meId}`);
}
async function apiGetMessages(roomId, { beforeId = null, size = 50 } = {}) {
  const qs = new URLSearchParams();
  if (beforeId) qs.set("beforeId", String(beforeId));
  if (size) qs.set("size", String(size));
  return apiJson(`/api/chat/rooms/${roomId}/messages?${qs.toString()}`);
}
async function apiLeaveRoom(roomId, meId) {
  return apiJson(`/api/chat/rooms/${roomId}/leave?me=${meId}`, {
    method: "DELETE",
  });
}
async function apiInviteMembers(roomId, memberIds) {
  return apiJson(`/api/chat/rooms/${roomId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberIds }),
  });
}
async function apiJoinRoom(roomId, meId) {
  return apiJson(`/api/chat/rooms/${roomId}/join?me=${meId}`, {
    method: "POST",
  });
}

/* 🔹 직원 이름 조회 (없으면 null) */
async function apiGetEmployeeName(userId) {
  try {
    const data = await apiJson(`/api/employees/${userId}`);
    return data?.employeeName ?? data?.name ?? data?.fullName ?? null;
  } catch {
    return null;
  }
}

/* =============================== */
/* ======== 작은 UI 컴포넌트 ======== */
/* =============================== */
function Icon({ name, size = 20, className = "" }) {
  const sz = { width: size, height: size };
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" fill="none" style={sz} className={className}>
          <circle cx="11" cy="11" r="7" strokeWidth="1.5" stroke="currentColor" />
          <path d="M20 20l-3-3" strokeWidth="1.5" stroke="currentColor" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" fill="none" style={sz} className={className}>
          <path d="M12 20h9" strokeWidth="1.5" stroke="currentColor" />
          <path
            d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
            strokeWidth="1.5"
            stroke="currentColor"
          />
        </svg>
      );
    case "send":
      return (
        <svg viewBox="0 0 24 24" fill="none" style={sz} className={className}>
          <path d="M22 2 11 13" strokeWidth="1.5" stroke="currentColor" />
          <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeWidth="1.5" stroke="currentColor" />
        </svg>
      );
    case "userPlus":
      return (
        <svg viewBox="0 0 24 24" fill="none" style={sz} className={className}>
          <path d="M15 19a6 6 0 1 0-12 0" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}
function Avatar({ variant = "user", size = 40 }) {
  const st = { width: size, height: size };
  const sz = { width: Math.floor(size * 0.55), height: Math.floor(size * 0.55) };
  return (
    <div className={`dm-avatar ${variant === "group" ? "dm-avatar--group" : "dm-avatar--user"}`} style={st}>
      {variant === "group" ? (
        <svg viewBox="0 0 24 24" fill="none" style={sz}>
          <path d="M16 21a6 6 0 1 0-12 0" stroke="#fff" strokeWidth="1.7" />
          <circle cx="10" cy="7" r="4" stroke="#fff" strokeWidth="1.7" />
          <path d="M19.5 9.5a3.5 3.5 0 1 1-2.7-5.8" stroke="#fff" strokeWidth="1.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" style={sz}>
          <path d="M18 20a6 6 0 1 0-12 0" stroke="#fff" strokeWidth="1.7" />
          <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.7" />
        </svg>
      )}
    </div>
  );
}
function MessageBubble({ who, text, at }) {
  const isMe = who === "me";
  return (
    <div className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}>
      <div className="dm-bubble shadow-sm border">
        <p className="text-break mb-1">{text}</p>
        <div className="small text-secondary">{formatTime(at)}</div>
      </div>
    </div>
  );
}
function formatTime(iso) {
  try {
    const d = new Date(iso);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ap = h < 12 ? "오전" : "오후";
    const hh = h % 12 || 12;
    return `${ap} ${hh}:${m}`;
  } catch {
    return "";
  }
}

/* =============================== */
/* ======= 방 만들기 모달 ========= */
/* =============================== */
function CreateRoomModal({ open, onClose, onCreated, meId }) {
  const [type, setType] = useState("DIRECT");
  const [directOther, setDirectOther] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");

  async function onSubmit(e) {
    e?.preventDefault?.();
    try {
      if (type === "DIRECT") {
        const otherId = Number(directOther);
        if (!otherId || Number.isNaN(otherId)) return;
        const r = await apiCreateDirectRoom(meId, otherId);
        onCreated({ kind: "DIRECT", data: r, fallbackPeer: otherId });
      } else {
        const ids = groupMembers
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !!n && !Number.isNaN(n));
        if (meId && !ids.includes(meId)) ids.push(meId);
        const r = await apiCreateGroupRoom({ name: groupName || "그룹 채팅방", memberIds: ids });
        onCreated({ kind: "GROUP", data: r });
      }
      onClose();
      setDirectOther("");
      setGroupName("");
      setGroupMembers("");
      setType("DIRECT");
    } catch (err) {
      console.error("create room failed", err);
    }
  }

  if (!open) return null;
  return (
    <div className="dm-modal-backdrop">
      <div className="dm-modal-panel">
        <div className="card shadow">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>방 만들기</strong>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              닫기
            </button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="card-body d-flex flex-column gap-3">
              <div className="btn-group" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="rtype"
                  id="rtype1"
                  checked={type === "DIRECT"}
                  onChange={() => setType("DIRECT")}
                />
                <label className="btn btn-outline-primary" htmlFor="rtype1">
                  1:1
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="rtype"
                  id="rtype2"
                  checked={type === "GROUP"}
                  onChange={() => setType("GROUP")}
                />
                <label className="btn btn-outline-primary" htmlFor="rtype2">
                  그룹
                </label>
              </div>

              {type === "DIRECT" ? (
                <div className="d-flex flex-column gap-2">
                  <label className="form-label mb-0">상대 사용자 ID</label>
                  <input
                    className="form-control"
                    value={directOther}
                    onChange={(e) => setDirectOther(e.target.value)}
                    placeholder="예) 2002"
                  />
                </div>
              ) : (
                <>
                  <div className="d-flex flex-column gap-2">
                    <label className="form-label mb-0">방 이름</label>
                    <input
                      className="form-control"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="예) 프로젝트 A"
                    />
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <label className="form-label mb-0">멤버 IDs (쉼표로 구분)</label>
                    <input
                      className="form-control"
                      value={groupMembers}
                      onChange={(e) => setGroupMembers(e.target.value)}
                      placeholder="예) 2002,3003"
                    />
                    <div className="form-text">본인(me)은 자동 포함됩니다.</div>
                  </div>
                </>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                만들기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =============================== */
/* =========== 유틸 ============== */
/* =============================== */
/** roomId 기준으로 중복 제거 (마지막 항목 우선) */
function dedupeRoomsById(list) {
  const map = new Map();
  for (const r of list) map.set(r.roomId, { ...map.get(r.roomId), ...r });
  return Array.from(map.values());
}

/* =============================== */
/* =========== 메 인 ============= */
/* =============================== */
export default function ChatMain() {
  const { user, isLoggedIn } = useAuth();

  /* 로그인한 사용자 ID */
  const [meId, setMeId] = useState(null);
  const meIdRef = useRef(null);
  useEffect(() => {
    meIdRef.current = meId;
  }, [meId]);

  /* 좌측 목록/검색/선택 */
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const activeRoomIdRef = useRef(null);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  /* 메시지 */
  const [messages, setMessages] = useState([]);
  const msgIdsRef = useRef(new Set());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgRef = useRef(null);

  /* 방 만들기 모달 */
  const [showCreate, setShowCreate] = useState(false);

  /* 미읽음 카운트 */
  const [unread, setUnread] = useState({});
  const unreadRef = useRef(unread);
  useEffect(() => {
    unreadRef.current = unread;
  }, [unread]);
  function incUnread(roomId) {
    setUnread((prev) => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }));
  }
  function clearUnread(roomId) {
    setUnread((prev) => {
      if (!prev[roomId]) return prev;
      const n = { ...prev };
      delete n[roomId];
      return n;
    });
  }

  /* 토스트 */
  const [toasts, setToasts] = useState([]);
  function pushToast(title, message) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((ts) => [...ts, { id, title, message }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4500);
  }

  /* STOMP */
  const stompRef = useRef(null);
  const roomSubRef = useRef(null);
  const userSubRef = useRef(null);

  /* 로그인 상태에만 meId 세팅 */
  useEffect(() => {
    if (isLoggedIn && user?.employeeId) {
      setMeId(Number(user.employeeId));
    } else {
      setMeId(null);
    }
  }, [isLoggedIn, user]);

  /* 방 목록 로딩 */
  async function reloadRooms(currentMe) {
    const list = await apiGetMyRooms(currentMe);

    const previews = await Promise.all(
      list.map(async ({ roomId, peerId, peerName, name, type }) => {
        try {
          // 1) DIRECT인데 peerName이 비어 있으면 employee_name 보강
          let resolvedPeerName = peerName;
          if (type === "DIRECT" && peerId && (!resolvedPeerName || !String(resolvedPeerName).trim())) {
            const found = await apiGetEmployeeName(peerId);
            if (found) resolvedPeerName = found;
          }

          // 2) 마지막 메시지 프리뷰
          const arr = await apiGetMessages(roomId, { size: 1 });
          const last = arr[0];

          return {
            roomId,
            peerId,
            peerName: resolvedPeerName ?? null,
            name,   // 그룹은 생성 이름 사용
            type,
            lastText: last?.content ?? "",
            lastTime: last?.time ?? null,
          };
        } catch (e) {
          console.error("preview load fail:", e);
          return { roomId, peerId, peerName, name, type };
        }
      })
    );

    const uniq = dedupeRoomsById(previews);
    setRooms(uniq);
    if (uniq.length && !uniq.some((p) => p.roomId === activeRoomIdRef.current)) {
      setActiveRoomId(uniq[0].roomId);
    }
  }

  /* meId가 준비되면 방 목록 로드 */
  useEffect(() => {
    if (!meId) return;
    reloadRooms(meId).catch((e) => console.error("reloadRooms error:", e));
  }, [meId]);

  /* 방 채널 구독 */
  function subscribeRoom(roomId) {
    if (!stompRef.current || !stompRef.current.connected || !roomId) return;
    roomSubRef.current?.unsubscribe();

    roomSubRef.current = stompRef.current.subscribe(`/topic/rooms/${roomId}`, (frame) => {
      const msg = JSON.parse(frame.body);

      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.roomId === roomId ? { ...r, lastText: msg.content, lastTime: msg.time } : r
        )
      );

      if (roomId === activeRoomIdRef.current) {
        if (!msgIdsRef.current.has(msg.id)) {
          msgIdsRef.current.add(msg.id);
          setMessages((prev) => [...prev, msg]);
        }
        clearUnread(roomId);
        const sc = msgRef.current;
        if (sc) sc.scrollTop = sc.scrollHeight + 999;
      }
    });
  }

  /* 사용자 알림 채널 구독 */
  function subscribeUserAlerts(uid) {
    if (!stompRef.current || !stompRef.current.connected || !uid) return;
    userSubRef.current?.unsubscribe();

    userSubRef.current = stompRef.current.subscribe(`/topic/users/${uid}/alerts`, async (frame) => {
      const alert = JSON.parse(frame.body); // {type, roomId, fromUserId, preview, time}

      if (alert.type === "NEW_MESSAGE") {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomId === alert.roomId ? { ...r, lastText: alert.preview ?? "", lastTime: alert.time } : r
          )
        );

        if (activeRoomIdRef.current !== alert.roomId && alert.fromUserId !== uid) {
          incUnread(alert.roomId);
          pushToast("새 메시지", alert.preview ?? "");
        }

        try {
          await reloadRooms(uid);
        } catch (e) {
          console.error(e);
        }
      } else if (alert.type === "INVITED") {
        setRooms((prev) => {
          if (prev.some((r) => r.roomId === alert.roomId)) return prev;
          const title = alert.preview || `그룹 ${alert.roomId}`;
          const next = [
            {
              roomId: alert.roomId,
              peerId: null,
              peerName: null,
              name: title,           // 그룹 방 제목 = 생성 시 이름
              type: "GROUP",
              lastText: "",
              lastTime: alert.time,
            },
            ...prev,
          ];
          return dedupeRoomsById(next);
        });
        incUnread(alert.roomId);
        pushToast("그룹 초대", alert.preview || `방 #${alert.roomId}에 초대되었습니다.`);
      } else if (alert.type === "ROOM_DELETED") {
        setRooms((prev) => prev.filter((r) => r.roomId !== alert.roomId));
        if (activeRoomIdRef.current === alert.roomId) {
          setActiveRoomId(null);
          setMessages([]);
          msgIdsRef.current.clear();
        }
        pushToast("방 삭제됨", `방 #${alert.roomId}이(가) 삭제되었습니다.`);
      }
    });
  }

  /* STOMP 연결 */
  useEffect(() => {
    if (!isLoggedIn) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-chat"),
      reconnectDelay: 2000,
      onConnect: () => {
        const rid = activeRoomIdRef.current;
        if (rid) subscribeRoom(rid);
        if (meIdRef.current) subscribeUserAlerts(meIdRef.current);
      },
    });
    client.activate();
    stompRef.current = client;

    const onFocus = () => {
      if (activeRoomIdRef.current) clearUnread(activeRoomIdRef.current);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      roomSubRef.current?.unsubscribe();
      userSubRef.current?.unsubscribe();
      client.deactivate();
      window.removeEventListener("focus", onFocus);
    };
  }, [isLoggedIn]);

  /* meId 세팅 후 사용자 알림 구독 보강 */
  useEffect(() => {
    if (stompRef.current?.connected && meId) subscribeUserAlerts(meId);
  }, [meId]);

  /* 방 변경 시 구독 + 미읽음 제거 */
  useEffect(() => {
    if (!stompRef.current?.connected || !activeRoomId) return;
    subscribeRoom(activeRoomId);
    clearUnread(activeRoomId);
  }, [activeRoomId]);

  /* 히스토리 로딩 */
  useEffect(() => {
    if (!activeRoomId) return;
    (async () => {
      try {
        setLoading(true);
        msgIdsRef.current.clear();
        const latestToOld = await apiGetMessages(activeRoomId, { size: 50 });
        const asc = latestToOld.slice().reverse();
        for (const m of asc) msgIdsRef.current.add(m.id);
        setMessages(asc);
        setTimeout(() => {
          const sc = msgRef.current;
          if (sc) sc.scrollTop = sc.scrollHeight + 999;
        }, 0);
      } catch (e) {
        console.error("history load fail:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeRoomId]);

  /* 더 불러오기 */
  async function loadMore() {
    if (!messages.length || !activeRoomId) return;
    const oldest = messages[0].id;
    try {
      const more = await apiGetMessages(activeRoomId, { size: 50, beforeId: oldest });
      if (!more.length) return;
      const addAsc = more.reverse();
      const uniq = addAsc.filter((m) => !msgIdsRef.current.has(m.id));
      if (!uniq.length) return;
      for (const m of uniq) msgIdsRef.current.add(m.id);
      setMessages((prev) => [...uniq, ...prev]);
    } catch (e) {
      console.error("loadMore fail:", e);
    }
  }

  /* 전송 */
  function onSend() {
    const text = input.trim();
    if (!text || !activeRoomId || !meId) return;
    if (!stompRef.current?.connected) return;
    try {
      stompRef.current.publish({
        destination: `/app/rooms/${activeRoomId}/send`,
        body: JSON.stringify({ content: text }),
      });
      setInput("");
    } catch (e) {
      console.error("send fail:", e);
    }
  }

  /* 나가기 */
  async function onLeave() {
    const rid = activeRoomIdRef.current;
    if (!rid || !meId) return;
    try {
      await apiLeaveRoom(rid, meId);
      roomSubRef.current?.unsubscribe();
      setRooms((prev) => {
        const filtered = prev.filter((r) => r.roomId !== rid);
        const next = filtered[0];
        setActiveRoomId(next ? next.roomId : null);
        return filtered;
      });
      setMessages([]);
      msgIdsRef.current.clear();
      clearUnread(rid);
    } catch (e) {
      console.error("leave room failed", e);
    }
  }

  /* 좌측 방 목록 필터링 (렌더 직전에 한번 더 dedupe) */
  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rooms.filter(
          (r) =>
            String(r.roomId).includes(q) ||
            String(r.peerId ?? "").includes(q) ||
            (r.peerName ?? "").toLowerCase().includes(q) ||
            (r.name ?? "").toLowerCase().includes(q) ||
            (r.lastText ?? "").toLowerCase().includes(q)
        )
      : rooms;
    return dedupeRoomsById(base);
  }, [rooms, query]);

  const activeRoom = rooms.find((r) => r.roomId === activeRoomId);
  const activeTitle = activeRoomId
    ? activeRoom?.type === "DIRECT"
      ? (activeRoom?.peerName || `상대 ${activeRoom?.peerId}`)
      : (activeRoom?.name || `그룹 ${activeRoomId}`)
    : "방을 선택하세요";

  return (
    <div className="dm bg-light min-vh-100 d-flex flex-column">
      <header>
        <section className="hero">
          <div className="hero__mask" />
          <div className="hero__content">
            <h1 className="hero__title">
              채팅
            </h1>
          </div>
        </section>
      </header>

      <div className="container-xxl py-3">
        <div className="row g-3">
          {/* 왼쪽: 방 목록 */}
          <aside className="col-12 col-md-4">
            <div className="card shadow-sm border-0 dm-h-panel overflow-hidden d-flex">
              <div className="card-header bg-white d-flex align-items-center gap-2 dm-toolbar">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-body border-0">
                    <Icon name="search" />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    className="form-control border-0"
                    placeholder="검색 (이름/방번호/상대ID/내용)"
                  />
                </div>

                <div className="d-flex align-items-center gap-1 ms-1">
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setShowCreate(true)}
                    title="방 만들기"
                  >
                    <Icon name="edit" />
                  </button>

                  <button
                    className="btn btn-outline-primary btn-sm px-3 text-nowrap"
                    onClick={async () => {
                      if (!meId) return;
                      const val = prompt("참여할 그룹 방 번호를 입력하세요");
                      const rid = Number(val);
                      if (!rid || Number.isNaN(rid)) return;
                      try {
                        const res = await apiJoinRoom(rid, meId);
                        if (res.joined) {
                          await reloadRooms(meId);
                          setActiveRoomId(rid);
                          clearUnread(rid);
                        }
                      } catch (e) {
                        console.error("join failed", e);
                      }
                    }}
                    title="그룹 방 번호로 참여"
                  >
                    참여
                  </button>
                </div>
              </div>

              <div className="list-group list-group-flush flex-grow-1 overflow-auto dm-scroll-soft">
                {filteredRooms.map((r) => {
                  const isGroup = r.type === "GROUP" || !r.peerId;
                  const title = isGroup ? (r.name || `그룹 ${r.roomId}`) : (r.peerName || `상대 ${r.peerId}`);
                  const unreadCnt = unread[r.roomId] || 0;
                  return (
                    <button
                      key={`room-${r.roomId}`}
                      onClick={() => {
                        setActiveRoomId(r.roomId);
                        clearUnread(r.roomId);
                      }}
                      className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                        activeRoomId === r.roomId ? "dm-active-item" : ""
                      }`}
                    >
                      <Avatar variant={isGroup ? "group" : "user"} />
                      <div className="flex-grow-1 text-start">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-truncate">{title}</span>
                          {unreadCnt > 0 && (
                            <span className="dm-badge">{unreadCnt > 9 ? "9+" : unreadCnt}</span>
                          )}
                        </div>
                        <div className="text-secondary small text-truncate">{r.lastText ?? ""}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredRooms.length === 0 && (
                  <div className="p-3 text-secondary small">방이 없습니다.</div>
                )}
              </div>
            </div>
          </aside>

          {/* 오른쪽: 메시지 패널 */}
          <main className="col-12 col-md-8 d-flex">
            <div className="card shadow-sm border-0 dm-h-panel w-100 overflow-hidden d-flex flex-column">
              <div className="card-header bg-white d-flex align-items-center justify-content-between dm-toolbar">
                <div className="d-flex align-items-center gap-2">
                  <Avatar variant={activeRoom?.peerId ? "user" : "group"} />
                  <div>
                    <div className="fw-semibold text-truncate dm-title">{activeTitle}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {activeRoomId && (
                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      onClick={async () => {
                        const raw = prompt("초대할 사용자 ID들을 쉼표로 입력 (예: 2002,3003)");
                        if (!raw) return;
                        const ids = raw
                          .split(",")
                          .map((s) => Number(s.trim()))
                          .filter((n) => !!n && !Number.isNaN(n));
                        if (!ids.length) return;
                        try {
                          await apiInviteMembers(activeRoomId, ids);
                        } catch (e) {
                          console.error("invite failed", e);
                        }
                      }}
                      title="초대"
                    >
                      <Icon name="userPlus" /> 초대
                    </button>
                  )}
                  {activeRoomId && (
                    <button className="btn btn-outline-danger btn-sm" onClick={onLeave}>
                      나가기
                    </button>
                  )}
                </div>
              </div>

              <div
                className="flex-grow-1 overflow-auto p-3 dm-scroll-soft"
                ref={msgRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollTop < 30 && !loading && messages.length >= 50) {
                    loadMore();
                  }
                }}
              >
                {messages.map((m) => (
                  <div key={`msg-${m.id}`} className="mb-2">
                    <MessageBubble
                      who={m.senderId === meId ? "me" : "them"}
                      text={m.content}
                      at={m.time}
                    />
                  </div>
                ))}
                {loading && <div className="text-center text-secondary small mt-2">불러오는 중…</div>}
              </div>

              <div className="card-footer bg-white">
                <div className="d-flex align-items-end gap-2 border rounded-4 p-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={activeRoomId ? "메시지 입력..." : "좌측에서 방을 선택하세요"}
                    className="form-control border-0 flex-grow-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    disabled={!activeRoomId}
                  />
                  {input && activeRoomId && (
                    <button onClick={onSend} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
                      Send <Icon name="send" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 토스트 알림 */}
      <div className="dm-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="dm-toast shadow">
            <div className="dm-toast-title">{t.title}</div>
            <div className="dm-toast-msg">{t.message}</div>
          </div>
        ))}
      </div>

      {/* 방 만들기 모달 */}
      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        meId={meId}
        onCreated={async ({ kind, data, fallbackPeer }) => {
          if (kind === "DIRECT") {
            const peerId = data.peerId ?? fallbackPeer ?? null;
            // 🔸 peerName 없으면 employee_name 조회
            let peerName = data.peerName ?? null;
            if (peerId && (!peerName || !String(peerName).trim())) {
              const found = await apiGetEmployeeName(peerId);
              if (found) peerName = found;
            }
            setRooms((prev) =>
              dedupeRoomsById([
                {
                  roomId: data.roomId,
                  peerId,
                  peerName,
                  name: data.name, // DM 시스템명은 쓰지 않음
                  type: data.type,
                  lastText: "",
                  lastTime: data.createdAt,
                },
                ...prev,
              ])
            );
            setActiveRoomId(data.roomId);
          } else {
            // 그룹은 생성 시 이름 사용
            setRooms((prev) =>
              dedupeRoomsById([
                {
                  roomId: data.roomId,
                  peerId: null,
                  peerName: null,
                  name: data.name, // ← 그룹명
                  type: data.type,
                  lastText: "",
                  lastTime: data.createdAt,
                },
                ...prev,
              ])
            );
            setActiveRoomId(data.roomId);
          }
          clearUnread(data.roomId);
        }}
      />
    </div>
  );
}
