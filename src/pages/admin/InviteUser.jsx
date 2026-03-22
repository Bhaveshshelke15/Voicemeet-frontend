import { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/inviteUser.css";

export default function InviteUser() {

  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingId, setMeetingId] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchMeetings();
  }, []);

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/admin/users", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      setUsers(res.data);

    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Fetch all meetings (IMPORTANT)
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/meeting/all", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      setMeetings(res.data);

    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  // ✅ Invite user
  const inviteUser = async (userId) => {

    if (!meetingId) {
      alert("Please select a meeting first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/meeting/invite",
        {
          meetingId: meetingId,
          userId: userId
        },
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      alert("Invitation sent to " + userId);

    } catch (err) {
      console.error("Invite error:", err);
      alert("Failed to invite user");
    }
  };

  return (

    <div className="invite-page">

      <h2>Invite Employees To Meeting</h2>

      {/* ✅ Meeting Dropdown */}
      <div className="meeting-input">

        <label>Select Meeting</label>

        <select
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
        >
          <option value="">-- Select Meeting --</option>

          {meetings.map((m) => (
            <option key={m.meetingId} value={m.meetingId}>
              {m.meetingName}
            </option>
          ))}

        </select>

      </div>

      {/* ✅ Users Table */}
      <table className="invite-table">

        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.userId}>

              <td>{user.userId}</td>
              <td>{user.name}</td>

              <td>

                <button
                  className="invite-btn"
                  disabled={!meetingId}
                  onClick={() => inviteUser(user.userId)}
                >
                  Invite
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}