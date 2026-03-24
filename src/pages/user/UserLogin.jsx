import { useState, useEffect } from "react";
import { userLogin } from "../../api/authApi";
import "../../styles/login.css";
import { useNavigate } from "react-router-dom";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function UserLogin(){

  const navigate = useNavigate();

  const [userId, setuserId] = useState("");
  const [password, setPassword] = useState("");

  //////////////////////////////////////////////////
  // AUTO REDIRECT IF ALREADY LOGGED IN
  //////////////////////////////////////////////////

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      navigate("/user/dashboard");
    }

  }, []);

  //////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await userLogin({ userId, password });

      console.log("Login Response:", res.data); // 🔥 DEBUG

      //////////////////////////////////////////////////
      // ✅ FIX: STORE EVERYTHING REQUIRED
      //////////////////////////////////////////////////

      // 🔥 IMPORTANT (this was missing)
      localStorage.setItem("userId", res.data.userId || userId);

      // 🔥 FIX token key mismatch
      localStorage.setItem("token", res.data.token);

      // optional (future use)
      localStorage.setItem("role", "USER");

      //////////////////////////////////////////////////
      // REDIRECT
      //////////////////////////////////////////////////

      navigate("/user/dashboard");

    } catch (err) {

      console.error(err);
      alert("Invalid Credentials");

    }

  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return(

    <div className="login-container">

      <div className="login-card">

        <div className="logo-section">

          <FaMicrophoneAlt className="logo-icon"/>

          <h1>VoiceMeet</h1>

          <p>User Voice Meeting Portal</p>

        </div>

        <form onSubmit={handleLogin}>

          <input
            placeholder="User ID"
            value={userId}
            onChange={(e) => setuserId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>

  );

}