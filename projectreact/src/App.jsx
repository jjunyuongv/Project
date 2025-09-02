import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ApprovalList from './components/pages/approval/ApprovalList';
import ApprovalView from './components/pages/approval/ApprovalView';
import Navbar from './components/Navbar';
import HomePage from './components/pages/HomePage';
import BoardPage from './components/pages/boardForm/BoardPage';
import ApprovalEdit from './components/pages/approval/ApprovalEdit';
import ViewPage from './components/pages/boardForm/ViewPage';
import WritePage from './components/pages/boardForm/WritePage';
import Calendars from './components/pages/calendars/calendars';
import './App.css'
import ReportList from './components/pages/reportform/ReportList';
import ReportWrite from './components/pages/reportform/ReportWrite';
import ReportApproval from './components/pages/reportform/ReportApproval';
import Login from './components/pages/reportform/Login';
import ChatMain from './components/pages/chatfrom/chatmain';
import ApprovalWrite from './components/pages/approval/ApprovalWrite';

function App() {

  return (
   <BrowserRouter>
      <Navbar />
      <Routes>
        
        {/* 윤아 */}
        <Route path="/" element={<HomePage imageUrl="/Generated.png" />} />
        <Route path="/Calendars" element={<Calendars />} />
        
        {/* 준영 */}
        <Route path="/ApprovalList" element={<ApprovalList />} />
        <Route path='/ApprovalView'>
            <Route path=':num' element={<ApprovalView />}/>
          </Route>
        <Route path="/ApprovalWrite" element={<ApprovalWrite />} />
        <Route path="/ApprovalEdit" element={<ApprovalEdit />} />
        <Route path="/ChatMain" element={<ChatMain />} />
        
        {/* 혜원 */}
        <Route path="/BoardPage" element={<BoardPage />} />
        <Route path="/ViewPage" element={<ViewPage />} />
        <Route path="/WritePage" element={<WritePage />} />

        {/* 현석 */}
        <Route path="/ReportList" element={<ReportList />} />
        <Route path="/ReportWrite" element={<ReportWrite />} />
        <Route path="/ReportApproval" element={<ReportApproval />} />
        <Route path="/Login" element={<Login />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App
