import { Outlet, Link, useLocation } from "react-router-dom";
import "../styles/userLayout.css";
import { FaHome, FaVideo, FaUsers } from "react-icons/fa";
import ChatBox from "../components/ChatBox";

export default function UserLayout() {

  const location = useLocation();
  const userId = localStorage.getItem("userId");

  return (

    <div className="dashboard-container">

      {/* ✅ SIDEBAR (Desktop Only) */}
      <div className="sidebar">

        <div className="logo">
          <h2>VoiceMeet</h2>
        </div>

        <ul className="menu">

          <li className={location.pathname === "/user/dashboard" ? "active" : ""}>
            <Link to="/user/dashboard">
              <FaHome /> Dashboard
            </Link>
          </li>

          <li className={location.pathname === "/user/meetings" ? "active" : ""}>
            <Link to="/user/meetings">
              <FaUsers /> My Meetings
            </Link>
          </li>

          <li className={location.pathname === "/user/join-meeting" ? "active" : ""}>
            <Link to="/user/join-meeting">
              <FaVideo /> Join Meeting
            </Link>
          </li>

        </ul>

        {/* CHAT (Desktop only) */}
        

      </div>


      {/* ✅ MAIN AREA */}
      <div className="main-area">

        {/* TOPBAR */}
        <div className="topbar">

          <h3>Welcome Back</h3>

          <div className="topbar-right">

            <span className="notification">🔔</span>

            <div className="profile">

              <img
                src="https://i.pravatar.cc/40"
                alt="profile"
              />

              <div>
                <b>{userId}</b>
                <p>Employee</p>
              </div>

            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="content">
          <Outlet />
        </div>

      </div>


      {/* ✅ MOBILE BOTTOM NAV */}
      <div className="bottom-nav">

        <Link to="/user/dashboard"
          className={location.pathname === "/user/dashboard" ? "active" : ""}>
          <FaHome />
          <span>Home</span>
        </Link>

        <Link to="/user/meetings"
          className={location.pathname === "/user/meetings" ? "active" : ""}>
          <FaUsers />
          <span>Meetings</span>
        </Link>

        <Link to="/user/join-meeting"
          className={location.pathname === "/user/join-meeting" ? "active" : ""}>
          <FaVideo />
          <span>Join</span>
        </Link>

      </div>

    </div>
  );
}