import { useEffect,useState } from "react";
import { connectSocket } from "../../websocket/socket";
import "../../styles/meeting.css";

export default function MeetingRoom(){

  const [messages,setMessages]=useState([]);

  useEffect(()=>{

    const client=connectSocket((msg)=>{

      setMessages(prev=>[...prev,msg]);

    });

  },[])

  return(

    <div className="meeting-room">

      <div className="video-grid">

        <div className="video-box"></div>
        <div className="video-box"></div>
        <div className="video-box"></div>

      </div>

      <div className="meeting-controls">

        <button className="control-btn">Mic</button>
        <button className="control-btn">Cam</button>
        <button className="control-btn">Leave</button>

      </div>

    </div>

  );

}