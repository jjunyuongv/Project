import { useRef, useState } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import "./LocationMain.css"; // ← CSS 분리 후 임포트

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ✅ 목적지: 서울 서대문구 연세로 8-1 버티고타워 7층
const DEST = { lat: 37.5563412561961, lng: 126.937303024246 };
const ADDRESS = "서울 서대문구 연세로 8-1 버티고타워 7층";

// ▶️ 맵 옵션
const mapOptions = {
  gestureHandling: "greedy",
  fullscreenControl: true,
  mapTypeControl: true,
  streetViewControl: false,
};

export default function LocationMain() {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: MAPS_KEY });
  const mapRef = useRef(null);
  const [center] = useState(DEST);

  const directionsUrl = (lat, lng) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

  if (loadError) return <div>지도를 불러오는 중 오류가 발생했습니다.</div>;
  if (!isLoaded) return <div>지도를 불러오는 중…</div>;

  return (
    <div className="boardpage">
      <div className="hero">
        <div className="hero__overlay" />
        <h1 className="hero__title">오시는길</h1>
      </div>

      {/* 상단 안내 + 버튼 영역 */}
      <div className="section-narrow location-header">
        <div className="location-address">{ADDRESS}</div>
        <a
          href={directionsUrl(DEST.lat, DEST.lng)}
          target="_blank"
          rel="noopener noreferrer"
          title="Google 지도에서 길찾기 열기"
          aria-label="Google 지도 길찾기 열기"
          className="directions-btn"
        >
          길찾기
        </a>
      </div>

      {/* 지도 카드 */}
      <div className="section-narrow map-card">
        <GoogleMap
          onLoad={(m) => (mapRef.current = m)}
          mapContainerClassName="map-container"   // ← 스타일 객체 대신 클래스 사용
          center={center}
          zoom={17}
          options={mapOptions}
        >
          {/* 목적지 마커만 표시 (클릭 시 길찾기) */}
          <MarkerF
            position={DEST}
            title={ADDRESS}
            onClick={() =>
              window.open(directionsUrl(DEST.lat, DEST.lng), "_blank", "noopener,noreferrer")
            }
          />
        </GoogleMap>
      </div>
    </div>
  );
}
