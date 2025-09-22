import React, { useMemo } from 'react';
import PlaneTakeoff from 'lucide-react/dist/esm/icons/plane-takeoff.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import MapPin from 'lucide-react/dist/esm/icons/map-pin.js';
import './home.css';

export default function HomePage({
  imageUrl,
  scheduleItems,
  weather,
  loading,
  error,
  placeLabel = '도시 미지정',
  fmtBase = (d, t) => `${d ?? '-'} ${t ?? '-'}`,
  degToDirText = (d) => d,
  ptyToText = (p) => p,
  flightDateLabel = '' // ← 추가: 운항정보 실제 조회 날짜
}) {
  const todayStr = useMemo(
    () =>
      new Intl.DateTimeFormat('ko', {
        dateStyle: 'full',
        timeZone: 'Asia/Seoul',
      }).format(new Date()),
    []
  );

  const flights = Array.isArray(scheduleItems) ? scheduleItems : [];
  const noFlight = !loading && !error && flights.length === 0;

  const weatherRows = (() => {
    if (!weather) return [];
    const t = weather.temp != null ? `${weather.temp}℃` : '-';
    const dir = weather.windDir != null ? `${degToDirText(weather.windDir)} (${weather.windDir}°)` : '-';
    const spd = weather.windSpeed != null ? `${weather.windSpeed} m/s` : '-';
    const sky = ptyToText(weather.pty);
    return [
      { label: '관측시각', value: fmtBase(weather.baseDate, weather.baseTime) },
      { label: '기온',     value: t },
      { label: '풍향/풍속', value: `${dir} / ${spd}` },
      { label: '강수형태', value: sky },
    ];
  })();

  return (
    <div className="ap-root">
      <main className="ap-container ap-main">
        <div className="ap-grid">
          <section className="ap-hero">
            {imageUrl ? (
              <div
                className="ap-hero-bg"
                style={{ backgroundImage: `url('${imageUrl}')` }}
                aria-label="비행기 이미지"
              />
            ) : (
              <div className="ap-hero-empty">
                <PlaneTakeoff size={56} />
              </div>
            )}
          </section>

          <aside className="ap-sidebar">
            {/* 운항정보 */}
            <div className="ap-card">
              <div className="ap-card-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span><Clock size={16} /> 운항정보</span>
                {flightDateLabel && <span style={{fontSize:12,color:'#64748b'}}>· {flightDateLabel}</span>}
              </div>

              {loading ? (
                <div className="ap-skeleton"><div/><div/><div/></div>
              ) : error ? (
                <div className="ap-empty">운항 정보를 불러오지 못했습니다. 다시 시도해 주세요.</div>
              ) : noFlight ? (
                <div className="ap-empty">최근 날짜에도 운항데이터가 없었습니다.</div>
              ) : (
                <ul className="ap-list">
                  {flights.map((it, i) => (
                    <li key={i}>
                      <div className="ap-list-main">
                        <div className="ap-list-title">{it.title || '편명 미상'}</div>
                        <div className="ap-list-sub">{it.route || ''}</div>
                      </div>
                      <div className="ap-list-time">{it.time || ''}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 날씨 */}
            <div className="ap-card">
              <div className="ap-card-title">
                <MapPin size={16} /> {placeLabel}
              </div>

              {loading ? (
                <div className="ap-skeleton"><div/><div/><div/></div>
              ) : error ? (
                <div className="ap-empty">날씨 정보를 불러오지 못했습니다. 다시 시도해 주세요.</div>
              ) : weather ? (
                <div>
                  {weatherRows.map((r, i) => (
                    <div className="ap-weather-row" key={i}>
                      <span style={{color:'#475569', minWidth:72}}>{r.label}</span>
                      <strong>{r.value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ap-empty">날씨 정보가 없습니다.</div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="ap-footer">
        <div className="ap-container ap-footer-inner">
          <span className="ap-footer-left">
            <PlaneTakeoff size={14} /> © {new Date().getFullYear()} AirOps
          </span>
        </div>
      </footer>
    </div>
  );
}