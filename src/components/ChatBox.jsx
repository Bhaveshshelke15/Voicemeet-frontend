import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

function ChatBox({ currentUser }) {

const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [messages, setMessages] = useState([]);
const [text, setText] = useState("");

const stompClient = useRef(null);

//////////////////////////////////////////////////
// CONNECT WEBSOCKET
//////////////////////////////////////////////////

useEffect(() => {

 const socket = new SockJS("https://voicemeet.onrender.com/ws");

 stompClient.current = new Client({

  webSocketFactory: () => socket,

  onConnect: () => {

   console.log("Connected to websocket");

   stompClient.current.subscribe(
    "/topic/private/" + currentUser,
    (msg) => {

     const message = JSON.parse(msg.body);

     setMessages(prev => [...prev, message]);

    }
   );

  }

 });

 stompClient.current.activate();

}, [currentUser]);

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
 headers:{
  Authorization: "Bearer " + token
 }
});

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

const sendMessage = () => {

 if (!text.trim()) return;

 const msg = {

  sender: currentUser,
  receiver: selectedUser,
  message: text,
  time: new Date().toLocaleTimeString()

 };

 stompClient.current.publish({

  destination: "/app/private-chat",
  body: JSON.stringify(msg)

 });

 setMessages(prev => [...prev, msg]);

 setText("");

};

//////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////

return (

<div className="chat-container">

{/* SEARCH */}

<input
 placeholder="Search employee..."
 onChange={(e) => searchUser(e.target.value)}
/>

{/* USER LIST */}

<div className="user-list">

{users.map((u) => (

<div
 key={u.userId}
 onClick={() => loadChat(u.userId)}
 style={{
  cursor: "pointer",
  padding: "5px",
  borderBottom: "1px solid #ddd"
 }}
>

{u.name} ({u.userId})

</div>

))}

</div>

{/* CHAT WINDOW */}

{selectedUser && (

<div className="chat-window">

<h4>Chat with {selectedUser}</h4>

<div
 className="messages"
 style={{
  height: "200px",
  overflowY: "auto",
  border: "1px solid #ddd",
  marginBottom: "10px",
  padding: "5px"
 }}
>

{messages.map((m, i) => (

<p key={i}>
<b>{m.sender}:</b> {m.message}
</p>

))}

</div>

<input
 value={text}
 onChange={(e) => setText(e.target.value)}
 placeholder="Type message..."
/>

<button onClick={sendMessage}>
Send
</button>

</div>

)}

</div>

);

}

export default ChatBox;