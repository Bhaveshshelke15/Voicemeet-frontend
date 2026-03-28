import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import "../styles/chatbox.css";

function ChatBox({ currentUser, isAdmin = false }) {
  const [users, setUsers] = useState([]); // only needed for admin
  const [selectedUser, setSelectedUser] = useState(null); // chat partner
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const stompClient = useRef(null);
  const messageEndRef = useRef(null);

  //////////////////////////////////////////////////
  // AUTO SCROLL
  //////////////////////////////////////////////////
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //////////////////////////////////////////////////
  // CONNECT WEBSOCKET
  //////////////////////////////////////////////////
  useEffect(() => {
    const socket = new SockJS("https://voicemeet.onrender.com/ws");
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to websocket");

        // RECEIVE PRIVATE MESSAGE
        stompClient.current.subscribe(`/topic/private/${currentUser}`, (msg) => {
          const message = JSON.parse(msg.body);
          setMessages((prev) => [...prev, message]);

          // Notification
          if (message.sender !== currentUser && Notification.permission === "granted") {
            new Notification(`New Message from ${message.sender}`, { body: message.message });
          }

          // Seen
          if (message.sender !== currentUser) sendSeen(message.sender);

          // Admin auto-select user who sent message
          if (isAdmin && !selectedUser && message.sender !== currentUser) {
            setSelectedUser(message.sender);
          }
        });

        // TYPING INDICATOR
        stompClient.current.subscribe(`/topic/typing/${currentUser}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.sender === selectedUser) {
            setTypingUser(data.sender);
            setTimeout(() => setTypingUser(null), 2000);
          }
        });
      },
    });

    stompClient.current.activate();

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      stompClient.current?.deactivate();
    };
  }, [currentUser, selectedUser, isAdmin]);

  //////////////////////////////////////////////////
  // LOAD USERS (Admin only)
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://voicemeet.onrender.com/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);

        // Auto-select first user
        if (res.data.length > 0) setSelectedUser(res.data[0].userId);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  //////////////////////////////////////////////////
  // USER AUTO-SELECT ADMIN
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!isAdmin && !selectedUser) {
      setSelectedUser("admin"); // default chat partner for users
    }
  }, [isAdmin, selectedUser]);

  //////////////////////////////////////////////////
  // LOAD CHAT HISTORY
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `https://voicemeet.onrender.com/chat/history/${currentUser}/${selectedUser}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [selectedUser, currentUser]);

  //////////////////////////////////////////////////
  // SEND MESSAGE
  //////////////////////////////////////////////////
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    const msg = {
      sender: currentUser,
      receiver: selectedUser,
      message: text,
      status: "SENT",
      time: new Date().toLocaleTimeString(),
    };

    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/private-chat",
        body: JSON.stringify(msg),
      });
    }

    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  //////////////////////////////////////////////////
  // TYPING
  //////////////////////////////////////////////////
  const sendTyping = () => {
    if (stompClient.current?.connected && selectedUser) {
      stompClient.current.publish({
        destination: "/app/typing",
        body: JSON.stringify({ sender: currentUser, receiver: selectedUser }),
      });
    }
  };

  //////////////////////////////////////////////////
  // SEEN
  //////////////////////////////////////////////////
  const sendSeen = (sender) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/seen",
        body: JSON.stringify({ sender: currentUser, receiver: sender }),
      });
    }
  };

  //////////////////////////////////////////////////
  // FILTER MESSAGES FOR UI
  //////////////////////////////////////////////////
  const filteredMessages = messages.filter(
    (m) =>
      selectedUser &&
      ((m.sender === currentUser && m.receiver === selectedUser) ||
        (m.sender === selectedUser && m.receiver === currentUser))
  );

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div className="chat-wrapper">
      {isAdmin && (
        <div className="chat-users">
          <div className="user-list">
            {users.map((u) => (
              <div
                key={u.userId}
                className={`user-item ${selectedUser === u.userId ? "active" : ""}`}
                onClick={() => setSelectedUser(u.userId)}
              >
                {u.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-main">
        {selectedUser ? (
          <>
            <h4 className="chat-header">{selectedUser}</h4>

            <div className="chat-messages">
              {filteredMessages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.sender === currentUser ? "sent" : "received"}`}
                >
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

              {typingUser && <p className="typing">{typingUser} is typing...</p>}
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
          </>
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;