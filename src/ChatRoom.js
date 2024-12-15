import React, { useState, useEffect } from "react";
import { listenToMessages, sendMessage } from "./chatService";

const ChatRoom = ({ channelName, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = listenToMessages(channelName, setMessages);
    return () => unsubscribe && unsubscribe(); // Cleanup listener
  }, [channelName]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      await sendMessage(channelName, userId, newMessage);
      setNewMessage("");
    }
  };

  return (
    <div>
      <h2>Chat Room: {channelName}</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>{msg.sender}: </strong>
            <span>{msg.text}</span>
            <div style={{ fontSize: "0.8em", color: "#888" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          style={{ width: "80%", padding: "5px" }}
        />
        <button onClick={handleSendMessage} style={{ padding: "5px 10px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;