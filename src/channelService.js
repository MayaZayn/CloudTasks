import { firestore } from "./firebase";
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";


// Fetch all channels
export const getChannels = async () => {
    const channelsSnapshot = await getDocs(collection(firestore, "channels"));
    return channelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  // Add a new channel
  export const addChannel = async (channelName) => {
    await addDoc(collection(firestore, "channels"), {
      name: channelName,
      createdAt: new Date().toISOString(),
    });
  };
  
  // Remove a channel
  export const removeChannel = async (channelId) => {
    await deleteDoc(doc(firestore, "channels", channelId));
  };