import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "../../styles/adminDashboard.css";

export default function Dashboard() {

  const [meetings,setMeetings] = useState([]);
  const [showMeetings,setShowMeetings] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    fetchMeetings();
  },[]);

  const fetchMeetings = async()=>{

    try{

      const res = await API.get("/admin/meetings");
      setMeetings(res.data);

    }catch(err){
      console.error(err);
    }

  };

  return (
    <div className="main">

      {/* Topbar */}
      <div className="topbar">

        <h1>Admin Dashboard</h1>

        <div className="profile">
          🔔
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
          />
          <div>
            <b>Bhavesh</b>
            <p>Administrator</p>
          </div>
        </div>

      </div>

      {/* Stats */}
      <div className="stats">

        {/* TOTAL MEETINGS CARD */}
        <div
          className="card"
          onClick={()=>setShowMeetings(!showMeetings)}
          style={{cursor:"pointer"}}
        >

          <h2>{meetings.length}</h2>
          <p>Total Meetings</p>

          {/* SHOW LIST ONLY WHEN CLICKED */}
          {showMeetings && (

            <div className="meeting-list">

              {meetings.map((m)=>(

                <div key={m.meetingId} className="meeting-item">

                  <div>
                    <b>{m.meetingName}</b>
                    <p>{m.meetingId}</p>
                  </div>

                  <button
                    className="join-btn"
                    onClick={(e)=>{
                      e.stopPropagation(); // prevents card toggle
                      navigate(`/admin/meeting/${m.meetingId}`);
                    }}
                  >
                    Join
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Total Employees */}
        <div className="card">
          <h2>56</h2>
          <p>Total Employees</p>
        </div>

        {/* Active Calls */}
        <div className="card">
          <h2>8</h2>
          <p>Active Calls</p>
        </div>

      </div>

      {/* Middle Section */}
      <div className="middle">

        {/* Meeting Overview */}
        <div className="overview">

          <h3>Meeting Overview</h3>

          <p>
            Visual analytics will be added here (charts later).
          </p>

          <h4>Call Recording</h4>

          <input
            className="meeting-input"
            placeholder="Enter Meeting Name"
          />

          <button className="record-btn">
            🎙 Start Recording
          </button>

        </div>

        {/* Right Side */}
        <div className="right">

          <div className="server-card">
            <h3>Server Health</h3>
            <h1>78%</h1>
            <p>System Stable</p>
          </div>

          <div className="recorded-card">
            <h3>Recorded Calls</h3>
            <p>No recordings available</p>
            <button
onClick={()=>navigate("/admin/recordings")}
>
Meeting Recordings
</button>
          </div>

        </div>

      </div>

    </div>
  );
}