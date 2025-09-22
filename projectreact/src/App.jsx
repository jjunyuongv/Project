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
  // 202509211130 / 20250921 1130 / 1130 / 11:30 등 웬만하면 처리
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

  // (기존에 쓰던 엔드포인트를 그대로 사용하면서, 유연하게 파라미터를 여러 개 넣어 둡니다.)
  const url = "https://apis.data.go.kr/1360000/AirInfoService/getAirInfo";

  try {
    const { data } = await axios.get(url, {
      params: {
        serviceKey: apiKey,
        numOfRows: 200,
        pageNo: 1,
        dataType: "JSON",

        // 아래 파라미터는 API가 받는/무시하는 경우가 있어도 해가 되지 않습니다.
        // (일부 케이스: fctm=yyyymmdd, 또는 schDate=yyyymmdd 등)
        fctm: schDate,
        schDate: schDate,

        // 공항: 김포(RKSS). 필요시 바꿔도 OK
        icaoCode: "RKSS",
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

/* 날씨(기상청)도 기존 로직 유지 */
async function fetchWeather() {
  // 여기에 이미 적용된 당신의 날씨 API 호출이 있다면 그대로 쓰세요.
  // (기존 코드에서 사용하던 URL/파라미터 유지)
  return null;
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
              /* 날씨 포맷 콜백 (이미 사용 중인 포맷 함수가 있으면 그대로) */
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
        /* 운항정보: 당일부터 과거 14일 까지 거슬러 올라가며
           제일 먼저 데이터가 나오는 날짜의 결과를 채택 */
        let best = [];
        let bestLabel = "";

        for (let back = 0; back <= 20; back++) {
          const d = new Date();
          d.setDate(d.getDate() - back);

          const list = await fetchFlightsForDate(d);

          if (list.length > 0) {
            best = list.slice(0, 10); // 너무 많으면 10개만
            bestLabel = fmtLabelDate(d); // 카드 제목 옆에 표시
            break;
          }
        }

        if (mounted) {
          setScheduleItems(best);
          setScheduleDateLabel(bestLabel); // 없으면 빈 문자열
        }

        // 날씨(있으면 사용)
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
