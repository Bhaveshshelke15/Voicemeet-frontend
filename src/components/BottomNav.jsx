import { Link } from "react-router-dom";
import "../styles/bottomNav.css";

export default function BottomNav() {

  return (
    <div className="bottom-nav">

      <Link to="/admin/dashboard">🏠</Link>
      <Link to="/admin/create-meeting">🎥</Link>
      <Link to="/admin/employees">👥</Link>
      <Link to="/admin/invite-user">📨</Link>
      <Link to="/admin/chat">💬</Link>
      <Link to="/admin/settings">⚙</Link>

    </div>
  );
}