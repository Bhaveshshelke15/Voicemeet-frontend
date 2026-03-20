import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams } from "react-router-dom";
import "../../styles/voiceRoom.css";

function UserVoiceRoom() {

const { meetingId } = useParams();

const stompClient = useRef(null);
const localStream = useRef(null);
const peerConnection = useRef(null);

const configuration = {
 iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

const userId = localStorage.getItem("userId") || "user";

const [joined, setJoined] = useState(false);
const [participants, setParticipants] = useState([]);
const [activeUser, setActiveUser] = useState(null);

////////////////////////////////////////////////////////
// SPEAKING DETECTION
////////////////////////////////////////////////////////

function detectSpeaking(stream, user) {

 const audioContext = new AudioContext();
 const analyser = audioContext.createAnalyser();

 const microphone =
  audioContext.createMediaStreamSource(stream);

 microphone.connect(analyser);

 analyser.fftSize = 512;

 const dataArray =
  new Uint8Array(analyser.frequencyBinCount);

 function checkVolume() {

  analyser.getByteFrequencyData(dataArray);

  let volume =
   dataArray.reduce((a, b) => a + b) / dataArray.length;

  if (volume > 20) {
   setActiveUser(user);
  }

  requestAnimationFrame(checkVolume);
 }

 checkVolume();
}

////////////////////////////////////////////////////////
// CONNECT SOCKET
////////////////////////////////////////////////////////

useEffect(() => {

 const socket = new SockJS("https://voicemeet.onrender.com/ws");

 stompClient.current = new Client({

  webSocketFactory: () => socket,

  onConnect: () => {

   stompClient.current.subscribe(
    "/topic/signal/" + meetingId,
    handleSignal
   );

  }

 });

 stompClient.current.activate();

}, [meetingId]);

////////////////////////////////////////////////////////
// JOIN MEETING
////////////////////////////////////////////////////////

const joinMeeting = async () => {

 localStream.current =
  await navigator.mediaDevices.getUserMedia({
   audio: true
  });

 setParticipants([userId]);

 stompClient.current.publish({

  destination: "/app/signal",

  body: JSON.stringify({

   type: "join",
   meetingId,
   sender: userId

  })

 });

 setJoined(true);
};

////////////////////////////////////////////////////////
// HANDLE SIGNAL
////////////////////////////////////////////////////////

const handleSignal = async (message) => {

 const data = JSON.parse(message.body);

 if (data.sender === userId) return;

 if (data.type === "offer") {

  createConnection(data.sender);

  await peerConnection.current.setRemoteDescription(
   new RTCSessionDescription(data.offer)
  );

  const answer = await peerConnection.current.createAnswer();

  await peerConnection.current.setLocalDescription(answer);

  stompClient.current.publish({

   destination: "/app/signal",

   body: JSON.stringify({

    type: "answer",
    meetingId,
    sender: userId,
    target: data.sender,
    answer

   })

  });

 }

 if (data.type === "candidate") {

  if (peerConnection.current) {

   await peerConnection.current.addIceCandidate(
    new RTCIceCandidate(data.candidate)
   );

  }

 }

};

////////////////////////////////////////////////////////
// CREATE WEBRTC CONNECTION
////////////////////////////////////////////////////////

const createConnection = (adminId) => {

 peerConnection.current =
  new RTCPeerConnection(configuration);

 localStream.current.getTracks().forEach(track => {

  peerConnection.current.addTrack(track, localStream.current);

 });

 peerConnection.current.ontrack = (event) => {

  const adminStream = event.streams[0];

  const audio = new Audio();
  audio.srcObject = adminStream;
  audio.play();

  detectSpeaking(adminStream, adminId);

 };

 peerConnection.current.onicecandidate = (event) => {

  if (event.candidate) {

   stompClient.current.publish({

    destination: "/app/signal",

    body: JSON.stringify({

     type: "candidate",
     meetingId,
     sender: userId,
     target: adminId,
     candidate: event.candidate

    })

   });

  }

 };

};

////////////////////////////////////////////////////////
// LEAVE MEETING
////////////////////////////////////////////////////////

const leaveMeeting = () => {

 if (peerConnection.current) {
  peerConnection.current.close();
 }

 if (localStream.current) {
  localStream.current.getTracks().forEach(track => track.stop());
 }

 setJoined(false);
 setParticipants([]);
};

////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////

return (

<div className="voice-container">

<h2>User Voice Room</h2>
<p>Meeting ID : {meetingId}</p>

{!joined ?

<button className="join-btn" onClick={joinMeeting}>
Join Meeting
</button>

:

<>
<h3>Participants</h3>

<div className="participants-grid">

{participants.map((p) => (

<div
key={p}
className={
 activeUser === p
  ? "participant active"
  : "participant"
}
>

<div className="avatar">
{p.charAt(0).toUpperCase()}
</div>

<p>{p}</p>

</div>

))}

</div>

<div className="controls">

<button className="mute-btn">
🎤 Mute
</button>

<button className="leave-btn" onClick={leaveMeeting}>
📞 Leave
</button>

</div>

</>

}

</div>

);

}

export default UserVoiceRoom;