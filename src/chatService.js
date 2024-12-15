import { getDatabase, ref, push, onValue, serverTimestamp } from "firebase/database";

// Initialize Realtime Database
const db = getDatabase();

// Fetch messages for a specific channel in real-time
export const listenToMessages = (channelName, callback) => {
  const messagesRef = ref(db, `chats/${channelName}/messages`);
  onValue(messagesRef, (snapshot) => {
    const messages = snapshot.val() || {};
    const formattedMessages = Object.keys(messages).map((id) => ({
      id,
      ...messages[id],
    }));
    callback(formattedMessages);
  });
};

// Send a message to a specific channel
export const sendMessage = async (channelName, sender, text) => {
  const messagesRef = ref(db, `chats/${channelName}/messages`);
  await push(messagesRef, {
    sender,
    text,
    timestamp: serverTimestamp(),
  });
};