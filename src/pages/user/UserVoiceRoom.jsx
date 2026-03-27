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

  // 🔥 TURN + STUN
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject"
      }
    ]
  };

  const [joined, setJoined] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  ////////////////////////////////////////////////////////
  // SOCKET CONNECT
  ////////////////////////////////////////////////////////

  useEffect(() => {

    const socket = new SockJS("https://voicemeet.onrender.com/ws");

    stompClient.current = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        console.log("Connected to WS");

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

    // 🔥 Start MUTED
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = false;
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

      if (
        peerConnection.current &&
        peerConnection.current.signalingState !== "closed"
      ) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (err) {
          console.log("ICE error:", err);
        }
      }
    }
  };

  ////////////////////////////////////////////////////////
  // CREATE CONNECTION
  ////////////////////////////////////////////////////////

  const createConnection = (adminId) => {

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log("ICE State:", peerConnection.current.iceConnectionState);
    };

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    // 🔥 RECEIVE AUDIO
    peerConnection.current.ontrack = (event) => {

      console.log("REMOTE STREAM RECEIVED");

      const audio = document.createElement("audio");

      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.playsInline = true;
      audio.muted = !speakerOn;
      audio.volume = 1.0;

      document.body.appendChild(audio);

      audioRef.current = audio;

      audio.play().catch(err => {
        console.log("Autoplay blocked:", err);
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
  // 🔥 PUSH TO TALK
  ////////////////////////////////////////////////////////

  const handleSpeakStart = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = true;
    });
  };

  const handleSpeakEnd = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
  };

  ////////////////////////////////////////////////////////
  // SPEAKER CONTROL
  ////////////////////////////////////////////////////////

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
      peerConnection.current = null;
    }

    if (audioRef.current) {
      audioRef.current.remove();
      audioRef.current = null;
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
    <div style={{
      padding: "30px",
      textAlign: "center",
      fontFamily: "Segoe UI"
    }}>

      <h2>User Voice Room</h2>
      <p style={{ color: "#666" }}>Meeting ID: {meetingId}</p>

      {!joined ? (

        <button
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#4CAF50",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={joinMeeting}
        >
          Join Meeting
        </button>

      ) : (

        <>
          <p style={{ marginTop: "20px" }}>
            Connected 🎧 <br /> <b>Hold button to speak</b>
          </p>

          <div style={{ marginTop: "30px" }}>

            {/* 🎤 PUSH TO TALK */}
            <button
              style={{
                background: "#2196F3",
                color: "white",
                padding: "16px 28px",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
              }}
              onMouseDown={handleSpeakStart}
              onMouseUp={handleSpeakEnd}
              onMouseLeave={handleSpeakEnd}
              onTouchStart={handleSpeakStart}
              onTouchEnd={handleSpeakEnd}
            >
              🎤 Hold to Speak
            </button>

            <br /><br />

            {/* 🔊 Speaker */}
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: speakerOn ? "#28a745" : "#6c757d",
                color: "white",
                cursor: "pointer"
              }}
              onClick={toggleSpeaker}
            >
              {speakerOn ? "🔊 Speaker ON" : "🔇 Speaker OFF"}
            </button>

            <br /><br />

            {/* 📞 Leave */}
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#f44336",
                color: "white",
                cursor: "pointer"
              }}
              onClick={leaveMeeting}
            >
              📞 Leave
            </button>

          </div>
        </>

      )}

    </div>
  );
}

export default UserVoiceRoom;