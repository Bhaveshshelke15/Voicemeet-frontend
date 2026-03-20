import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import "../../styles/userMeetings.css";

export default function UserMeetings(){

  const [meetings,setMeetings] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(()=>{

    fetchMeetings();

  },[]);

  const fetchMeetings = async()=>{

    try{

      const res = await API.get(
        "/meeting/user/" + userId,
        {
          headers:{
            Authorization:"Bearer " + token
          }
        }
      );

      setMeetings(res.data);

    }catch(err){

      console.error("Error fetching meetings",err);

    }

  };

  const joinMeeting = (meetingId)=>{

    navigate("/voice/user/" + meetingId);

  };

  return(

    <div className="user-meetings-page">

      <h2>My Meetings</h2>

      {meetings.length === 0 ? (

        <p className="no-meeting">No meetings available</p>

      ) : (

        <div className="meeting-grid">

          {meetings.map((m)=>(

            <div className="meeting-card" key={m.id}>

              <h3>Meeting</h3>

              <p>
                Meeting Code : <b>{m.meetingId}</b>
              </p>

              <button
                onClick={()=>joinMeeting(m.meetingId)}
              >
                Join Meeting
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}