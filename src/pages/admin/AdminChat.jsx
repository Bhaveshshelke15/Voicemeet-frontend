import ChatBox from "../../components/ChatBox";

export default function AdminChat() {
  return (
    <div style={{ height: "80vh" }}>
      <ChatBox currentUser="admin" />
    </div>
  );
}