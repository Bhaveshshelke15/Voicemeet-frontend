import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams } from "react-router-dom";

function UserVoiceRoom() {

  const { meetingId } = useParams();

  const stompClient = useRef(null);
  const localStream = useRef(null);
  const peerConnection = useRef(null);
  const audioRef = useRef(null);

  const userId = localStorage.getItem("userId") || "user";

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  ////////////////////////////////////////////////////////
  // SOCKET CONNECT
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

    // 🔥 FILTER
    if (data.target && data.target !== userId) return;
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
  // CREATE CONNECTION
  ////////////////////////////////////////////////////////

  const createConnection = (adminId) => {

    peerConnection.current = new RTCPeerConnection(configuration);

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    // 🔥 FIXED AUDIO
    peerConnection.current.ontrack = (event) => {

      const audio = document.createElement("audio");

      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.playsInline = true;
      audio.muted = !speakerOn;

      document.body.appendChild(audio);

      audioRef.current = audio;

      audio.play().catch(() => {
        console.log("Autoplay blocked");
      });
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
  // CONTROLS
  ////////////////////////////////////////////////////////

  const toggleMute = () => {
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    if (audioRef.current) {
      audioRef.current.muted = speakerOn;
    }
    setSpeakerOn(!speakerOn);
  };

  ////////////////////////////////////////////////////////
  // LEAVE
  ////////////////////////////////////////////////////////

  const leaveMeeting = () => {

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    if (audioRef.current) {
      audioRef.current.remove();
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }

    setJoined(false);
  };

  ////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////

  return (
    <div style={{ padding: "20px" }}>

      <h2>User Voice Room</h2>
      <p>Meeting ID: {meetingId}</p>

      {!joined ? (

        <button onClick={joinMeeting}>Join</button>

      ) : (

        <>
          <p>Connected 🎤</p>

          <div style={{ marginTop: "20px" }}>

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

export default UserVoiceRoom;