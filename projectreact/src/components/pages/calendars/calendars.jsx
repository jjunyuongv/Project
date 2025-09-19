import React, { useEffect, useMemo, useState } from "react";
import "./calendars.css";

const DAY_START = 6;
const HOUR_HEIGHT = 44;
const EVENTS_URL = "/api/events"; // 백엔드 조회 엔드포인트

// ===== utils =====
function stripTime(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function toISODate(d){ return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function pad2(n){ return String(n).padStart(2,"0"); }
function hoursRange(start,end){ return Array.from({length:end-start+1},(_,i)=>start+i); }
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function betweenDate(a,b,c){ return a.getTime() <= c.getTime() && c.getTime() <= b.getTime(); }
function fmtHM(min){ const h=Math.floor(min/60), m=min%60; return `${pad2(h)}:${pad2(m)}`; }

// ===== 로그인 사번 가져오기(로컬/세션/전역 모두 시도) =====
function getCurrentEmployeeId() {
  try {
    if (typeof window !== "undefined") {
      if (window.__EMPLOYEE_ID__) return String(window.__EMPLOYEE_ID__);
      const ls = window.localStorage?.getItem("employeeId");
      if (ls) return ls;
      const ss = window.sessionStorage?.getItem("employeeId");
      if (ss) return ss;
    }
  } catch (e) {
    void e; // ← 변수 사용 처리해서 ESLint 경고 제거
  }
  return null; // 없으면 서버에서 전체를 돌려줄 수 있음
}

// ===== calendar helpers =====
function getWeekInfo(base){
  const day = base.getDay();
  const monday = stripTime(new Date(base));
  monday.setDate(base.getDate() - ((day + 6) % 7));
  const sunday = stripTime(new Date(monday));
  sunday.setDate(monday.getDate() + 6);
  const daysOfWeek = Array.from({length:7},(_,i)=>{
    const d = new Date(monday); d.setDate(monday.getDate()+i);
    const label = ["월","화","수","목","금","토","일"][(d.getDay()+6)%7] + " " + d.getDate();
    return { date:d, label };
  });
  return { monday, sunday, daysOfWeek };
}

function getCalendarDays(base){
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstW = first.getDay();
  const daysInMonth = last.getDate();
  const days = [];
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = firstW - 1; i >= 0; i--) {
    const day = prevLast - i;
    days.push({ date: new Date(year, month - 1, day), isCurrentMonth: false, day });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true, day: d });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false, day: d });
  }
  return days;
}

// ========== 타입/색상/아이콘 ==========
function labelByType(t){ return ({flight:"비행 일정",maintenance:"정비 일정",training:"교육 일정",vacation:"휴가 일정",shift:"근무 변경"}[t]||t); }
function colorByType(t){ return ({flight:"#46C075",maintenance:"#FF9800",training:"#1E88E5",vacation:"#8E44AD",shift:"#03a9f4"}[t]||"#9e9e9e"); }
function iconByType(t){ return ({flight:"✈️",maintenance:"🔧",training:"📚",vacation:"🏖️",shift:"📋"}[t]||"📅"); }

// ====== 서버 EVENT → 프런트 타입 매핑 ======
const toFrontendType = (category) => (category === "SHIFT" ? "shift" : "vacation");

export default function Calendars({ initialDate = new Date(), NavbarComponent, onAddSchedule }) {
  const [viewMode, setViewMode] = useState("month");
  const [baseDate, setBaseDate] = useState(stripTime(initialDate));
  const [filters, setFilters] = useState({
    flight:true, maintenance:true, training:true, vacation:true, shift:true
  });
  const [data, setData] = useState(null);
  const [stats] = useState(null);     // 통계 미사용: setter 제거
  const [loading, setLoading] = useState(false);

  // === fallback (빈 달력) ===
  const monthFallback = useMemo(() => {
    const days = getCalendarDays(baseDate).map(d => ({ date: toISODate(d.date), isCurrentMonth: d.isCurrentMonth, day: d.day, events: [] }));
    return { title: `${baseDate.getFullYear()}년 ${baseDate.getMonth()+1}월`, days };
  }, [baseDate]);

  const weekFallback = useMemo(() => {
    const { monday, sunday, daysOfWeek } = getWeekInfo(baseDate);
    const hours = hoursRange(DAY_START, 22);
    const columns = daysOfWeek.map(({date,label})=>({ date: toISODate(date), label, events: [] }));
    return { monday: toISODate(monday), sunday: toISODate(sunday), hours, columns };
  }, [baseDate]);

  const dayFallback = useMemo(() => ({ date: toISODate(baseDate), hours: hoursRange(DAY_START, 22), events: [] }), [baseDate]);

  const prev = () => setBaseDate(d => { const x=new Date(d); if(viewMode==="month")x.setMonth(x.getMonth()-1,1); if(viewMode==="week")x.setDate(x.getDate()-7); if(viewMode==="day")x.setDate(x.getDate()-1); return stripTime(x); });
  const next = () => setBaseDate(d => { const x=new Date(d); if(viewMode==="month")x.setMonth(x.getMonth()+1,1); if(viewMode==="week")x.setDate(x.getDate()+7); if(viewMode==="day")x.setDate(x.getDate()+1); return stripTime(x); });

  const monthData = data?.days ? data : monthFallback;
  const weekData  = viewMode==="week" ? (data?.columns ? data : weekFallback) : null;
  const dayData   = viewMode==="day"  ? (data?.hours ? data : dayFallback) : null;

  // ====== 서버에서 이벤트 가져오기 + 가공 ======
  const { fetchStartISO, fetchEndISO } = useMemo(() => {
    if (viewMode === "month") {
      const grid = getCalendarDays(baseDate);
      const start = stripTime(grid[0].date);
      const end   = stripTime(grid[grid.length - 1].date);
      return { fetchStartISO: toISODate(start), fetchEndISO: toISODate(end) };
    }
    if (viewMode === "week") {
      const { monday, sunday } = getWeekInfo(baseDate);
      return { fetchStartISO: toISODate(monday), fetchEndISO: toISODate(sunday) };
    }
    return { fetchStartISO: toISODate(baseDate), fetchEndISO: toISODate(baseDate) };
  }, [viewMode, baseDate]);

  // 주기적 새로고침(120초) + 외부에서 강제 리프레시 이벤트 수신
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(()=>setTick(v=>v+1), 120000); return ()=>clearInterval(t); }, []);
  useEffect(() => {
    const h = () => setTick(v => v + 1);
    window.addEventListener("calendar-refetch", h);
    return () => window.removeEventListener("calendar-refetch", h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);

        // ✅ crewId(내 사번)까지 같이 보냄
        const me = getCurrentEmployeeId();
        const params = new URLSearchParams({ start: fetchStartISO, end: fetchEndISO });
        if (me) params.set("crewId", me);

        const resp = await fetch(`${EVENTS_URL}?${params.toString()}`, { credentials: "include" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const list = await resp.json(); // [{eventId, crewEmployeeId, title, content, startDate, endDate, category}...]

        if (cancelled) return;

        // 필터링 + 타입 변환
        const mapped = list.map(ev => ({
          id: ev.eventId,
          title: ev.title,
          start: ev.startDate,      // 'YYYY-MM-DD'
          end: ev.endDate || ev.startDate,
          type: toFrontendType(ev.category), // 'vacation' | 'shift'
          color: undefined,
          raw: ev
        })).filter(ev => {
          if (ev.type === "vacation" && !filters.vacation) return false;
          if (ev.type === "shift"    && !filters.shift) return false;
          return true;
        });

        // 뷰별 가공
        if (viewMode === "month") {
          const grid = getCalendarDays(baseDate);
          const byDate = new Map(grid.map(d => [toISODate(d.date), []]));
          mapped.forEach(ev => {
            const s = new Date(ev.start+"T00:00:00");
            const e = new Date(ev.end+"T00:00:00");
            for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
              const key = toISODate(d);
              if (byDate.has(key)) {
                byDate.get(key).push({
                  id: ev.id,
                  title: ev.title,
                  type: ev.type,
                  color: ev.color || colorByType(ev.type)
                });
              }
            }
          });

          const days = grid.map(d => ({
            date: toISODate(d.date),
            isCurrentMonth: d.isCurrentMonth,
            day: d.day,
            events: byDate.get(toISODate(d.date)) || []
          }));

          setData({ title: `${baseDate.getFullYear()}년 ${baseDate.getMonth()+1}월`, days });
        }
        else if (viewMode === "week") {
          const { monday, sunday, daysOfWeek } = getWeekInfo(baseDate);
          const hours = hoursRange(DAY_START, 22);
          const cols = daysOfWeek.map(({date,label}) => {
            const iso = toISODate(date);
            const events = mapped.filter(ev => {
              const s = new Date(ev.start+"T00:00:00");
              const e = new Date(ev.end+"T00:00:00");
              return betweenDate(s, e, date);
            }).map(ev => ({
              id: ev.id,
              title: ev.title,
              type: ev.type,
              color: ev.color || colorByType(ev.type),
              startMin: DAY_START*60,
              endMin: (DAY_START*60)+60
            }));
            return { date: iso, label, events };
          });
          setData({ monday: toISODate(monday), sunday: toISODate(sunday), hours, columns: cols });
        }
        else { // day
          const hours = hoursRange(DAY_START, 22);
          const current = stripTime(baseDate);
          const events = mapped.filter(ev => {
            const s = new Date(ev.start+"T00:00:00");
            const e = new Date(ev.end+"T00:00:00");
            return betweenDate(s, e, current);
          }).map(ev => ({
            id: ev.id,
            title: ev.title,
            type: ev.type,
            color: ev.color || colorByType(ev.type),
            startMin: DAY_START*60,
            endMin: (DAY_START*60)+60
          }));
          setData({ date: toISODate(baseDate), hours, events });
        }
      } catch (e) {
        console.error("load events failed", e);
        setData(null); // fallback 사용
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [viewMode, baseDate, filters.vacation, filters.shift, fetchStartISO, fetchEndISO, tick]);

  return (
    <div className="schedule-root">
      {NavbarComponent && <NavbarComponent />}

      <main className="schedule-page">
        <div className="page-header">
          <h1>일정</h1>
          <div className="controls">
            <div className="view-tabs">
              <button className={viewMode==="month"?"active":""} onClick={()=>setViewMode("month")}>월간</button>
              <button className={viewMode==="week" ?"active":""} onClick={()=>setViewMode("week")}>주간</button>
              <button className={viewMode==="day"  ?"active":""} onClick={()=>setViewMode("day")}>일간</button>
            </div>
            <button className="add-btn" onClick={()=>onAddSchedule && onAddSchedule()}>+ 새 일정</button>
          </div>
        </div>

        <div className="layout">
          <aside className="left">
            <section className="card">
              <h3>필터</h3>
              <div className="filters">
                {["flight","maintenance","training","vacation","shift"].map(t=>(
                  <label key={t} className="filter-item">
                    <input type="checkbox" checked={!!filters[t]} onChange={e=>setFilters(p=>({...p,[t]:e.target.checked}))}/>
                    {labelByType(t)}
                  </label>
                ))}
              </div>
            </section>

            <section className="card">
              <h3>이번 주 통계</h3>
              <div className="stat"><span>총 비행 시간</span><strong>{stats?.flightHours!=null?`${stats.flightHours}시간`:"—"}</strong></div>
              <div className="stat"><span>정비 완료</span><strong>{stats?.maintenanceDone!=null?`${stats.maintenanceDone}건`:"—"}</strong></div>
              <div className="stat"><span>교육 완료</span><strong>{stats?.trainingDone!=null?`${stats.trainingDone}건`:"—"}</strong></div>
            </section>
          </aside>

          <section className="right">
            {loading && <div className="card" style={{padding:24}}>로딩 중…</div>}
            {!loading && (
              <>
                {viewMode==="month" && (
                  <div className="calendar card">
                    <div className="cal-header">
                      <button className="nav" onClick={prev}>‹</button>
                      <h2>{monthData.title}</h2>
                      <button className="nav" onClick={next}>›</button>
                    </div>

                    <div className="grid">
                      {["일","월","화","수","목","금","토"].map(d=><div key={d} className="grid-head">{d}</div>)}
                      {monthData.days.map((d,i)=>(
                        <div key={i} className={`cell ${d.isCurrentMonth? "": "other"}`}>
                          <span className={`daynum ${d.isCurrentMonth? "": "other"}`}>{d.day}</span>
                          {(d.events||[]).map(ev=>(
                            <button key={ev.id} className="event" style={{backgroundColor: ev.color||colorByType(ev.type)}} title={ev.title}>
                              <span className="emoji">{iconByType(ev.type)}</span>
                              <span className="title">{ev.title}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewMode==="week" && weekData && (
                  <div className="week card">
                    <div className="cal-header">
                      <button className="nav" onClick={prev}>‹</button>
                      <h2>{weekData.monday} ~ {weekData.sunday}</h2>
                      <button className="nav" onClick={next}>›</button>
                    </div>

                    <div className="time-grid" style={{gridTemplateColumns:`60px repeat(${weekData.columns.length}, 1fr)`}}>
                      <div className="gutter">
                        {weekData.hours.map(h=>(
                          <div key={h} className="hour-row" style={{height:HOUR_HEIGHT}}>
                            <span className="hour-label">{pad2(h)}:00</span>
                          </div>
                        ))}
                      </div>

                      {weekData.columns.map(col=>(
                        <div key={col.date} className="day-col">
                          <div className="day-col-head">{col.label||col.date}</div>
                          <div className="slots">
                            {weekData.hours.map(h=> <div key={h} className="slot-row" style={{height:HOUR_HEIGHT}}/>)}
                            {(col.events||[]).map(ev=>{
                              const hours0 = (weekData.hours?.[0] ?? DAY_START) * 60;
                              const top = (ev.startMin - hours0) * (HOUR_HEIGHT/60);
                              const height = (ev.endMin - ev.startMin) * (HOUR_HEIGHT/60);
                              if (height <= 0) return null;
                              return (
                                <button key={ev.id} className="event-block" style={{top, height, backgroundColor: ev.color||colorByType(ev.type)}} title={ev.title}>
                                  <span className="evt-title">{ev.title}</span>
                                  <span className="evt-time">{fmtHM(ev.startMin)}–{fmtHM(ev.endMin)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewMode==="day" && dayData && (
                  <div className="day card">
                    <div className="cal-header">
                      <button className="nav" onClick={prev}>‹</button>
                      <h2>{dayData.date}</h2>
                      <button className="nav" onClick={next}>›</button>
                    </div>

                    <div className="time-grid" style={{gridTemplateColumns:`60px 1fr`}}>
                      <div className="gutter">
                        {dayData.hours.map(h=>(
                          <div key={h} className="hour-row" style={{height:HOUR_HEIGHT}}>
                            <span className="hour-label">{pad2(h)}:00</span>
                          </div>
                        ))}
                      </div>

                      <div className="day-col">
                        <div className="day-col-head">오늘</div>
                        <div className="slots">
                          {dayData.hours.map(h=> <div key={h} className="slot-row" style={{height:HOUR_HEIGHT}}/>)}
                          {(dayData.events||[]).map(ev=>{
                            const hours0 = (dayData.hours?.[0] ?? DAY_START) * 60;
                            const top = (ev.startMin - hours0) * (HOUR_HEIGHT/60);
                            const height = (ev.endMin - ev.startMin) * (HOUR_HEIGHT/60);
                            if (height <= 0) return null;
                            return (
                              <button key={ev.id} className="event-block" style={{top, height, backgroundColor: ev.color||colorByType(ev.type)}} title={ev.title}>
                                <span className="evt-title">{ev.title}</span>
                                <span className="evt-time">{fmtHM(ev.startMin)}–{fmtHM(ev.endMin)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
