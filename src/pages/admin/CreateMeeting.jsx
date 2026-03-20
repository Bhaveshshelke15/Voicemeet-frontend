import { useState } from "react";
import API from "../../api/api";
import "../../styles/createMeeting.css";

export default function CreateMeeting() {

  const [meetingName, setMeetingName] = useState("");
  const [userIds, setUserIds] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    const adminUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if(!adminUsername){
      alert("Please login again");
      return;
    }

    try {

      // 1️⃣ Create meeting
      const res = await API.post(
        `/meeting/create?meetingName=${meetingName}&adminUsername=${adminUsername}`
      );

      const meetingId = res.data.meetingId;

      // 2️⃣ Invite users
      const users = userIds.split(",");

      for(let user of users){

        await API.post(
          "/meeting/invite",
          {
            meetingId: meetingId,
            userId: user.trim()
          },
          {
            headers:{
              Authorization: "Bearer " + token
            }
          }
        );

      }

      alert("Meeting created and users invited");

      setMeetingName("");
      setUserIds("");

    } catch(err){

      console.error(err);
      alert("Error creating meeting");

    }

  };

  return(

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
              onChange={(e)=>setMeetingName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Invite Users</label>
            <input
              type="text"
              placeholder="Enter User IDs separated by comma"
              value={userIds}
              onChange={(e)=>setUserIds(e.target.value)}
            />
          </div>

          <button type="submit" className="meeting-btn">
            Create Meeting & Invite
          </button>

        </form>

      </div>

    </div>

  );
}