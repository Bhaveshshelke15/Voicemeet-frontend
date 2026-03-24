import { useState } from "react";
import { userLogin } from "../../api/authApi";
import "../../styles/login.css";
import { useNavigate } from "react-router-dom";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function UserLogin(){

  const navigate = useNavigate();

  const [userId, setuserId] = useState("");
  const [password, setPassword] = useState("");

  //////////////////////////////////////////////////
  // LOGIN (FIXED)
  //////////////////////////////////////////////////

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await userLogin({ userId, password });

      console.log("Login Response:", res.data);

      //////////////////////////////////////////////////
      // ✅ STORE REQUIRED DATA (MAIN FIX)
      //////////////////////////////////////////////////

      // 🔥 THIS LINE FIXES YOUR WHOLE PROBLEM
      localStorage.setItem("userId", res.data.userId || userId);

      // 🔥 FIX TOKEN NAME (your app uses "token")
      localStorage.setItem("token", res.data.token);

      //////////////////////////////////////////////////
      // REDIRECT AFTER LOGIN
      //////////////////////////////////////////////////

      navigate("/user/dashboard");

    } catch (err) {

      console.error(err);
      alert("Invalid Credentials");

    }

  };

  //////////////////////////////////////////////////
  // UI (UNCHANGED)
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