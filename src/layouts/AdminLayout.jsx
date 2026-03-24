import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/adminDashboard.css";

export default function AdminLayout() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dashboard-container">

      {/* 🔥 MOBILE TOP BAR */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        <h3>Admin Panel</h3>
      </div>

      {/* 🔥 SIDEBAR */}
      <div className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
        <Sidebar closeSidebar={() => setIsOpen(false)} />
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="main">
        <Outlet />
      </div>

    </div>
  );
}