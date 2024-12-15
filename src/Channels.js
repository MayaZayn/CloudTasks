import React, { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  getDoc,
  query, 
  where,
  doc,
  setDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ChatRoom from "./ChatRoom";

const Channels = () => {
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [allChannels, setAllChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [userName, setUserName] = useState("");

  // Fetch user's port/name and channels
  useEffect(() => {
    const fetchUserAndChannels = async () => {
      if (!user) return;

      try {
        // Fetch or create user document with port as name
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Generate a unique port/name if not exists
          const portName = `Port-${Math.floor(Math.random() * 1000)}`;
          await setDoc(userDocRef, {
            name: portName,
            createdAt: Date.now()
          });
          setUserName(portName);
        } else {
          setUserName(userDoc.data().name);
        }

        // Fetch all channels
        const channelsSnapshot = await getDocs(collection(firestore, "channels"));
        const channelsList = channelsSnapshot.docs.map((doc) => doc.data().name);
        setAllChannels(channelsList);

        // Fetch user's subscribed channels
        const subscribedQuery = query(
          collection(firestore, "userChannels"),
          where("userId", "==", user.uid)
        );
        const subscribedSnapshot = await getDocs(subscribedQuery);
        const userChannels = subscribedSnapshot.docs.map((doc) => doc.data().channelName);
        setSubscribedChannels(userChannels);
      } catch (error) {
        console.error("Error fetching user and channels:", error);
      }
    };

    fetchUserAndChannels();
  }, [user, firestore]);

  // Create a new channel
  const createChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    try {
      // Create channel document with a specific ID to avoid duplicates
      const channelDocRef = doc(firestore, "channels", newChannelName);
      
      // Use setDoc instead of addDoc to control the document ID
      await setDoc(channelDocRef, {
        name: newChannelName,
        createdBy: user.uid,
        createdAt: Date.now()
      }, { merge: true }); // Use merge to avoid overwriting existing data

      // Automatically subscribe user to the new channel
      await subscribeToChannel(newChannelName);

      // Reset input and update state
      setNewChannelName("");
      
      // Ensure the new channel is added to allChannels if not already present
      setAllChannels(prev => 
        prev.includes(newChannelName) 
          ? prev 
          : [...prev, newChannelName]
      );
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Error creating channel. It might already exist.");
    }
  };

  // Subscribe to a channel
  const subscribeToChannel = async (channelName) => {
    if (!user) return;

    try {
      // Check if already subscribed
      const q = query(
        collection(firestore, "userChannels"),
        where("userId", "==", user.uid),
        where("channelName", "==", channelName)
      );
      const existingSubscription = await getDocs(q);

      if (existingSubscription.empty) {
        // Add subscription
        await addDoc(collection(firestore, "userChannels"), {
          userId: user.uid,
          channelName: channelName,
          subscribedAt: Date.now()
        });

        // Update local state
        setSubscribedChannels(prev => [...prev, channelName]);
      }
    } catch (error) {
      console.error("Error subscribing to channel:", error);
    }
  };

  // Open a chat room
  const openChatRoom = (channel) => {
    setSelectedChannel(channel);
  };

  // Close chat room
  const closeChatRoom = () => {
    setSelectedChannel(null);
  };

  // Channels not yet subscribed to
  const availableChannels = allChannels.filter(
    channel => !subscribedChannels.includes(channel)
  );

  return (
    <div>
      <h1>Channels</h1>

      {/* User Name Display */}
      <div>
        <h2>Your Port: {userName}</h2>
      </div>

      {/* Channel Creation */}
      <div>
        <input
          type="text"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          placeholder="New Channel Name"
        />
        <button onClick={createChannel}>Create Channel</button>
      </div>

      {/* Subscribed Channels */}
      <div>
        <h2>Subscribed Channels</h2>
        {subscribedChannels.map((channel) => (
          <button 
            key={channel} 
            onClick={() => openChatRoom(channel)}
          >
            {channel}
          </button>
        ))}
      </div>

      {/* Available Channels to Subscribe */}
      <div>
        <h2>Available Channels</h2>
        {availableChannels.map((channel) => (
          <button 
            key={channel} 
            onClick={() => subscribeToChannel(channel)}
          >
            Subscribe to {channel}
          </button>
        ))}
      </div>

      {/* Chat Room */}
      {selectedChannel && (
        <ChatRoom 
          channelName={selectedChannel} 
          onClose={closeChatRoom} 
          userName={userName}
        />
      )}
    </div>
  );
};

export default Channels;