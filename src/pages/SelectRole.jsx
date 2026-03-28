import { useNavigate } from "react-router-dom";
import "../styles/selectRole.css";

function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="role-container">

      <div className="role-card">
        <h1 className="app-title">VoiceMeet</h1>
        <p className="subtitle">Choose how you want to continue</p>

        <div className="role-buttons">

          <button
            className="role-btn admin"
            onClick={() => navigate("/admin/login")}
          >
            👨‍💼 Admin Login
          </button>

          <button
            className="role-btn user"
            onClick={() => navigate("/user/login")}
          >
            👤 User Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default SelectRole;