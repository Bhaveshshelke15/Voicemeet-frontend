import { Link } from "react-router-dom";
import "../styles/sidebar.css";
 import ChatBox from "../components/ChatBox";

export default function Sidebar() {

  return (

    <div className="sidebar">

      {/* LOGO */}
      <div className="logo">
        VoiceMeet
      </div>


      {/* MENU */}
      <ul className="menu">

        <li>
          <Link to="/admin/dashboard">🏠 Dashboard</Link>
        </li>

        <li>
          <Link to="/admin/create-meeting">🎥 Create Meeting</Link>
        </li>

        <li>
          <Link to="/admin/create-user">➕ Create User</Link>
        </li>

        <li>
          <Link to="/admin/invite-user">📨 Invite User</Link>
        </li>

        <li>
          <Link to="/admin/employees">👥 Employee List</Link>
        </li>

        <li>
          <Link to="/admin/settings">⚙ Settings</Link>
        </li>

      </ul>

     

<ChatBox currentUser="admin"/>


      </div>

    

  );
}