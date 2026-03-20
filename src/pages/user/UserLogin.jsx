import { useState } from "react";
import { userLogin } from "../../api/authApi";
import "../../styles/login.css";
import { useNavigate } from "react-router-dom";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function UserLogin(){

  const navigate = useNavigate();

  const [userId,setuserId] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async(e)=>{

    e.preventDefault();

    try{

      const res = await userLogin({userId,password});

      localStorage.setItem("userToken",res.data.token);

      navigate("/user/dashboard");

    }catch(err){

      alert("Invalid Credentials");

    }

  }

  return(

    <div className="login-container">

      <div className="login-card">

        {/* LOGO SECTION */}

        <div className="logo-section">

          <FaMicrophoneAlt className="logo-icon"/>

          <h1>VoiceMeet</h1>

          <p>User Voice Meeting Portal</p>

        </div>

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          <input
            placeholder="User ID"
            onChange={(e)=>setuserId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
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