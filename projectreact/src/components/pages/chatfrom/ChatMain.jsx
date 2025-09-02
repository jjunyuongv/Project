// ChatMain.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./chat.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const meId = Number(new URLSearchParams(window.location.search).get("me") ?? "1001");

/* ---- REST ---- */
async function apiCreateDirectRoom(userA, userB) {
  const r = await fetch(`/api/chat/rooms/direct?userA=${userA}&userB=${userB}`, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiGetMyRooms(me) {
  const r = await fetch(`/api/chat/rooms/my?me=${me}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiGetMessages(roomId, { beforeId = null, size = 50 } = {}) {
  const qs = new URLSearchParams();
  if (beforeId) qs.set("beforeId", String(beforeId));
  if (size) qs.set("size", String(size));
  const r = await fetch(`/api/chat/rooms/${roomId}/messages?${qs.toString()}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
// ★ 나가기
async function apiLeaveRoom(roomId, me) {
  const r = await fetch(`/api/chat/rooms/${roomId}/leave?me=${me}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { left:true, roomRemoved:boolean }
}

/* ---- 단순 UI ---- */
function Avatar({ colors = ["#8b5cf6", "#6366f1"], initials = "R", size = 40 }) {
  const st = { width: size, height: size, backgroundImage: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` };
  return (
    <div className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0" style={st}>
      <span className="user-select-none" style={{ fontSize: Math.floor(size / 2.2) }}>{initials}</span>
    </div>
  );
}
function Icon({ name, size = 20, className = "" }) {
  const sz = { width: size, height: size };
  switch (name) {
    case "search": return (<svg viewBox="0 0 24 24" fill="none" style={sz} className={className}><circle cx="11" cy="11" r="7" strokeWidth="1.5" stroke="currentColor"/><path d="M20 20l-3-3" strokeWidth="1.5" stroke="currentColor"/></svg>);
    case "edit":   return (<svg viewBox="0 0 24 24" fill="none" style={sz} className={className}><path d="M12 20h9" strokeWidth="1.5" stroke="currentColor"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeWidth="1.5" stroke="currentColor"/></svg>);
    case "send":   return (<svg viewBox="0 0 24 24" fill="none" style={sz} className={className}><path d="M22 2 11 13" strokeWidth="1.5" stroke="currentColor"/><path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeWidth="1.5" stroke="currentColor"/></svg>);
    default: return null;
  }
}
function MessageBubble({ who, text, at }) {
  const isMe = who === "me";
  return (
    <div className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}>
      <div className="dm-bubble shadow-sm border">
        <p className="text-break">{text}</p>
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
  } catch { return ""; }
}

/* ---- 메인 ---- */
function ChatMain() {
  // 좌측 목록: {roomId, peerId, lastText?, lastTime?}
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);

  // 최신 roomId를 콜백에서 안전하게 읽기 위한 ref
  const activeRoomIdRef = useRef(null);
  useEffect(() => { activeRoomIdRef.current = activeRoomId; }, [activeRoomId]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgRef = useRef(null);

  // STOMP
  const stompRef = useRef(null);
  const subRef = useRef(null);

  function resubscribe(roomId) {
    const prev = subRef.current;
    if (prev && typeof prev.unsubscribe === "function") prev.unsubscribe();
    subRef.current = null;

    if (!stompRef.current || !stompRef.current.connected) return;

    subRef.current = stompRef.current.subscribe(`/topic/rooms/${roomId}`, (frame) => {
      const msg = JSON.parse(frame.body);
      if (roomId === activeRoomIdRef.current) {
        setMessages((prevMsgs) => [...prevMsgs, msg]);
        setRooms((prevRooms) =>
          prevRooms.map((r) => (r.roomId === roomId ? { ...r, lastText: msg.content, lastTime: msg.time } : r))
        );
        const sc = msgRef.current;
        if (sc) sc.scrollTop = sc.scrollHeight + 999;
      }
    });
  }

  async function reloadRooms() {
    const list = await apiGetMyRooms(meId); // [{roomId, peerId}]
    const previews = await Promise.all(
      list.map(async ({ roomId, peerId }) => {
        try {
          const arr = await apiGetMessages(roomId, { size: 1 });
          const last = arr[0];
          return { roomId, peerId, lastText: last?.content ?? "", lastTime: last?.time ?? null };
        } catch {
          return { roomId, peerId };
        }
      })
    );
    setRooms(previews);
    if (previews.length && !previews.some(p => p.roomId === activeRoomIdRef.current)) {
      setActiveRoomId(previews[0].roomId);
    }
  }

  // 1) 최초 로드
  useEffect(() => {
    (async () => {
      try { await reloadRooms(); }
      catch (e) { console.error(e); alert("방 목록 로드 실패"); }
    })();
  }, []);

  // 2) 방 선택 시 히스토리
  useEffect(() => {
    if (!activeRoomId) return;
    (async () => {
      try {
        setLoading(true);
        const latestToOld = await apiGetMessages(activeRoomId, { size: 50 });
        setMessages(latestToOld.slice().reverse());
        setTimeout(() => { const sc = msgRef.current; if (sc) sc.scrollTop = sc.scrollHeight + 999; }, 0);
      } catch (e) {
        console.error(e);
        alert("메시지 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeRoomId]);

  // 3) STOMP 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-chat"),
      reconnectDelay: 2000,
      onConnect: () => {
        const rid = activeRoomIdRef.current;
        if (rid) resubscribe(rid);
      },
    });
    client.activate();
    stompRef.current = client;

    return () => {
      const sub = subRef.current;
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
      subRef.current = null;

      const deactivate = client.deactivate?.bind(client);
      if (typeof deactivate === "function") {
        const p = deactivate();
        if (p && typeof p.catch === "function") p.catch(() => undefined);
      }
    };
  }, []);

  // 4) 방 변경 시 구독 재설정
  useEffect(() => {
    if (!stompRef.current || !stompRef.current.connected) return;
    if (!activeRoomId) return;
    resubscribe(activeRoomId);
  }, [activeRoomId]);

  // 5) 과거 더 로드
  async function loadMore() {
    if (!messages.length || !activeRoomId) return;
    const oldest = messages[0].id;
    const more = await apiGetMessages(activeRoomId, { size: 50, beforeId: oldest });
    if (!more.length) return;

    const add = more.reverse();
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const uniq = add.filter((m) => !seen.has(m.id));
      return uniq.length ? [...uniq, ...prev] : prev;
    });
  }

  // 6) 전송
  function onSend() {
    const text = input.trim();
    if (!text || !activeRoomId) return;
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination: `/app/rooms/${activeRoomId}/send`,
        body: JSON.stringify({ senderId: meId, content: text }),
      });
      setInput("");
    } else {
      alert("실시간 연결이 끊겼습니다. 새로고침해 주세요.");
    }
  }

  // ★ 방 나가기
  async function onLeave() {
    const rid = activeRoomIdRef.current;
    if (!rid) return;
    if (!window.confirm("이 방을 나가시겠습니까? (메시지는 남아있을 수 있습니다. 멤버가 없으면 방이 삭제됩니다)")) return;

    try {
      await apiLeaveRoom(rid, meId);

      // 현재 구독 해제
      const sub = subRef.current;
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
      subRef.current = null;

      // 목록에서 제거
      setRooms((prev) => prev.filter((r) => r.roomId !== rid));

      // 다른 방으로 전환하거나 비우기
      setMessages([]);
      const next = rooms.find((r) => r.roomId !== rid);
      setActiveRoomId(next ? next.roomId : null);
    } catch (e) {
      console.error(e);
      alert("방 나가기에 실패했습니다.");
    }
  }

  // 검색: 방번호 / 상대ID / 최근내용
  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        String(r.roomId).includes(q) ||
        String(r.peerId ?? "").includes(q) ||
        (r.lastText ?? "").toLowerCase().includes(q)
    );
  }, [rooms, query]);

  const activePeerId = rooms.find(r => r.roomId === activeRoomId)?.peerId ?? null;
  const activeTitle = activeRoomId ? (activePeerId ? `상대 ${activePeerId}` : `Room #${activeRoomId}`) : "방을 선택하세요";

  return (
    <div className="dm bg-light min-vh-100 d-flex flex-column">
      <header>
        <section className="hero">
          <div className="hero__mask" />
          <div className="hero__content">
            <h1 className="hero__title">채팅</h1>
          </div>
        </section>
      </header>

      <div className="container-xxl py-3">
        <div className="row g-3">
          {/* 왼쪽 바: 방 목록 */}
          <aside className="col-12 col-md-4">
            <div className="card shadow-sm border-0 dm-h-panel overflow-hidden d-flex">
              <div className="card-header bg-white d-flex align-items-center gap-2">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-body border-0"><Icon name="search" /></span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    className="form-control border-0"
                    placeholder="검색 (방번호/상대ID/내용)"
                  />
                </div>

                {/* DM 생성 */}
                <button
                  className="btn btn-light btn-sm ms-2"
                  onClick={async () => {
                    const other = Number(prompt("상대 사용자ID 입력", "2002"));
                    if (!other) return;
                    try {
                      const r = await apiCreateDirectRoom(meId, other);
                      if (!rooms.some((x) => x.roomId === r.roomId)) {
                        setRooms((prev) => [
                          { roomId: r.roomId, peerId: r.peerId ?? other, lastText: "", lastTime: r.createdAt },
                          ...prev
                        ]);
                      }
                      setActiveRoomId(r.roomId);
                    } catch (e) {
                      console.error(e);
                      alert("방 생성 실패");
                    }
                  }}
                >
                  <Icon name="edit" />
                </button>
              </div>

              <div className="list-group list-group-flush flex-grow-1 overflow-auto dm-scroll-soft">
                {filteredRooms.map((r) => (
                  <button
                    key={r.roomId}
                    onClick={() => setActiveRoomId(r.roomId)}
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${activeRoomId === r.roomId ? "dm-active-item" : ""}`}
                  >
                    <Avatar />
                    <div className="flex-grow-1 text-start">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold text-truncate">
                          {r.peerId ? `상대 ${r.peerId}` : `Room #${r.roomId}`}
                        </span>
                      </div>
                      <div className="text-secondary small text-truncate">{r.lastText ?? ""}</div>
                    </div>
                  </button>
                ))}
                {filteredRooms.length === 0 && <div className="p-3 text-secondary small">방이 없습니다.</div>}
              </div>
            </div>
          </aside>

          {/* 메시지 패널 */}
          <main className="col-12 col-md-8 d-flex">
            <div className="card shadow-sm border-0 dm-h-panel w-100 overflow-hidden d-flex flex-column">
              <div className="card-header bg-white d-flex align-items-center justify-content-between" style={{ height: 56 }}>
                <div className="d-flex align-items-center gap-2">
                  <Avatar />
                  <div><div className="fw-semibold text-truncate" style={{ maxWidth: 240 }}>{activeTitle}</div></div>
                </div>

                {/* ★ 방 나가기 버튼 */}
                {activeRoomId && (
                  <button className="btn btn-outline-danger btn-sm" onClick={onLeave}>
                    나가기
                  </button>
                )}
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
                  <div key={m.id} className="mb-2">
                    <MessageBubble who={m.senderId === meId ? "me" : "them"} text={m.content} at={m.time} />
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
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
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
    </div>
  );
}

export default ChatMain;
