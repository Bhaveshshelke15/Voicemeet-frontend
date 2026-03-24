import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

    if (userId && token) {
      fetchMeetings();
    }

  }, [userId, token]);

  const joinMeeting = (meetingId) => {
    navigate("/user/meeting/" + meetingId);
  };

  return (

    <div className="user-dashboard">

      {/* ✅ STATS (MATCH ADMIN STYLE) */}
      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Meetings</h3>
          <p>{meetings.length}</p>
        </div>

        <div className="stat-card">
          <h3>Active</h3>
          <p>
            {meetings.filter(m => m.status === "ACTIVE").length}
          </p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>
            {meetings.filter(m => m.status === "ENDED").length}
          </p>
        </div>

      </div>


      {/* ✅ MEETING LIST */}
      <div className="meeting-section">

        <h2>My Meetings</h2>

        {meetings.length === 0 ? (

          <p className="no-meeting">No Meetings Invited</p>

        ) : (

          <div className="meeting-list">

            {meetings.map((m, index) => (

              <div key={index} className="meeting-card">

                <div className="meeting-info">
                  <h3>{m.meetingName}</h3>
                  <p><b>Code:</b> {m.meetingId}</p>
                  <p><b>Status:</b> {m.status}</p>
                </div>

                <button
                  className="join-btn"
                  onClick={() => joinMeeting(m.meetingId)}
                >
                  Join
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}