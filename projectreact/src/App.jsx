// @ts-nocheck
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import { AuthProvider, useAuth } from "./components/pages/LoginForm/AuthContext";
import ProtectedRoute from "./components/pages/LoginForm/ProtectedRoute";
import Navbar from "./components/Navbar";
import "./App.css";

// 페이지
import HomePage from "./components/pages/HomePage";

// 로그인 / 인증
import Login from "./components/pages/LoginForm/Login";
import Signup from "./components/pages/LoginForm/Signup";
import FindId from "./components/pages/LoginForm/FindId";
import FindPassword from "./components/pages/LoginForm/FindPassword";
import MyPage from "./components/pages/LoginForm/MyPage";

// 캘린더 / 채팅 / 위치
import CalendarPage from "./components/pages/calendars/CalendarsPage";
import ChatMain from "./components/pages/chatfrom/chatmain";
import LocationMain from "./components/pages/Location/LocationMain";

// 결재
import ApprovalList from "./components/pages/approval/ApprovalList";
import ApprovalView from "./components/pages/approval/ApprovalView";
import ApprovalEdit from "./components/pages/approval/ApprovalEdit";
import ApprovalWrite from "./components/pages/approval/ApprovalWrite";

// 게시판
import BoardPage from "./components/pages/boardForm/BoardPage";
import ViewPage from "./components/pages/boardForm/ViewPage";
import WritePage from "./components/pages/boardForm/WritePage";
import EditPage from "./components/pages/boardForm/EditPage";

// 시설
import FacilitiesList from "./components/pages/Facilities/FacilitiesList";
import FacilitiesWrite from "./components/pages/Facilities/FacilitiesWrite";
import FacilitiesEdit from "./components/pages/Facilities/FacilitiesEdit";
import FacilityReservationApproval from "./components/pages/Facilities/FacilityReservationApproval";
import MyFacilityReservationList from "./components/pages/Facilities/MyFacilityReservationList";

// 근태
import AttendanceList from "./components/pages/attendance/AttendanceList";
import AttendanceStats from "./components/pages/attendance/AttendanceStats";
import KakaoRedirect from "./components/pages/LoginForm/KakaoRedirect";
import GoogleRedirect from "./components/pages/LoginForm/GoogleRedirect";

// 공공데이터 키
const apiKey = import.meta.env.VITE_API_KEY;

/* ---------- 유틸 ---------- */
const toYYYYMMDD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${D}`;
};
const fmtLabelDate = (dateObj) => {
  return new Intl.DateTimeFormat("ko", {
    dateStyle: "medium",
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(dateObj);
};
const fmtTime = (raw) => {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  const hhmm = digits.slice(-4);
  const hh = hhmm.slice(0, 2);
  const mm = hhmm.slice(2, 4);
  if (hh && mm) return `${hh}:${mm}`;
  return String(raw);
};

/* 여러 API 필드 케이스를 흡수해서 우리 카드에 맞게 정규화 */
const normalizeFlightItem = (it) => {
  const airline =
    it.airlineKorean ||
    it.airlineNmK ||
    it.airlineNm ||
    it.airline ||
    it.company ||
    "";

  const flightNo =
    it.flightId || it.airFln || it.flightNo || it.flightNum || it.fnumber || "";

  const dep =
    it.depAirportKor ||
    it.depAirport ||
    it.depAirportNm ||
    it.boardingKor ||
    it.dep ||
    "";

  const arr =
    it.arrAirportKor ||
    it.arrAirport ||
    it.arrAirportNm ||
    it.arriveKor ||
    it.arr ||
    "";

  const timeRaw =
    it.std || it.etd || it.schDeptime || it.schTime || it.scheduleDateTime || it.time;

  return {
    title: `${airline} ${flightNo}`.trim(),
    route: [dep, arr].filter(Boolean).join(" → "),
    time: fmtTime(timeRaw),
  };
};

/* 특정 날짜(자정~자정)를 조회해서 정규화된 운항 리스트 반환 */
async function fetchFlightsForDate(dateObj) {
  const schDate = toYYYYMMDD(dateObj);
  const url = "https://apis.data.go.kr/1360000/AirInfoService/getAirInfo";
  try {
    const { data } = await axios.get(url, {
      params: {
        serviceKey: apiKey,
        numOfRows: 200,
        pageNo: 1,
        dataType: "JSON",
        fctm: schDate,
        schDate: schDate,
        icaoCode: "RKSS", // 김포
      },
      withCredentials: false,
    });

    const items =
      data?.response?.body?.items?.item ??
      data?.response?.body?.items ??
      [];

    const list = Array.isArray(items)
      ? items.map(normalizeFlightItem).filter((x) => x.title || x.route || x.time)
      : items
      ? [normalizeFlightItem(items)]
      : [];

    return list;
  } catch (err) {
    console.error("[fetchFlightsForDate] error:", err);
    return [];
  }
}

/* ------------------ 기상청 단기예보(getVilageFcst) 추가 ------------------ */

// 김포국제공항 좌표
const GM_LAT = 37.5586545;
const GM_LON = 126.7944739;

// KMA 단기예보(3시간 간격) 엔드포인트
const KMA_VILAGE_URL =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

/** 위경도 → KMA 단기예보 격자(nx, ny) 변환 (LCC DFS) */
function latLonToKmaGrid(lat, lon) {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0;      // 격자 간격(km)
  const SLAT1 = 30.0;    // 표준위도1
  const SLAT2 = 60.0;    // 표준위도2
  const OLON = 126.0;    // 기준경도
  const OLAT = 38.0;     // 기준위도
  const XO = 43;         // 기준점 X좌표
  const YO = 136;        // 기준점 Y좌표

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return { nx, ny };
}

function getKmaBaseDateTimeForVilage(now = new Date()) {
  const t = new Date(now);
  t.setMinutes(t.getMinutes() - 45); 

  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];
  let h = t.getHours();
  let baseH = baseHours[0];

  if (h < baseHours[0]) {
    t.setDate(t.getDate() - 1);
    baseH = baseHours[baseHours.length - 1]; // 23시
  } else {
    for (const hh of baseHours) {
      if (h >= hh) baseH = hh;
    }
  }
  const base_date = toYYYYMMDD(t);
  const base_time = String(baseH).padStart(2, "0") + "00";
  return { base_date, base_time };
}

async function fetchWeather() {
  try {
    const { nx, ny } = latLonToKmaGrid(GM_LAT, GM_LON);
    const { base_date, base_time } = getKmaBaseDateTimeForVilage();

    const { data } = await axios.get(KMA_VILAGE_URL, {
      params: {
        serviceKey: import.meta.env.VITE_KMA_KEY, 
        pageNo: 1,
        numOfRows: 200,
        dataType: "JSON",
        base_date,
        base_time,
        nx,
        ny,
      },
      withCredentials: false,
    });

    const items =
      data?.response?.body?.items?.item ??
      data?.response?.body?.items ??
      [];

    const byTime = {};
    for (const it of items) {
      const key = `${it.fcstDate}-${it.fcstTime}`;
      if (!byTime[key]) byTime[key] = {};
      byTime[key][it.category] = it.fcstValue;
    }
    const firstKey = Object.keys(byTime).sort()[0];
    const pick = byTime[firstKey] || {};

    const weather = {
      temp: pick.TMP != null ? Number(pick.TMP) : null,      // 기온(℃)
      skyCode: pick.SKY != null ? Number(pick.SKY) : null,   // 하늘상태
      ptyCode: pick.PTY != null ? Number(pick.PTY) : null,   // 강수형태
      windDeg: pick.VEC != null ? Number(pick.VEC) : null,   // 풍향
      windSpeed: pick.WSD != null ? Number(pick.WSD) : null, // 풍속
      humidity: pick.REH != null ? Number(pick.REH) : null,  // 습도
      base: `${base_date} ${base_time}`,
    };
    return weather;
  } catch (e) {
    console.error("[fetchWeather] KMA error:", e);
    return null;
  }
}

/* ---------- 라우트 ---------- */
function AppRoutes({ scheduleItems, scheduleDateLabel, weather, dataLoading, dataError }) {
 const { isLoading } = useAuth();
  const url = { jsp: "http://localhost:8081", react: "http://localhost:5173" };

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              imageUrl="/Generated.png"
              scheduleItems={scheduleItems}
              weather={weather}
              loading={dataLoading}
              error={dataError}
              /* 제목 옆에 실제 조회 날짜를 보여줌 */
              flightDateLabel={scheduleDateLabel}
              /* 날씨 카드 상단 도시 라벨 */
              placeLabel="서울(김포공항)"
              /* 날씨 포맷 콜백 */
              fmtBase={(d, t) => (d && t ? `${d} ${t}` : "--")}
              degToDirText={(deg) => {
                if (deg == null) return "-";
                const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
                return dirs[Math.round(((deg % 360) / 22.5)) % 16] || `${deg}°`;
              }}
              ptyToText={(pty) => (pty ? String(pty) : "-")}
            />
          }
        />

        {/* 로그인/인증 */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/FindId" element={<FindId />} />
        <Route path="/FindPassword" element={<FindPassword />} />
        <Route path="/MyPage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/kakao-redirect" element={<KakaoRedirect />} />
        <Route path="/google-redirect" element={<GoogleRedirect />} />


        {/* 캘린더 */}
        <Route path="/Calendars" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />

        {/* 결재 */}
        <Route path="/ApprovalList" element={<ProtectedRoute><ApprovalList /></ProtectedRoute>} />
        <Route path="/ApprovalView/:num" element={<ProtectedRoute><ApprovalView /></ProtectedRoute>} />
        <Route path="/ApprovalWrite" element={<ProtectedRoute><ApprovalWrite /></ProtectedRoute>} />
        <Route path="/ApprovalEdit" element={<ProtectedRoute><ApprovalEdit /></ProtectedRoute>} />

        {/* 게시판 */}
        <Route path="/BoardPage">
          <Route path=":page/:searchField?/:searchWord?" element={<ProtectedRoute><BoardPage baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/ViewPage">
          <Route path=":id" element={<ProtectedRoute><ViewPage baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/WritePage" element={<ProtectedRoute><WritePage baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/EditPage">
          <Route path=":id" element={<ProtectedRoute><EditPage baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>

        {/* 채팅 / 위치 */}
        <Route path="/ChatMain" element={<ProtectedRoute><ChatMain /></ProtectedRoute>} />
        <Route path="/LocationMain" element={<LocationMain />} />

        {/* 시설 */}
        <Route path="/FacilitiesList/:page/:searchField?/:searchWord?" element={<ProtectedRoute><FacilitiesList baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/FacilityReservationApproval/:page/:searchField?/:searchWord?" element={<ProtectedRoute><FacilityReservationApproval baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/MyFacilityReservationList/:employeeId/:page" element={<ProtectedRoute><MyFacilityReservationList baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/FacilitiesWrite" element={<ProtectedRoute><FacilitiesWrite baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/FacilitiesEdit/:facilityId" element={<ProtectedRoute><FacilitiesEdit baseUrl={url.jsp} /></ProtectedRoute>} />

        {/* 근태 */}
        <Route path="/AttendanceList/:page/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceList baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/AttendanceList/:page/date/:date/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceList baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/AttendanceStats/:page/month/:month/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceStats baseUrl={url.jsp} /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

/* ---------- App ---------- */
function App() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleDateLabel, setScheduleDateLabel] = useState(""); // 실제 조회일
  const [weather, setWeather] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoadingData(true);
      setDataError(null);

      try {
        // 운항정보: 최근 날짜부터 과거로 탐색해서 처음 데이터 있는 날 채택
        let best = [];
        let bestLabel = "";

        for (let back = 0; back <= 20; back++) {
          const d = new Date();
          d.setDate(d.getDate() - back);

          const list = await fetchFlightsForDate(d);

          if (list.length > 0) {
            best = list.slice(0, 10);
            bestLabel = fmtLabelDate(d);
            break;
          }
        }

        if (mounted) {
          setScheduleItems(best);
          setScheduleDateLabel(bestLabel);
        }

        // 기상청 단기예보
        const wx = await fetchWeather();
        if (mounted) setWeather(wx ?? null);
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
        if (mounted) setDataError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes
          scheduleItems={scheduleItems}
          scheduleDateLabel={scheduleDateLabel}
          weather={weather}
          dataLoading={loadingData}
          dataError={dataError}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
