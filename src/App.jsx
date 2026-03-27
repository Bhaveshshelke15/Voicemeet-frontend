
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

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


// 🔥 GLOBAL MEETING HANDLER
function MeetingRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const activeMeeting = localStorage.getItem("activeMeeting");
    const role = localStorage.getItem("role"); // "admin" or "user"

    // If meeting active and user NOT already in meeting page
    if (
      activeMeeting &&
      !location.pathname.includes("/meeting/")
    ) {
      if (role === "admin") {
        navigate(`/admin/meeting/${activeMeeting}`);
      } else if (role === "user") {
        navigate(`/user/meeting/${activeMeeting}`);
      }
    }
  }, [location, navigate]);

  return null;
}


function App() {
  return (
    <HashRouter>

      {/* 🔥 AUTO REJOIN HANDLER */}
      <MeetingRedirectHandler />

      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/admin/login" />} />

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

          {/* 🔥 VOICE ROOM */}
          <Route path="meeting/:meetingId" element={<AdminVoiceRoom />} />

          <Route path="recordings" element={<AdminRecordings />} />

        </Route>

        {/* USER ROUTES */}
        <Route path="/user" element={<UserLayout />}>

          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="join-meeting" element={<JoinMeeting />} />
          <Route path="meeting-room" element={<MeetingRoom />} />
          <Route path="meetings" element={<UserMeetings />} />

          {/* 🔥 VOICE ROOM */}
          <Route path="meeting/:meetingId" element={<UserVoiceRoom />} />

        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;

