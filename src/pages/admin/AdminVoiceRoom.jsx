import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams } from "react-router-dom";
import "../../styles/voiceRoom.css";

function AdminVoiceRoom() {

const { meetingId } = useParams();

const stompClient = useRef(null);
const localStream = useRef(null);
const peerConnections = useRef({});

const configuration = {
 iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

const [joined, setJoined] = useState(false);
const [participants, setParticipants] = useState([]);
const [activeUser, setActiveUser] = useState(null);

////////////////////////////////////////////////////////
// SPEAKING DETECTION
////////////////////////////////////////////////////////

function detectSpeaking(stream, userId) {

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
   setActiveUser(userId);
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

 setParticipants(["admin"]);

 stompClient.current.publish({

  destination: "/app/signal",

  body: JSON.stringify({

   type: "join",
   meetingId,
   sender: "admin"

  })

 });

 setJoined(true);
};

////////////////////////////////////////////////////////
// HANDLE SIGNAL
////////////////////////////////////////////////////////

const handleSignal = async (message) => {

 const data = JSON.parse(message.body);

 if (data.sender === "admin") return;

 if (data.type === "join") {

  setParticipants(prev => {

   if (!prev.includes(data.sender)) {
    return [...prev, data.sender];
   }
   return prev;

  });

  createConnection(data.sender);

 }

 if (data.type === "answer") {

  const pc = peerConnections.current[data.sender];

  if (pc) {

   await pc.setRemoteDescription(
    new RTCSessionDescription(data.answer)
   );

  }

 }

 if (data.type === "candidate") {

  const pc = peerConnections.current[data.sender];

  if (pc) {

   await pc.addIceCandidate(
    new RTCIceCandidate(data.candidate)
   );

  }

 }

};

////////////////////////////////////////////////////////
// CREATE WEBRTC CONNECTION
////////////////////////////////////////////////////////

const createConnection = async (userId) => {

 const pc = new RTCPeerConnection(configuration);

 peerConnections.current[userId] = pc;

 localStream.current.getTracks().forEach(track => {
  pc.addTrack(track, localStream.current);
 });

 pc.ontrack = (event) => {

  const userStream = event.streams[0];

  const audio = new Audio();
  audio.srcObject = userStream;
  audio.play();

  detectSpeaking(userStream, userId);

 };

 pc.onicecandidate = (event) => {

  if (event.candidate) {

   stompClient.current.publish({

    destination: "/app/signal",

    body: JSON.stringify({

     type: "candidate",
     meetingId,
     sender: "admin",
     target: userId,
     candidate: event.candidate

    })

   });

  }

 };

 const offer = await pc.createOffer();

 await pc.setLocalDescription(offer);

 stompClient.current.publish({

  destination: "/app/signal",

  body: JSON.stringify({

   type: "offer",
   meetingId,
   sender: "admin",
   target: userId,
   offer

  })

 });

};

////////////////////////////////////////////////////////
// LEAVE MEETING
////////////////////////////////////////////////////////

const leaveMeeting = () => {

 Object.values(peerConnections.current).forEach(pc => {
  pc.close();
 });

 peerConnections.current = {};

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

<h2>Admin Voice Room</h2>
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

export default AdminVoiceRoom;