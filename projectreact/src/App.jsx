// @ts-nocheck
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/pages/LoginForm/ProtectedRoute';
import { AuthProvider, useAuth } from './components/pages/LoginForm/AuthContext'; // useAuth 추가

import Navbar from './components/Navbar';
import HomePage from './components/pages/HomePage';
import BoardPage from './components/pages/boardForm/BoardPage';
import ViewPage from './components/pages/boardForm/ViewPage';
import WritePage from './components/pages/boardForm/WritePage';
import Calendars from './components/pages/calendars/calendars';
import ChatMain from './components/pages/chatfrom/chatmain';
import Login from './components/pages/LoginForm/Login';
import Signup from './components/pages/LoginForm/Signup';
import ApprovalList from './components/pages/approval/ApprovalList';
import ApprovalView from './components/pages/approval/ApprovalView';
import ApprovalEdit from './components/pages/approval/ApprovalEdit';
import ApprovalWrite from './components/pages/Approval/ApprovalWrite';
import FindId from './components/pages/LoginForm/FindId';
import FindPassword from './components/pages/LoginForm/FindPassword';
import MyPage from './components/pages/LoginForm/MyPage';

import './App.css';
import FacilitiesList from './components/pages/Facilities/FacilitiesList';
import FacilityReservationApproval from './components/pages/Facilities/FacilityReservationApproval';
import MyFacilityReservationList from './components/pages/Facilities/MyFacilityReservationList';
import FacilitiesWrite from './components/pages/Facilities/FacilitiesWrite';
import FacilitiesEdit from './components/pages/Facilities/FacilitiesEdit';
import FacilitiesManage from './components/pages/Facilities/FacilitiesManage';
import AttendanceList from './components/pages/attendance/AttendanceList';
import AttendanceStats from './components/pages/attendance/AttendanceStats';
import LocationMain from './components/pages/Location/LocationMain';

// 새로운 라우터 컴포넌트
const AppRoutes = () => {
  const { isLoading } = useAuth();

  const url = {
    jsp: "http://localhost:8081",
    react: "http://localhost:5173"
  }

  // isLoading이 true일 때는 로딩 중 화면을 보여줍니다.
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>로딩 중...</div>;
  }

  // 로딩이 완료되면 라우터를 렌더링합니다.
  return (
    <>
      <Navbar />
      <Routes>
        {/* 윤아 */}
        <Route path="/" element={<HomePage imageUrl="/Generated.png" />} />
        <Route path="/Calendars" element={<ProtectedRoute><Calendars /></ProtectedRoute>} />

        {/* 준영 */}
        <Route path="/ApprovalList" element={<ProtectedRoute><ApprovalList /></ProtectedRoute>} />
        <Route path='/ApprovalView/:num' element={<ProtectedRoute><ApprovalView /></ProtectedRoute>} />
        <Route path="/ApprovalWrite" element={<ProtectedRoute><ApprovalWrite /></ProtectedRoute>} />
        <Route path="/ApprovalEdit" element={<ProtectedRoute><ApprovalEdit /></ProtectedRoute>} />
        <Route path="/ChatMain" element={<ProtectedRoute><ChatMain /></ProtectedRoute>} />
        <Route path="/LocationMain" element={<LocationMain />} />

        {/* 현석 */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/FindId" element={<FindId />} />
        <Route path="/FindPassword" element={<FindPassword />} />
        <Route path="/MyPage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} /> 

        {/* 혜원 */}
        <Route path="/BoardPage" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/ViewPage" element={<ProtectedRoute><ViewPage /></ProtectedRoute>} />
        <Route path="/WritePage" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />

        {/* 현준 */}
        <Route path="/FacilitiesList" >
          <Route path=":page/:searchField?/:searchWord?" element={<ProtectedRoute><FacilitiesList baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/FacilitiesManage" >
          <Route path=":page/:searchField?/:searchWord?" element={<ProtectedRoute><FacilitiesManage baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/FacilityReservationApproval" >
          <Route path=":page/:searchField?/:searchWord?" element={<ProtectedRoute><FacilityReservationApproval baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/MyFacilityReservationList" >
          <Route path=":employeeId/:page" element={<ProtectedRoute><MyFacilityReservationList baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
        <Route path="/FacilitiesWrite" element={<ProtectedRoute><FacilitiesWrite baseUrl={url.jsp} /></ProtectedRoute>} />
        <Route path="/FacilitiesEdit" >
          <Route path=":facilityId" element={<ProtectedRoute><FacilitiesEdit baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>

        <Route path="/AttendanceList" >
          <Route path=":page/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceList baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
          <Route path=":page/date/:date/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceList baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>

        <Route path="/AttendanceStats" >
          <Route path=":page/month/:month/:searchField?/:searchWord?" element={<ProtectedRoute><AttendanceStats baseUrl={url.jsp} /></ProtectedRoute>} ></Route>
        </Route>
      </Routes>
    </>
  );
};

// 최상위 App 컴포넌트
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;