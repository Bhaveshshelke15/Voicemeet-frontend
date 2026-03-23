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
  const audioElements = useRef({});
  const iceQueues = useRef({});

  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  ////////////////////////////////////////////////////////
  // SOCKET
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
  // JOIN
  ////////////////////////////////////////////////////////

  const joinMeeting = async () => {

    localStream.current = await navigator.mediaDevices.getUserMedia({
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
  // SIGNAL
  ////////////////////////////////////////////////////////

  const handleSignal = async (message) => {

    const data = JSON.parse(message.body);

    if (data.target && data.target !== "admin") return;
    if (data.sender === "admin") return;

    ////////////////////////////////////////////////////////
    // USER JOINED
    ////////////////////////////////////////////////////////
    if (data.type === "join") {

      setParticipants(prev =>
        prev.includes(data.sender) ? prev : [...prev, data.sender]
      );

      // 🔥 PREVENT DUPLICATE CONNECTION
      if (!peerConnections.current[data.sender]) {
        createConnection(data.sender);
      }
    }

    ////////////////////////////////////////////////////////
    // ANSWER
    ////////////////////////////////////////////////////////
    if (data.type === "answer") {

      const pc = peerConnections.current[data.sender];

      if (pc && pc.signalingState !== "stable") {
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        } catch (e) {
          console.warn("setRemoteDescription error:", e);
        }

        // 🔥 APPLY ICE QUEUE
        if (iceQueues.current[data.sender]) {
          iceQueues.current[data.sender].forEach(c =>
            pc.addIceCandidate(c)
          );
          iceQueues.current[data.sender] = [];
        }
      }
    }

    ////////////////////////////////////////////////////////
    // ICE
    ////////////////////////////////////////////////////////
    if (data.type === "candidate") {

      const pc = peerConnections.current[data.sender];
      const candidate = new RTCIceCandidate(data.candidate);

      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.warn("ICE error:", e);
        }
      } else {
        if (!iceQueues.current[data.sender]) {
          iceQueues.current[data.sender] = [];
        }
        iceQueues.current[data.sender].push(candidate);
      }
    }
  };

  ////////////////////////////////////////////////////////
  // CREATE CONNECTION
  ////////////////////////////////////////////////////////

  const createConnection = async (userId) => {

    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[userId] = pc;

    // 🔥 ADD LOCAL AUDIO
    localStream.current.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current);
    });

    ////////////////////////////////////////////////////////
    // RECEIVE AUDIO
    ////////////////////////////////////////////////////////
    pc.ontrack = (event) => {

      if (!audioElements.current[userId]) {

        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.playsInline = true;

        document.body.appendChild(audio);
        audioElements.current[userId] = audio;
      }

      const audio = audioElements.current[userId];

      audio.srcObject = event.streams[0];
      audio.muted = !speakerOn;

      audio.play().catch(() => {
        console.log("Autoplay blocked");
      });
    };

    ////////////////////////////////////////////////////////
    // ICE SEND
    ////////////////////////////////////////////////////////
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

    ////////////////////////////////////////////////////////
    // CREATE OFFER
    ////////////////////////////////////////////////////////
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
  // CONTROLS
  ////////////////////////////////////////////////////////

  const toggleMute = () => {
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    Object.values(audioElements.current).forEach(audio => {
      audio.muted = speakerOn;
    });
    setSpeakerOn(!speakerOn);
  };

  ////////////////////////////////////////////////////////
  // LEAVE
  ////////////////////////////////////////////////////////

  const leaveMeeting = () => {

    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    Object.values(audioElements.current).forEach(audio => audio.remove());
    audioElements.current = {};

    iceQueues.current = {};

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
      <p>Meeting ID: {meetingId}</p>

      {!joined ? (

        <button onClick={joinMeeting}>Start Meeting</button>

      ) : (

        <>
          <h3>Participants</h3>

          <div className="participants-grid">
            {participants.map((p) => (
              <div key={p} className="participant">
                <div className="avatar">
                  {p.charAt(0).toUpperCase()}
                </div>
                <p>{p}</p>
              </div>
            ))}
          </div>

          <div className="controls">

            <button onClick={toggleMute}>
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>

            <button onClick={toggleSpeaker}>
              {speakerOn ? "🔊 Speaker Off" : "🔊 Speaker On"}
            </button>

            <button onClick={leaveMeeting}>
              📞 Leave
            </button>

          </div>
        </>

      )}

    </div>
  );
}

export default AdminVoiceRoom;