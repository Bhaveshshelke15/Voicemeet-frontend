import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import "../styles/chatbox.css";

function ChatBox({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const stompClient = useRef(null);
  const messageEndRef = useRef(null);

  // Fixed chat target: Admin
  const adminId = "admin";

  // AUTO SCROLL
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CONNECT WEBSOCKET
  useEffect(() => {
    const socket = new SockJS("https://voicemeet.onrender.com/ws");

    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to websocket");

        // RECEIVE MESSAGES
        stompClient.current.subscribe(`/topic/private/${currentUser}`, (msg) => {
          const message = JSON.parse(msg.body);

          // Only process messages between user & admin
          if (
            (message.sender === adminId && message.receiver === currentUser) ||
            (message.sender === currentUser && message.receiver === adminId)
          ) {
            setMessages((prev) => [...prev, message]);

            // Notification
            if (message.sender === adminId && Notification.permission === "granted") {
              new Notification("New Message from Admin", { body: message.message });
            }

            // Mark as seen
            if (message.sender === adminId) sendSeen(message.sender);
          }
        });

        // TYPING INDICATOR
        stompClient.current.subscribe(`/topic/typing/${currentUser}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.sender === adminId) {
            setTypingUser(data.sender);
            setTimeout(() => setTypingUser(null), 2000);
          }
        });
      },
    });

    stompClient.current.activate();

    // Notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      stompClient.current?.deactivate();
    };
  }, [currentUser]);

  // LOAD CHAT HISTORY with admin
  useEffect(() => {
    const loadChat = async () => {
      try {
        const res = await axios.get(
          `https://voicemeet.onrender.com/chat/history/${currentUser}/${adminId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadChat();
  }, [currentUser]);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      sender: currentUser,
      receiver: adminId,
      message: text,
      status: "SENT",
      time: new Date().toLocaleTimeString(),
    };

    // Send via WebSocket
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/private-chat",
        body: JSON.stringify(msg),
      });
    }

    // Update UI instantly
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  // TYPING INDICATOR
  const sendTyping = () => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/typing",
        body: JSON.stringify({ sender: currentUser, receiver: adminId }),
      });
    }
  };

  // MARK AS SEEN
  const sendSeen = (sender) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/seen",
        body: JSON.stringify({ sender: currentUser, receiver: sender }),
      });
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-main">
        <h4 className="chat-header">Admin</h4>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender === currentUser ? "sent" : "received"}`}>
              <span className="message-bubble">
                {m.message}
                <br />
                <small>
                  {m.time}{" "}
                  {m.sender === currentUser && (m.status === "SEEN" ? "✔✔" : "✔")}
                </small>
              </span>
            </div>
          ))}

          {typingUser && <p className="typing">Admin is typing...</p>}
          <div ref={messageEndRef}></div>
        </div>

        <div className="chat-input-area">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              sendTyping();
            }}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;