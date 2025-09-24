// @ts-nocheck
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import { useAuth } from "./components/pages/LoginForm/AuthContext";
import ProtectedRoute from "./components/pages/LoginForm/ProtectedRoute";
import Navbar from "./components/Navbar";
import "./App.css";

/* ---------- 페이지들 ---------- */
import HomePage from "./components/pages/HomePage";

/* 로그인 / 인증 */
import Login from "./components/pages/LoginForm/Login";
import Signup from "./components/pages/LoginForm/Signup";
import FindId from "./components/pages/LoginForm/FindId";
import FindPassword from "./components/pages/LoginForm/FindPassword";
import MyPage from "./components/pages/LoginForm/MyPage";
import KakaoRedirect from "./components/pages/LoginForm/KakaoRedirect";
import GoogleRedirect from "./components/pages/LoginForm/GoogleRedirect";

/* 캘린더 / 채팅 / 위치 */
import CalendarPage from "./components/pages/calendars/CalendarsPage";
import ChatMain from "./components/pages/chatfrom/ChatMain";
import LocationMain from "./components/pages/Location/LocationMain";

/* 결재 */
import ApprovalList from "./components/pages/approval/ApprovalList";
import ApprovalView from "./components/pages/approval/ApprovalView";
import ApprovalEdit from "./components/pages/approval/ApprovalEdit";
import ApprovalWrite from "./components/pages/approval/ApprovalWrite";

/* 게시판 */
import BoardPage from "./components/pages/boardForm/BoardPage";
import ViewPage from "./components/pages/boardForm/ViewPage";
import WritePage from "./components/pages/boardForm/WritePage";
import EditPage from "./components/pages/boardForm/EditPage";

/* 시설 */
import FacilitiesList from "./components/pages/Facilities/FacilitiesList";
import FacilitiesWrite from "./components/pages/Facilities/FacilitiesWrite";
import FacilitiesEdit from "./components/pages/Facilities/FacilitiesEdit";
import FacilityReservationApproval from "./components/pages/Facilities/FacilityReservationApproval";
import MyFacilityReservationList from "./components/pages/Facilities/MyFacilityReservationList";

/* 근태 */
import AttendanceList from "./components/pages/attendance/AttendanceList";
import AttendanceStats from "./components/pages/attendance/AttendanceStats";

/* ---------- 환경변수(공공데이터) ---------- */
const PUBLIC_API_KEY =
  import.meta.env.VITE_PUBLIC_API_KEY || import.meta.env.VITE_API_KEY;

/* ---------- 유틸 ---------- */
const toYYYYMMDD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${D}`;
};

const fmtLabelDate = (dateObj) =>
  new Intl.DateTimeFormat("ko", {
    dateStyle: "medium",
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(dateObj);

const fmtTime = (raw) => {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  const hhmm = digits.slice(-4);
  const hh = hhmm.slice(0, 2);
  const mm = hhmm.slice(2, 4);
  if (hh && mm) return `${hh}:${mm}`;
  return String(raw);
};

/* 여러 API 필드를 흡수해서 정규화 */
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

/* 특정 날짜 운항 정보 */
async function fetchFlightsForDate(dateObj) {
  const schDate = toYYYYMMDD(dateObj);
  const url = "https://apis.data.go.kr/1360000/AirInfoService/getAirInfo";
  try {
    const { data } = await axios.get(url, {
      params: {
        serviceKey: PUBLIC_API_KEY,
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

/* ------------------ 기상청 단기예보 ------------------ */
const GM_LAT = 37.5586545;
const GM_LON = 126.7944739;
const KMA_VILAGE_URL =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

function latLonToKmaGrid(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
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
    baseH = baseHours[baseHours.length - 1];
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
        serviceKey: import.meta.env.VITE_KMA_KEY, // 환경변수 필요
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

    return {
      temp: pick.TMP != null ? Number(pick.TMP) : null,
      skyCode: pick.SKY != null ? Number(pick.SKY) : null,
      ptyCode: pick.PTY != null ? Number(pick.PTY) : null,
      windDeg: pick.VEC != null ? Number(pick.VEC) : null,
      windSpeed: pick.WSD != null ? Number(pick.WSD) : null,
      humidity: pick.REH != null ? Number(pick.REH) : null,
      base: `${base_date} ${base_time}`,
    };
  } catch (e) {
    console.error("[fetchWeather] KMA error:", e);
    return null;
  }
}

/* ---------- 라우트 ---------- */
function AppRoutes({
  scheduleItems,
  scheduleDateLabel,
  weather,
  dataLoading,
  dataError,
}) {
  const { isLoading } = useAuth();

  // 백엔드 베이스 URL
  const baseUrl = "/api";

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>
    );

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
              flightDateLabel={scheduleDateLabel}
              placeLabel="서울(김포공항)"
              fmtBase={(d, t) => (d && t ? `${d} ${t}` : "--")}
              degToDirText={(deg) => {
                if (deg == null) return "-";
                const dirs = [
                  "N",
                  "NNE",
                  "NE",
                  "ENE",
                  "E",
                  "ESE",
                  "SE",
                  "SSE",
                  "S",
                  "SSW",
                  "SW",
                  "WSW",
                  "W",
                  "WNW",
                  "NW",
                  "NNW",
                ];
                return (
                  dirs[Math.round(((deg % 360) / 22.5)) % 16] || `${deg}°`
                );
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
        <Route
          path="/MyPage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route path="/kakao-redirect" element={<KakaoRedirect />} />
        <Route path="/google-redirect" element={<GoogleRedirect />} />

        {/* 캘린더 */}
        <Route
          path="/Calendars"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        {/* 결재 */}
        <Route
          path="/ApprovalList"
          element={
            <ProtectedRoute>
              <ApprovalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ApprovalView/:num"
          element={
            <ProtectedRoute>
              <ApprovalView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ApprovalWrite"
          element={
            <ProtectedRoute>
              <ApprovalWrite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ApprovalEdit"
          element={
            <ProtectedRoute>
              <ApprovalEdit />
            </ProtectedRoute>
          }
        />

        {/* 게시판 */}
        <Route
          path="/BoardPage/:page/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <BoardPage baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ViewPage/:id"
          element={
            <ProtectedRoute>
              <ViewPage baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/WritePage"
          element={
            <ProtectedRoute>
              <WritePage baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditPage/:id"
          element={
            <ProtectedRoute>
              <EditPage baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />

        {/* 채팅 / 위치 */}
        <Route
          path="/ChatMain"
          element={
            <ProtectedRoute>
              <ChatMain />
            </ProtectedRoute>
          }
        />
        <Route path="/LocationMain" element={<LocationMain />} />

        {/* 시설 */}
        <Route
          path="/FacilitiesList/:page/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <FacilitiesList baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/FacilityReservationApproval/:page/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <FacilityReservationApproval baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MyFacilityReservationList/:employeeId/:page"
          element={
            <ProtectedRoute>
              <MyFacilityReservationList baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/FacilitiesWrite"
          element={
            <ProtectedRoute>
              <FacilitiesWrite baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/FacilitiesEdit/:facilityId"
          element={
            <ProtectedRoute>
              <FacilitiesEdit baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />

        {/* 근태 */}
        <Route
          path="/AttendanceList/:page/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <AttendanceList baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AttendanceList/:page/date/:date/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <AttendanceList baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AttendanceStats/:page/month/:month/:searchField?/:searchWord?"
          element={
            <ProtectedRoute>
              <AttendanceStats baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

/* ---------- App ---------- */
function App() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleDateLabel, setScheduleDateLabel] = useState("");
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
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes
        scheduleItems={scheduleItems}
        scheduleDateLabel={scheduleDateLabel}
        weather={weather}
        dataLoading={loadingData}
        dataError={dataError}
      />
    </BrowserRouter>
  );
}

export default App;
