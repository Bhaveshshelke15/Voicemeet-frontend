import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams, useNavigate } from "react-router-dom";

function UserVoiceRoom() {

  const { meetingId } = useParams();
  const navigate = useNavigate();

  const stompClient = useRef(null);
  const localStream = useRef(null);
  const peerConnection = useRef(null);
  const audioRef = useRef(null);

  const userId = localStorage.getItem("userId") || "user";

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
  // 🔄 AUTO REJOIN
  ////////////////////////////////////////////////////////

  useEffect(() => {
    const savedMeeting = localStorage.getItem("activeMeeting");

    if (savedMeeting === meetingId) {
      console.log("Rejoining meeting...");
      joinMeeting(true);
    }
  }, []);

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

  const joinMeeting = async (isRejoin = false) => {

    if (!localStream.current) {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // 🔥 Start MUTED (your logic preserved)
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }

    if (!isRejoin) {
      localStorage.setItem("activeMeeting", meetingId);
    }

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

    peerConnection.current.ontrack = (event) => {

      const audio = document.createElement("audio");

      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.playsInline = true;
      audio.muted = !speakerOn;

      document.body.appendChild(audio);
      audioRef.current = audio;

      audio.play().catch(() => {});
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
  // 🎤 PUSH TO TALK (UNCHANGED)
  ////////////////////////////////////////////////////////

  const handleSpeakStart = () => {
    localStream.current?.getAudioTracks().forEach(t => t.enabled = true);
  };

  const handleSpeakEnd = () => {
    localStream.current?.getAudioTracks().forEach(t => t.enabled = false);
  };

  ////////////////////////////////////////////////////////
  // 🔊 SPEAKER
  ////////////////////////////////////////////////////////

  const toggleSpeaker = () => {
    if (audioRef.current) {
      audioRef.current.muted = speakerOn;
    }
    setSpeakerOn(!speakerOn);
  };

  ////////////////////////////////////////////////////////
  // 🔴 LOGOUT
  ////////////////////////////////////////////////////////

  const handleLogout = () => {

    leaveMeeting();

    localStorage.removeItem("userId");
    localStorage.removeItem("activeMeeting");

    navigate("/login"); // change if needed
  };

  ////////////////////////////////////////////////////////
  // LEAVE
  ////////////////////////////////////////////////////////

  const leaveMeeting = () => {

    localStorage.removeItem("activeMeeting");

    peerConnection.current?.close();
    peerConnection.current = null;

    audioRef.current?.remove();
    audioRef.current = null;

    localStream.current?.getTracks().forEach(t => t.stop());

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

      {/* 🔴 LOGOUT */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            background: "#ff4d4d",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Logout
        </button>
      </div>

      <h2>User Voice Room</h2>
      <p style={{ color: "#666" }}>Meeting ID: {meetingId}</p>

      {!joined ? (

        <button onClick={() => joinMeeting()}>
          Join Meeting
        </button>

      ) : (

        <>
          <p style={{ marginTop: "20px" }}>
            Connected 🎧 <br /> <b>Hold button to speak</b>
          </p>

          <div style={{ marginTop: "30px" }}>

            <button
              style={{
                background: "#2196F3",
                color: "white",
                padding: "16px 28px",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer"
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

            <button onClick={toggleSpeaker}>
              {speakerOn ? "🔊 ON" : "🔇 OFF"}
            </button>

            <br /><br />

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