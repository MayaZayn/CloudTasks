import React, { useState, useEffect } from "react";
import { getChannels, addChannel, removeChannel } from "./channelService";
import { getUserSubscriptions, subscribeToChannel, unsubscribeFromChannel } from "./subscriptionService";
import { listenToMessages, sendMessage } from "./chatService";
import { getAnalytics, logEvent } from "firebase/analytics"; // Import Firebase Analytics

const analytics = getAnalytics();

const ChatApp = ({ user }) => {
  const [channels, setChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newChannel, setNewChannel] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const channelList = await getChannels();
      const subscriptions = await getUserSubscriptions(user?.uid);
      setChannels(channelList);
      setSubscribedChannels(subscriptions);
    };
    if (user) {
      console.log("Fetching data for user:", user.uid);
      fetchData();
    }
  }, [user]);

  // Listen for messages in the selected channel
  useEffect(() => {
    if (selectedChannel) {
      listenToMessages(selectedChannel, setMessages);
    } else {
      setMessages([]); // Clear messages when no channel is selected
    }
  }, [selectedChannel]);

  const handleAddChannel = async () => {
    if (newChannel.trim() !== "") {
      await addChannel(newChannel);
      const updatedChannels = await getChannels();
      setChannels(updatedChannels);
      setNewChannel("");
      // Log the "add_channel" event
      logEvent(analytics, "add_channel", {
        channel_name: newChannel,
        user_id: user?.uid || "anonymous", // Include user ID if available
      });
    }
  };

  const handleSubscribe = async (channelName) => {
    await subscribeToChannel(user.uid, channelName);
    const subscriptions = await getUserSubscriptions(user.uid);
    setSubscribedChannels(subscriptions);
  };

  const handleUnsubscribe = async (channelName) => {
    await unsubscribeFromChannel(user.uid, channelName);
    const subscriptions = await getUserSubscriptions(user.uid);
    setSubscribedChannels(subscriptions);
    if (selectedChannel === channelName) {
      setSelectedChannel(null);
    }
  };

  const handleRemoveChannel = async (channelId, channelName) => {
    await removeChannel(channelId);
    const updatedChannels = await getChannels();
    setChannels(updatedChannels);

    // Log the "delete_channel" event
    logEvent(analytics, "delete_channel", {
      channel_name: channelName,
      user_id: user?.uid || "anonymous", // Include user ID if available
      user_email : user.email
    });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "" && selectedChannel) {
      await sendMessage(selectedChannel, user.uid, newMessage);
      setNewMessage("");
    }
  };


  return (
    <div>
        <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
          <h1 style={{ textAlign: "center", color: "#333" }}>Manage Channels</h1>
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              placeholder="New Channel Name"
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            <button
              onClick={handleAddChannel}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "10px 15px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Add Channel
            </button>
          </div>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {channels.map((channel) => {
              const isSubscribed = subscribedChannels.includes(channel.name);

              return (
                <li
                  key={channel.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{channel.name}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {!isSubscribed ? (
                      <>
                        <button
                          onClick={() => handleSubscribe(channel.name)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Subscribe
                        </button>
                        <button
                          onClick={() => handleRemoveChannel(channel.id, channel.name)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUnsubscribe(channel.name)}
                          style={{
                            backgroundColor: "#ffc107",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Unsubscribe
                        </button>
                        <button
                          onClick={() =>
                            setSelectedChannel(
                              selectedChannel === channel.name ? null : channel.name
                            )
                          }
                          style={{
                            backgroundColor: selectedChannel === channel.name ? "#6c757d" : "#17a2b8",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          {selectedChannel === channel.name ? "Close Chat" : "Open Chat"}
                        </button>
                        <button
                          onClick={() => handleRemoveChannel(channel.id)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {selectedChannel && (
            <div>
              <h2 style={{ color: "#333", textAlign: "center" }}>
                Chat Room: {selectedChannel}
              </h2>
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  height: "300px",
                  overflowY: "scroll",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                  marginBottom: "10px",
                }}
              >
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    <strong style={{ display: "block", marginBottom: "5px" }}>
                      {msg.sender}:
                    </strong>
                    {msg.text}
                    <div style={{ fontSize: "0.8em", color: "#888" }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                  disabled={!selectedChannel}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  disabled={!selectedChannel}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default ChatApp;
