import { HashRouter, Routes, Route } from "react-router-dom";

// AUTH
import AdminLogin from "./pages/admin/AdminLogin";
import UserLogin from "./pages/user/UserLogin";

// LAYOUTS
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateEmployee from "./pages/admin/CreateEmployee";
import CreateMeeting from "./pages/admin/CreateMeeting";
import InviteUser from "./pages/admin/InviteUser";
import Employees from "./pages/admin/Employees";
import AdminVoiceRoom from "./pages/admin/AdminVoiceRoom";
import AdminRecordings from "./pages/admin/AdminRecordings";
import AdminChat from "./pages/admin/AdminChat";

// USER PAGES
import UserDashboard from "./pages/user/Dashboard";
import JoinMeeting from "./pages/user/JoinMeeting";
import MeetingRoom from "./pages/user/MeetingRoom";
import UserMeetings from "./pages/user/UserMeetings";
import UserVoiceRoom from "./pages/user/UserVoiceRoom";

import SelectRole from "./pages/SelectRole";

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* ✅ FIRST SCREEN */}
        <Route path="/" element={<SelectRole />} />

        {/* LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-user" element={<CreateEmployee />} />
          <Route path="create-meeting" element={<CreateMeeting />} />
          <Route path="invite-user" element={<InviteUser />} />
          <Route path="employees" element={<Employees />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="meeting/:meetingId" element={<AdminVoiceRoom />} />
          <Route path="recordings" element={<AdminRecordings />} />
        </Route>

        {/* USER ROUTES */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="join-meeting" element={<JoinMeeting />} />
          <Route path="meeting-room" element={<MeetingRoom />} />
          <Route path="meetings" element={<UserMeetings />} />
          <Route path="meeting/:meetingId" element={<UserVoiceRoom />} />
        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;