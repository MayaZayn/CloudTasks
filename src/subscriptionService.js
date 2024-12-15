import { firestore } from "./firebase";
import { collection, query, where, getDocs, getDoc, updateDoc, doc, setDoc } from "firebase/firestore";

// Fetch user subscriptions
export const getUserSubscriptions = async (userId) => {
  const subscriptionsRef = collection(firestore, "userSubscriptions");
  const q = query(subscriptionsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data().channels || [];
  }
  return [];
};

// Subscribe to a channel
export const subscribeToChannel = async (userId, channelName) => {
  const subscriptionsRef = collection(firestore, "userSubscriptions");
  const q = query(subscriptionsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // First-time subscription
    await setDoc(doc(firestore, "userSubscriptions", userId), {
      userId,
      channels: [channelName],
    });
  } else {
    // Update existing subscription
    const docRef = querySnapshot.docs[0].ref;
    const existingChannels = querySnapshot.docs[0].data().channels || [];
    if (!existingChannels.includes(channelName)) {
      await updateDoc(docRef, {
        channels: [...existingChannels, channelName],
      });
    }
  }
};

// Unsubscribe from a channel
export const unsubscribeFromChannel = async (userId, channelName) => {
  const subscriptionsRef = collection(firestore, "userSubscriptions");
  const q = query(subscriptionsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    const existingChannels = querySnapshot.docs[0].data().channels || [];
    const updatedChannels = existingChannels.filter((channel) => channel !== channelName);
    await updateDoc(docRef, {
      channels: updatedChannels,
    });
  }
};