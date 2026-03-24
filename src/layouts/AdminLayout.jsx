import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { Outlet } from "react-router-dom";
import "../styles/adminLayout.css";

export default function AdminLayout() {

  return (
    <div className="layout">

      {/* Sidebar (Desktop only) */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="content">
        <Outlet />
      </div>

      {/* Bottom Nav (Mobile only) */}
      <BottomNav />

    </div>
  );
}