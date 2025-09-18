import { useRef, useState } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ✅ 목적지: 서울 서대문구 연세로 8-1 버티고타워 7층
const DEST = { lat: 37.5563412561961, lng: 126.937303024246 };
const ADDRESS = "서울 서대문구 연세로 8-1 버티고타워 7층";

// ▶️ 맵 크기 축소: 높이 360px, 가로는 부모 컨테이너 100%
const mapContainerStyle = { width: "100%", height: "360px" };

// ▶️ 맵 옵션
const mapOptions = {
  gestureHandling: "greedy",
  fullscreenControl: true,
  mapTypeControl: true,
  streetViewControl: false,
};

// ▶️ 공통 섹션 너비 제한(중앙 정렬)
const sectionNarrow = {
  maxWidth: 720,
  margin: "0 auto",
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

      {/* 상단 안내 + 버튼 영역: 폭 제한 */}
      <div
        style={{
          ...sectionNarrow,
          display: "flex",
          gap: 8,
          alignItems: "center",
          margin: "8px auto 12px",
          padding: "0 8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 14, color: "#555" }}>{ADDRESS}</div>

        {/* ▶️ 소프트 아웃라인 버튼 (톤 다운) */}
        <a
          href={directionsUrl(DEST.lat, DEST.lng)}
          target="_blank"
          rel="noreferrer"
          title="Google 지도에서 길찾기 열기"
          aria-label="Google 지도 길찾기 열기"
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: 10,
            background: "#eef2ff",        // 연한 라벤더-블루
            color: "#1e40af",             // 진한 블루 텍스트
            border: "1px solid #c7d2fe",  // 옅은 보더
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          길찾기
        </a>
      </div>

      {/* 지도 카드: 폭 720px 제한 + 중앙 정렬 */}
      <div
        style={{
          ...sectionNarrow,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
        }}
      >
        <GoogleMap
          onLoad={(m) => (mapRef.current = m)}
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={17}
          options={mapOptions}
        >
          {/* 목적지 마커만 표시 (클릭 시 길찾기) */}
          <MarkerF
            position={DEST}
            title={ADDRESS}
            onClick={() => window.open(directionsUrl(DEST.lat, DEST.lng), "_blank")}
          />
        </GoogleMap>
      </div>
    </div>
  );
}
