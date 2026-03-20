//import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import UserLogin from "./pages/user/UserLogin";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateEmployee from "./pages/admin/CreateEmployee";
import CreateMeeting from "./pages/admin/CreateMeeting";

import UserDashboard from "./pages/user/Dashboard";
import JoinMeeting from "./pages/user/JoinMeeting";
import MeetingRoom from "./pages/user/MeetingRoom";
import Dashboard from "./pages/admin/AdminDashboard";
import InviteUser from "./pages/admin/InviteUser";
import Employees from "./pages/admin/Employees";
import UserMeetings from "./pages/user/UserMeetings";
import AdminVoiceRoom from "./pages/admin/AdminVoiceRoom";

import UserVoiceRoom from "./pages/user/UserVoiceRoom";

import AdminRecordings from "./pages/admin/AdminRecordings";










function App() {
  return (
    <HashRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/admin/login" />} />

        {/* LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-user" element={<CreateEmployee />} />
          <Route path="create-meeting" element={<CreateMeeting />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/invite-user" element={<InviteUser />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route
 path="/admin/meeting/:meetingId"
 element={<AdminVoiceRoom />}
/>


<Route
 path="/admin/recordings"
 element={<AdminRecordings />}
/>
         
        </Route>

        {/* USER */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="join-meeting" element={<JoinMeeting />} />
          <Route path="meeting-room" element={<MeetingRoom />} />
          <Route path="/user/meetings" element={<UserMeetings />} />
          <Route path="/user/meeting/:meetingId" element={<UserVoiceRoom/>}/>

      


  
        </Route>

      </Routes>
   </HashRouter>
  );
}

export default App;