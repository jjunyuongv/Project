import React, { useMemo } from 'react';
import PlaneTakeoff from 'lucide-react/dist/esm/icons/plane-takeoff.js';
import Clock         from 'lucide-react/dist/esm/icons/clock.js';
import MapPin        from 'lucide-react/dist/esm/icons/map-pin.js';
import './home.css';

export default function HomePage({ imageUrl, weather, scheduleItems = [] }) {
  const todayStr = useMemo(
    () =>
      new Intl.DateTimeFormat('ko', {
        dateStyle: 'full',
        timeZone: 'Asia/Seoul',
      }).format(new Date()),
    []
  );

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
            <div className="ap-card">
              <div className="ap-card-title">
                <Clock size={16} /> 운항정보
              </div>

              {scheduleItems.length ? (
                <ul className="ap-list">
                  {scheduleItems.map((it, i) => (
                    <li key={i}>
                      <div className="ap-list-main">
                        <div className="ap-list-title">{it.title}</div>
                        <div className="ap-list-sub">{it.location || ''}</div>
                      </div>
                      <div className="ap-list-time">{it.time || ''}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ap-skeleton">
                  <div />
                  <div />
                  <div />
                </div>
              )}
            </div>

            <div className="ap-card">
              <div className="ap-card-title">
                <MapPin size={16} /> {weather?.city || '도시 미지정'}
              </div>

              {weather ? (
                <div className="ap-weather">
                  <div className="ap-weather-temp">
                    {typeof weather.temp === 'number' ? `${weather.temp}°` : '—'}
                  </div>
                  <div className="ap-weather-meta">
                    <div>{weather.condition}</div>
                    <div>
                      최고 {weather.high}° · 최저 {weather.low}°
                    </div>
                  </div>
                  <div className="ap-weather-date">{todayStr}</div>
                </div>
              ) : (
                <div className="ap-skeleton">
                  <div />
                  <div />
                  <div />
                </div>
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
