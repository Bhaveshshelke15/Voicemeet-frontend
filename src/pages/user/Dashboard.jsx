import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/userDashboard.css";

export default function Dashboard() {

  const [meetings, setMeetings] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

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

        console.log("Meetings:", res.data); // ✅ debug
        setMeetings(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMeetings();

  }, [userId, token]);


  const joinMeeting = (meetingId) => {
    window.location.href = "/user/meeting/" + meetingId;
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