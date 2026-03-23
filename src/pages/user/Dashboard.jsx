import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ IMPORT ADDED
import "../../styles/userDashboard.css";

export default function Dashboard() {

  const [meetings, setMeetings] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate(); // ✅ INIT NAVIGATE

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

        console.log("Meetings:", res.data);
        setMeetings(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    if (userId && token) {
      fetchMeetings();
    }

  }, [userId, token]);

  // ✅ FIXED FUNCTION
  const joinMeeting = (meetingId) => {
    navigate("/user/meeting/" + meetingId);
  };

  return (

    <div className="user-dashboard">

      <div className="meeting-section">

        <h2>My Meetings</h2>

        {meetings.length === 0 ? (

          <p className="no-meeting">No Meetings Invited</p>

        ) : (

          meetings.map((m, index) => (

            <div key={index} className="meeting-card">

              <div>
                <h3>{m.meetingName}</h3>
                <p>Meeting Code: {m.meetingId}</p>
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

    </div>

  );
}