import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinMeeting(){

  const navigate=useNavigate();

  const [meetingId,setMeetingId]=useState("");

  const join=()=>{

    navigate(`/user/meeting-room?meetingId=${meetingId}`);

  }

  return(

    <div className="container">

      <h2>Join Meeting</h2>

      <input
      placeholder="Enter Meeting ID"
      onChange={(e)=>setMeetingId(e.target.value)}
      />

      <br/><br/>

      <button onClick={join}>
        Join Meeting
      </button>

    </div>

  );

}