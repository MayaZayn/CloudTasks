import React, { useState } from "react";
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import { onMessage } from "firebase/messaging";
import "./App.css"; // Import CSS styles

const NotificationChannels = () => {
  const [channels] = useState(["News", "Sports", "Weather"]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BO_tCqP6ByUVLrx1bvmfmCwEmHkIorFPyM_-z-JDarh8EkHcxqYYvnuErRMD2XsCtAd9WA412cRp3fbPWT50WKo",
      });
      console.log("FCM Token:", token);
    } else {
      console.error("Permission not granted for notifications.");
    }
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
    });
  };

  const subscribeToChannel = async (channel) => {
    try {
      const token = await getToken(messaging, {
        vapidKey: "BO_tCqP6ByUVLrx1bvmfmCwEmHkIorFPyM_-z-JDarh8EkHcxqYYvnuErRMD2XsCtAd9WA412cRp3fbPWT50WKo",
      });

      await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, channel }),
      });

      if (!subscribedChannels.includes(channel)) {
        setSubscribedChannels([...subscribedChannels, channel]);
        console.log(`Subscribed to topic: ${channel}`);
      }
    } catch (error) {
      console.error("Error subscribing to topic:", error);
    }
  };

  const unsubscribeFromChannel = async (channel) => {
    const token = await getToken(messaging, {
      vapidKey: "BO_tCqP6ByUVLrx1bvmfmCwEmHkIorFPyM_-z-JDarh8EkHcxqYYvnuErRMD2XsCtAd9WA412cRp3fbPWT50WKo",
    });
    await fetch("http://localhost:5000/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, channel }),
    });
    setSubscribedChannels(subscribedChannels.filter((c) => c !== channel));
    console.log(`Unsubscribed from ${channel}`);
  };

  return (
    <div className="app-container">
      <h1>Notification Channels</h1>
      <button className="btn primary" onClick={requestNotificationPermission}>
        Enable Notifications
      </button>
      <div className="channel-section">
        <h2>Available Channels</h2>
        <ul>
          {channels.map((channel) => (
            <li key={channel} className="channel-item">
              <span>{channel}</span>
              <button
                className="btn subscribe"
                onClick={() => subscribeToChannel(channel)}
              >
                Subscribe
              </button>
              <button
                className="btn unsubscribe"
                onClick={() => unsubscribeFromChannel(channel)}
              >
                Unsubscribe
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="channel-section">
        <h2>Subscribed Channels</h2>
        <ul>
          {subscribedChannels.map((channel) => (
            <li key={channel} className="channel-item subscribed">
              {channel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationChannels;