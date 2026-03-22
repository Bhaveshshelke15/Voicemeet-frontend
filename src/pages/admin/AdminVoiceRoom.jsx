import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams } from "react-router-dom";

function AdminVoiceRoom() {

  const { meetingId } = useParams();

  const stompClient = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  const [joined, setJoined] = useState(false);

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

    // 🔥 IMPORTANT FILTER
    if (data.target && data.target !== "admin") return;

    if (data.sender === "admin") return;

    if (data.type === "join") {

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
  // CREATE CONNECTION
  ////////////////////////////////////////////////////////

  const createConnection = async (userId) => {

    const pc = new RTCPeerConnection(configuration);

    peerConnections.current[userId] = pc;

    localStream.current.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current);
    });

    pc.ontrack = (event) => {

      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;

      audio.play().catch(() => {
        console.log("Autoplay blocked");
      });
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

    // 🔥 CREATE OFFER
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
  // UI
  ////////////////////////////////////////////////////////

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Voice Room</h2>
      <p>Meeting ID: {meetingId}</p>

      {!joined ? (
        <button onClick={joinMeeting}>Start Meeting</button>
      ) : (
        <p>Meeting Live 🎤</p>
      )}
    </div>
  );
}

export default AdminVoiceRoom;