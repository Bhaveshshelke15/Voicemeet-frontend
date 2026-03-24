import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import ChatBox from "../../components/ChatBox"; // ✅ added
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
  <div className="dashboard">

    {/* Topbar */}
    <div className="topbar">

      <h1>Admin Dashboard</h1>

      <div className="profile">
        🔔
        <img src="https://i.pravatar.cc/40" alt="profile" />
        <div>
          <b>Bhavesh</b>
          <p>Administrator</p>
        </div>
      </div>

    </div>

    {/* Stats */}
    <div className="stats">

      <div
        className="card"
        onClick={()=>setShowMeetings(!showMeetings)}
      >
        <h2>{meetings.length}</h2>
        <p>Total Meetings</p>

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
                    e.stopPropagation();
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

      <div className="card">
        <h2>56</h2>
        <p>Total Employees</p>
      </div>

      <div className="card">
        <h2>8</h2>
        <p>Active Calls</p>
      </div>

    </div>

    {/* Overview */}
    <div className="overview">

      <h3>Meeting Overview</h3>
      <p>Visual analytics will be added here (charts later).</p>

      <h4>Call Recording</h4>

      <input
        className="meeting-input"
        placeholder="Enter Meeting Name"
      />

      <button className="record-btn">
        🎙 Start Recording
      </button>

    </div>

    {/* Chat */}
    <div className="chat-card">
      <ChatBox currentUser="admin" />
    </div>

    {/* Recordings */}
    <div className="recorded-card">
      <h3>Recorded Calls</h3>
      <p>No recordings available</p>

      <button onClick={()=>navigate("/admin/recordings")}>
        Meeting Recordings
      </button>
    </div>

  </div>
);
}