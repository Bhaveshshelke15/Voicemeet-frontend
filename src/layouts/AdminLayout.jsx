import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/adminLayout.css";

export default function AdminLayout() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // redirect to role selection
  };

  return (
    <div className="layout">

      {/* Logout Button (Top Right) */}
      <button className="logout-btn-global" onClick={handleLogout}>
        🚪 Logout
      </button>

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