import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/Admindashboard.css";

export default function AdminLayout() {

  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="main">
        <Outlet />
      </div>

    </div>
  );

}