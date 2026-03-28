import { useNavigate } from "react-router-dom";

function SelectRole() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Select Login</h2>

      <button onClick={() => navigate("/admin-login")}>
        Admin Login
      </button>

      <br /><br />

      <button onClick={() => navigate("/user-login")}>
        User Login
      </button>
    </div>
  );
}

export default SelectRole;