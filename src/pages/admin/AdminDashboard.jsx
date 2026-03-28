import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import ChatBox from "../../components/ChatBox";
import "../../styles/adminDashboard.css";

export default function Dashboard() {

  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]); // ✅ NEW
  const [activeCalls, setActiveCalls] = useState(0); // ✅ NEW
  const [showMeetings, setShowMeetings] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
    fetchEmployees(); // ✅ NEW
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await API.get("/admin/meetings");
      setMeetings(res.data);

      // ✅ Active calls logic (example)
      const active = res.data.filter(m => m.status === "ACTIVE");
      setActiveCalls(active.length);

    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/admin/users"); // ✅ your API
      setEmployees(res.data);
    } catch (err) {
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

        {/* TOTAL MEETINGS */}
        <div
          className="card"
          onClick={() => setShowMeetings(!showMeetings)}
        >
          <h2>{meetings.length}</h2>
          <p>Total Meetings</p>

          {showMeetings && (
            <div className="meeting-list">
              {meetings.map((m) => (
                <div key={m.meetingId} className="meeting-item">

                  <div>
                    <b>{m.meetingName}</b>
                  </div>

                  <button
                    className="join-btn"
                    onClick={(e) => {
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

        {/* TOTAL EMPLOYEES */}
        <div className="card">
          <h2>{employees.length}</h2>
          <p>Total Employees</p>
        </div>

        {/* ACTIVE CALLS */}
        <div className="card">
          <h2>{activeCalls}</h2>
          <p>Active Calls</p>
        </div>

      </div>

      {/* Overview */}
      

      {/* Chat */}
      <div className="chat-card">
        <ChatBox currentUser="admin" />
      </div>

      {/* Recordings */}
      <div className="recorded-card">
        <h3>Recorded Calls</h3>
        <p>No recordings available</p>

        <button onClick={() => navigate("/admin/recordings")}>
          Meeting Recordings
        </button>
      </div>

    </div>
  );
}