import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "../../styles/login.css";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function AdminLogin() {

  const navigate = useNavigate();

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try{

      const res = await API.post("/auth/admin/login",{
        username:username,
        password:password
      });

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("username",username);

      navigate("/admin/dashboard");

    }catch(error){

      alert("Invalid Credentials");



    }




    try {
  const res = await adminLogin({
    username,
    password
  });

  console.log("SUCCESS:", res.data);

  localStorage.setItem("token", res.data.token);
  navigate("/admin/dashboard");

} catch (error) {

  console.log("ERROR FULL:", error);

  if (error.response) {
    // Backend responded
    alert("Backend Error: " + JSON.stringify(error.response.data));

  } else if (error.request) {
    // No response received
    alert("Server not reachable / Timeout / Network issue");

  } else {
    alert("Error: " + error.message);
  }
}

  };

  return(

    <div className="login-container">

      <div className="login-card">

        {/* LOGO */}
        <div className="logo-section">
          <FaMicrophoneAlt className="logo-icon"/>
          <h1>VoiceMeet</h1>
          <p>Connect. Talk. Collaborate.</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>

  );

}