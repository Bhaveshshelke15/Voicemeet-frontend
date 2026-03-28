import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatBox from "../../components/ChatBox";
import "../../styles/userDashboard.css";

export default function Dashboard() {

  const [meetings, setMeetings] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {

    const fetchMeetings = async () => {
      try {
        const res = await axios.get(
          "https://voicemeet.onrender.com/meeting/user/" + userId,
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

        setMeetings(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    if (userId && token) fetchMeetings();

  }, [userId, token]);

  const joinMeeting = (meetingId) => {
    navigate("/user/meeting/" + meetingId);
  };

  return (

    <div className="user-dashboard">

      {/* ✅ STATS */}
      <div className="stats-container">

        <div className="stat-card">
          <h4>Total</h4>
          <p>{meetings.length}</p>
        </div>

        <div className="stat-card">
          <h4>Active</h4>
          <p>{meetings.filter(m => m.status === "ACTIVE").length}</p>
        </div>

        <div className="stat-card">
          <h4>Completed</h4>
          <p>{meetings.filter(m => m.status === "ENDED").length}</p>
        </div>

      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="dashboard-grid">

        {/* 🟢 MEETINGS */}
        <div className="meeting-section">

          <h2>My Meetings</h2>

          {meetings.length === 0 ? (
            <p className="no-meeting">No Meetings</p>
          ) : (
            meetings.map((m, index) => (
              <div key={index} className="meeting-card">

                <div>
                  <h3>{m.meetingName}</h3>
                  <p>Status: {m.status}</p>
                </div>

                <button
                  className="join-btn"
                  onClick={() => joinMeeting(m.meetingId)}
                >
                  Join
                </button>

              </div>
            ))
          )}

        </div>

        {/* 🔵 CHAT (MOVED HERE) */}
        <div className="chat-section">
          <h2>Team Chat</h2>
          <ChatBox currentUser={userId} />
        </div>

      </div>

    </div>
  );
}