import { Link } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar({ closeSidebar }) {

  return (

    <div className="sidebar">

      {/* LOGO */}
      <div className="logo">
        VoiceMeet
      </div>

      {/* MENU */}
      <ul className="menu">

        <li onClick={closeSidebar}>
          <Link to="/admin/dashboard">🏠 Dashboard</Link>
        </li>

        <li onClick={closeSidebar}>
          <Link to="/admin/create-meeting">🎥 Create Meeting</Link>
        </li>

        <li onClick={closeSidebar}>
          <Link to="/admin/create-user">➕ Create User</Link>
        </li>

        <li onClick={closeSidebar}>
          <Link to="/admin/invite-user">📨 Invite User</Link>
        </li>

        <li onClick={closeSidebar}>
          <Link to="/admin/employees">👥 Employee List</Link>
        </li>

        <li onClick={closeSidebar}>
          <Link to="/admin/settings">⚙ Settings</Link>
        </li>

      </ul>

    </div>
  );
}