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

  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);
  const combinedStream = useRef(new MediaStream());

  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
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

    // ✅ Reset combined stream
    combinedStream.current = new MediaStream();

    localStream.current.getTracks().forEach(track => {
      combinedStream.current.addTrack(track);
    });

    setParticipants(["admin"]);

    startRecording(); // ✅ start recording

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
  // RECORDING
  ////////////////////////////////////////////////////////

  const startRecording = () => {

    recordedChunks.current = [];

    try {
      mediaRecorder.current = new MediaRecorder(combinedStream.current);
    } catch (e) {
      console.error("❌ MediaRecorder not supported", e);
      return;
    }

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstart = () => {
      console.log("🎙 Recording started");
    };

    mediaRecorder.current.onerror = (e) => {
      console.error("Recorder error:", e);
    };

    // ✅ timeslice FIX
    mediaRecorder.current.start(1000);
  };

  ////////////////////////////////////////////////////////
  // SIGNAL
  ////////////////////////////////////////////////////////

  const handleSignal = async (message) => {

    const data = JSON.parse(message.body);

    if (data.target && data.target !== "admin") return;
    if (data.sender === "admin") return;

    if (data.type === "join") {

      setParticipants(prev =>
        prev.includes(data.sender) ? prev : [...prev, data.sender]
      );

      if (!peerConnections.current[data.sender]) {
        createConnection(data.sender);
      }
    }

    if (data.type === "answer") {

      const pc = peerConnections.current[data.sender];

      if (pc && pc.signalingState !== "stable") {
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        } catch (e) {}
      }
    }

    if (data.type === "candidate") {

      const pc = peerConnections.current[data.sender];
      const candidate = new RTCIceCandidate(data.candidate);

      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {}
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

      if (!audioElements.current[userId]) {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        document.body.appendChild(audio);
        audioElements.current[userId] = audio;
      }

      const audio = audioElements.current[userId];
      audio.srcObject = event.streams[0];
      audio.muted = !speakerOn;

      // ✅ Add remote audio to recording
      event.streams[0].getTracks().forEach(track => {
        combinedStream.current.addTrack(track);
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
  // LEAVE (FINAL FIXED)
  ////////////////////////////////////////////////////////

  const leaveMeeting = () => {

    if (mediaRecorder.current) {

      const recorder = mediaRecorder.current;

      recorder.onstop = async () => {

        console.log("🔥 Recording stopped");

        const blob = new Blob(recordedChunks.current, {
          type: "audio/webm"
        });

        console.log("🎧 Blob size:", blob.size);

        if (blob.size === 0) {
          console.log("❌ Empty recording");
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
        formData.append("meetingId", meetingId);

        try {
          const res = await fetch("https://voicemeet.onrender.com/recording/upload", {
            method: "POST",
            body: formData
          });

          console.log("✅ Upload status:", res.status);

        } catch (err) {
          console.error("Upload failed:", err);
        }
      };

      // ✅ SAFE STOP
      if (recorder.state === "recording") {
        recorder.stop();
      } else {
        console.log("⚠ Recorder already stopped");
      }
    }

    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    Object.values(audioElements.current).forEach(audio => audio.remove());
    audioElements.current = {};

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

      {!joined ? (
        <button onClick={joinMeeting}>Start Meeting</button>
      ) : (
        <>
          <div className="controls">

            <button onClick={toggleMute}>
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>

            <button onClick={toggleSpeaker}>
              {speakerOn ? "🔊 ON" : "🔇 OFF"}
            </button>

            <button onClick={leaveMeeting}>
              Leave
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default AdminVoiceRoom;