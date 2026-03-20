import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/userDashboard.css";

export default function Dashboard() {

  const [meetings, setMeetings] = useState([]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchMeetings = async () => {

      try{

        const res = await axios.get(
          "https://voicemeet.onrender.com/meeting/user/" + userId,
          {
            headers:{
              Authorization:"Bearer " + token
            }
          }
        );

        setMeetings(res.data);

      }catch(err){
        console.log(err);
      }

    };

    fetchMeetings();

  },[userId,token]);


  const joinMeeting = (meetingId) => {

  window.location.href = "/user/meeting/" + meetingId;

};


  const sendMessage = () => {

    if(message.trim()==="") return;

    setChat([...chat,{sender:"You",text:message}]);
    setMessage("");

  };


  return (

    <div className="user-dashboard">

      {/* LEFT SIDE : MEETINGS */}

      <div className="meeting-section">

        <h2>My Meetings</h2>

        {meetings.length===0 ? (

          <p className="no-meeting">No Meetings Invited</p>

        ):(
          
          meetings.map((m)=>(

            <div key={m.meetingId} className="meeting-card">

              <div>

                <h3>{m.meetingName || "Team Meeting"}</h3>

                <p>Meeting Code: {m.meetingId}</p>

              </div>

              <button
                className="join-btn"
                onClick={()=>joinMeeting(m.meetingId)}
              >
                Join
              </button>

            </div>

          ))

        )}

      </div>


      {/* RIGHT SIDE : CHAT */}

      <div className="chat-section">

        <h2>Team Chat</h2>

        <div className="chat-box">

          {chat.map((msg,index)=>(
            <div key={index} className="chat-message">
              <b>{msg.sender}:</b> {msg.text}
            </div>
          ))}

        </div>

        <div className="chat-input">

          <input
            placeholder="Type message..."
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
          />

          <button onClick={sendMessage}>
            Send
          </button>

        </div>

      </div>

    </div>

  );

}