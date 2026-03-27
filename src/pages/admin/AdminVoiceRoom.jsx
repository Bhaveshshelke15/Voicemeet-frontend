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

  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);
  const combinedStream = useRef(new MediaStream());

  const audioContextRef = useRef(null);
  const destinationRef = useRef(null);

  // 🔥 NEW
  const hasRemoteJoined = useRef(false);

  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

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

    // AUDIO MIXER
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    destinationRef.current = audioContextRef.current.createMediaStreamDestination();

    const source = audioContextRef.current.createMediaStreamSource(localStream.current);
    source.connect(destinationRef.current);

    combinedStream.current = destinationRef.current.stream;

    setParticipants(["admin"]);

    startRecording();

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
      mediaRecorder.current = new MediaRecorder(combinedStream.current, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 64000
      });
    } catch (e) {
      console.error("❌ MediaRecorder error:", e);
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
      console.error("Recorder error FULL:", e);
    };

    try {
      mediaRecorder.current.start(2000);
    } catch (e) {
      console.error("Start recording failed:", e);
    }
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
        audio.playsInline = true;
        document.body.appendChild(audio);
        audioElements.current[userId] = audio;
      }

      const audio = audioElements.current[userId];
      audio.srcObject = event.streams[0];
      audio.muted = !speakerOn;
      audio.play().catch(() => {});

      // AUDIO MIX
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        try {
          const remoteSource =
            audioContextRef.current.createMediaStreamSource(event.streams[0]);
          remoteSource.connect(destinationRef.current);
        } catch (e) {
          console.log("Audio mix error:", e);
        }
      }

      // 🔥 FIX → Restart recorder when first user joins
      if (!hasRemoteJoined.current) {
        hasRemoteJoined.current = true;

        console.log("👥 Remote joined → restarting recorder");

        if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
          mediaRecorder.current.stop();

          setTimeout(() => {
            startRecording();
          }, 500);
        }
      }

      // SPEAKER DETECTION
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(event.streams[0]);

      source.connect(analyser);
      analyser.fftSize = 512;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSpokeTime = Date.now();

      const detectSpeaking = () => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (volume > 25) {
          lastSpokeTime = Date.now();
          setActiveSpeaker(userId);
        }

        if (Date.now() - lastSpokeTime > 800) {
          setActiveSpeaker(prev => (prev === userId ? null : prev));
        }

        requestAnimationFrame(detectSpeaking);
      };

      detectSpeaking();
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
  // LEAVE
  ////////////////////////////////////////////////////////

  const leaveMeeting = async () => {

    if (mediaRecorder.current) {

      const recorder = mediaRecorder.current;

      const uploadPromise = new Promise((resolve) => {

        recorder.onstop = async () => {

          const blob = new Blob(recordedChunks.current, {
            type: "audio/webm"
          });

          console.log("🎧 Blob size:", blob.size);

          if (blob.size === 0) {
            resolve();
            return;
          }

          const formData = new FormData();
          formData.append("file", blob, "recording.webm");
          formData.append("meetingId", meetingId);

          try {
            const res = await fetch(
              "https://voicemeet.onrender.com/recording/upload",
              {
                method: "POST",
                body: formData
              }
            );

            const text = await res.text();

            if (!res.ok) {
              console.error("❌ Upload failed:", text);
            } else {
              console.log("✅ Upload success:", text);
            }

          } catch (err) {
            console.error("❌ Upload failed:", err);
          }

          recordedChunks.current = [];
          resolve();
        };
      });

      if (recorder.state === "recording") {
        recorder.stop();
        await uploadPromise;
      }
    }

    // RESET FLAG
    hasRemoteJoined.current = false;

    // CLEANUP
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        await audioContextRef.current.close();
      } catch (e) {
        console.log("AudioContext close error:", e);
      }
    }

    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    Object.values(audioElements.current).forEach(audio => audio.remove());
    audioElements.current = {};

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }

    combinedStream.current = new MediaStream();

    setJoined(false);
    setParticipants([]);

    stompClient.current.publish({
  destination: "/app/signal",
  body: JSON.stringify({
    type: "leave",
    meetingId,
    sender: "admin"
  })
});

    
  };

  ////////////////////////////////////////////////////////
  // UI (UNCHANGED)
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
              <div
                key={p}
                className={`participant ${activeSpeaker === p ? "speaking" : ""}`}
              >
                <div className="avatar">
                  {p.charAt(0).toUpperCase()}
                </div>
                <p>{p}</p>
              </div>
            ))}
          </div>

          <div className="controls">

            <button className="mute-btn" onClick={toggleMute}>
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`speaker-btn ${speakerOn ? "on" : "off"}`}
            >
              {speakerOn ? "🔊 ON" : "🔇 OFF"}
            </button>

            <button className="leave-btn" onClick={leaveMeeting}>
              📞 Leave
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default AdminVoiceRoom;