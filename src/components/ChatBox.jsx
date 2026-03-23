import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

function ChatBox({ currentUser }) {

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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

        console.log("Connected to websocket");

        // ✅ RECEIVE MESSAGE
        stompClient.current.subscribe(
          "/topic/private/" + currentUser,
          (msg) => {

            const message = JSON.parse(msg.body);

            if (
              (message.sender === selectedUser && message.receiver === currentUser) ||
              (message.sender === currentUser && message.receiver === selectedUser)
            ) {
              setMessages(prev => [...prev, message]);

              // 🔔 Notification
              if (message.sender !== currentUser) {
                new Notification("New Message", {
                  body: message.message
                });
              }

              // ✅ SEND SEEN
              sendSeen(message.sender);
            }
          }
        );

        // ✅ TYPING
        stompClient.current.subscribe(
          "/topic/typing/" + currentUser,
          (msg) => {
            const data = JSON.parse(msg.body);
            if (data.sender === selectedUser) {
              setTypingUser(data.sender);
              setTimeout(() => setTypingUser(null), 2000);
            }
          }
        );

      }

    });

    stompClient.current.activate();

    // 🔔 Notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

  }, [currentUser, selectedUser]);

  //////////////////////////////////////////////////
  // SEARCH USER
  //////////////////////////////////////////////////

  const searchUser = async (keyword) => {

    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8080/admin/search-user?keyword=" + keyword,
        {
          headers: { Authorization: "Bearer " + token }
        }
      );

      setUsers(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  //////////////////////////////////////////////////
  // LOAD CHAT HISTORY
  //////////////////////////////////////////////////

  const loadChat = async (userId) => {

    setSelectedUser(userId);

    try {

      const res = await axios.get(
        `https://voicemeet.onrender.com/chat/history/${currentUser}/${userId}`
      );

      setMessages(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  //////////////////////////////////////////////////
  // SEND MESSAGE
  //////////////////////////////////////////////////

  const sendMessage = async () => {

    if (!text.trim() || !selectedUser) return;

    const msg = {
      sender: currentUser,
      receiver: selectedUser,
      message: text,
      status: "SENT",
      time: new Date().toLocaleTimeString()
    };

    try {

      await axios.post(
        "https://voicemeet.onrender.com/chat/send",
        msg
      );

      if (stompClient.current?.connected) {
        stompClient.current.publish({
          destination: "/app/private-chat",
          body: JSON.stringify(msg)
        });
      }

      setMessages(prev => [...prev, msg]);
      setText("");

    } catch (err) {
      console.error(err);
    }

  };

  //////////////////////////////////////////////////
  // TYPING
  //////////////////////////////////////////////////

  const sendTyping = () => {

    if (stompClient.current?.connected && selectedUser) {

      stompClient.current.publish({
        destination: "/app/typing",
        body: JSON.stringify({
          sender: currentUser,
          receiver: selectedUser
        })
      });

    }

  };

  //////////////////////////////////////////////////
  // SEEN ✔✔
  //////////////////////////////////////////////////

  const sendSeen = (sender) => {

    if (stompClient.current?.connected) {

      stompClient.current.publish({
        destination: "/app/seen",
        body: JSON.stringify({
          sender: currentUser,
          receiver: sender
        })
      });

    }

  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="chat-container" style={{ display: "flex", height: "400px" }}>

      {/* LEFT SIDE */}
      <div style={{ width: "30%", borderRight: "1px solid #ddd" }}>

        <input
          placeholder="Search..."
          onChange={(e) => searchUser(e.target.value)}
        />

        {users.map(u => (
          <div key={u.userId} onClick={() => loadChat(u.userId)}>
            {u.name}
          </div>
        ))}

      </div>

      {/* RIGHT SIDE */}
      <div style={{ width: "70%", padding: "10px" }}>

        {selectedUser && (
          <>
            <h4>{selectedUser}</h4>

            {/* MESSAGES */}
            <div style={{ height: "250px", overflowY: "auto" }}>

              {messages.map((m, i) => (

                <div
                  key={i}
                  style={{
                    textAlign: m.sender === currentUser ? "right" : "left",
                    margin: "5px"
                  }}
                >

                  <span
                    style={{
                      background: m.sender === currentUser ? "#dcf8c6" : "#fff",
                      padding: "8px",
                      borderRadius: "10px",
                      display: "inline-block"
                    }}
                  >
                    {m.message}
                    <br />

                    <small>
                      {m.time} {" "}
                      {m.sender === currentUser &&
                        (m.status === "SEEN" ? "✔✔" : "✔")}
                    </small>

                  </span>

                </div>

              ))}

              {/* TYPING */}
              {typingUser && (
                <p>{typingUser} typing...</p>
              )}

              <div ref={messageEndRef}></div>

            </div>

            {/* INPUT */}
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
              placeholder="Type message..."
            />

            <button onClick={sendMessage}>Send</button>

          </>
        )}

      </div>

    </div>

  );

}

export default ChatBox;