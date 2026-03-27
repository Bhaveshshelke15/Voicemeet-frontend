
import { useState, useEffect } from "react";
import API from "../../api/api";
import "../../styles/createMeeting.css";

export default function CreateMeeting() {

  const [meetingName, setMeetingName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch all users automatically
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/user/all", {   // ✅ FIXED HERE
        headers: {
          Authorization: "Bearer " + token
        }
      });

      console.log("Users:", res.data);

      setAllUsers(res.data);

    } catch (err) {
      console.error("Fetch Users Error:", err.response || err);
      alert("Failed to fetch users");
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const adminUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!adminUsername) {
      alert("Please login again");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create meeting
      const res = await API.post(
        `/meeting/create?meetingName=${meetingName}&adminUsername=${adminUsername}`
      );

      const meetingId = res.data.meetingId;

      // 2️⃣ Invite ALL users
      for (let user of allUsers) {

        await API.post(
          "/meeting/invite",
          {
            meetingId: meetingId,
            userId: user.userId   // ✅ IMPORTANT FIX
          },
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

      }

      alert("Meeting created and all users invited ✅");

      setMeetingName("");

    } catch (err) {

      console.error("Create Meeting Error:", err.response || err);
      alert("Error creating meeting");

    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="create-meeting-page">

      <div className="create-meeting-card">

        <h2>Create Meeting</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Meeting Name</label>
            <input
              type="text"
              placeholder="Enter meeting name"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="meeting-btn" disabled={loading}>
            {loading ? "Creating..." : "Create & Invite All Users 🚀"}
          </button>

        </form>

      </div>

    </div>

  );
}

