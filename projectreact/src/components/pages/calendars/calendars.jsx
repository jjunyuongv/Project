import React, { useEffect, useMemo, useState } from "react";
import "./calendars.css";

const DAY_START = 6;
const HOUR_HEIGHT = 44;

function stripTime(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x = new Date(d); x.setHours(23,59,59,999); return x; }
function toISODate(d){ return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function pad2(n){ return String(n).padStart(2,"0"); }
function hoursRange(start,end){ return Array.from({length:end-start+1},(_,i)=>start+i); }

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

function labelByType(t){ return ({flight:"비행 일정",maintenance:"정비 일정",training:"교육 일정",vacation:"휴가 일정"}[t]||t); }
function colorByType(t){ return ({flight:"#46C075",maintenance:"#FF9800",training:"#1E88E5",vacation:"#8E44AD"}[t]||"#9e9e9e"); }
function iconByType(t){ return ({flight:"✈️",maintenance:"🔧",training:"📚",vacation:"🏖️"}[t]||"📅"); }
function fmtHM(min){ const h=Math.floor(min/60), m=min%60; return `${pad2(h)}:${pad2(m)}`; }

export default function Calendars({ initialDate = new Date(), NavbarComponent, onAddSchedule }) {
  const [viewMode, setViewMode] = useState("month");
  const [baseDate, setBaseDate] = useState(stripTime(initialDate));
  const [filters, setFilters] = useState({ flight:true, maintenance:true, training:true, vacation:true });
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const typesParam = useMemo(
    () => Object.entries(filters).filter(([,v])=>v).map(([k])=>k).join(","),
    [filters]
  );
  const pxPerMin = HOUR_HEIGHT / 60;

  useEffect(() => { setData(null); setLoading(false); }, [viewMode, baseDate, typesParam]);
  useEffect(() => { setStats(null); }, [baseDate, typesParam]);

  const monthFallback = useMemo(() => {
    const days = getCalendarDays(baseDate).map(d => ({ date: toISODate(d.date), isCurrentMonth: d.isCurrentMonth, day: d.day, events: [] }));
    return { title: `${baseDate.getFullYear()}년 ${baseDate.getMonth()+1}월`, days };
  }, [baseDate]);

  const weekFallback = useMemo(() => {
    const { monday, sunday, daysOfWeek } = getWeekInfo(baseDate);
    const hours = hoursRange(DAY_START, 22);
    const columns = daysOfWeek.map(({date,label})=>({ date: toISODate(date), label, events: [] }));
    return { monday: monday.toISOString().slice(0,10), sunday: sunday.toISOString().slice(0,10), hours, columns };
  }, [baseDate]);

  const dayFallback = useMemo(() => ({ date: toISODate(baseDate), hours: hoursRange(DAY_START, 22), events: [] }), [baseDate]);

  const prev = () => setBaseDate(d => { const x=new Date(d); if(viewMode==="month")x.setMonth(x.getMonth()-1,1); if(viewMode==="week")x.setDate(x.getDate()-7); if(viewMode==="day")x.setDate(x.getDate()-1); return stripTime(x); });
  const next = () => setBaseDate(d => { const x=new Date(d); if(viewMode==="month")x.setMonth(x.getMonth()+1,1); if(viewMode==="week")x.setDate(x.getDate()+7); if(viewMode==="day")x.setDate(x.getDate()+1); return stripTime(x); });

  const monthData = data?.days ? data : monthFallback;
  const weekData  = viewMode==="week" ? (data?.columns ? data : weekFallback) : null;
  const dayData   = viewMode==="day"  ? (data?.hours ? data : dayFallback) : null;

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
                {["flight","maintenance","training","vacation"].map(t=>(
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
