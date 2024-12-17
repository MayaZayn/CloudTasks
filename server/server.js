const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloud-tasks-8b225-default-rtdb.firebaseio.com"
});


// const verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).send('Unauthorized');

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     req.user = decodedToken;
//     next();
//   } catch (error) {
//     res.status(403).send('Invalid token');
//   }
// };

// Endpoint to subscribe to a topic
app.post("/subscribe", async (req, res) => {
    try {
        const token = req.body.token;
        const topic = req.body.channel;
        await admin.messaging().subscribeToTopic(token, topic);
        res.status(200).send(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    res.status(500).send("Failed to subscribe to topic.");
  }
});

// Endpoint to unsubscribe from a topic
app.post("/unsubscribe", async (req, res) => {
    try {
        const token = req.body.token;
        const topic = req.body.channel;
        await admin.messaging().unsubscribeFromTopic(token, topic);
        res.status(200).send(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    res.status(500).send("Failed to unsubscribe from topic.");
  }
});


const firestore = admin.firestore();
firestore.settings({
  host: "localhost:8080", // Firestore emulator host (default: localhost:8080)
  ssl: false, // Disable SSL (not needed for emulators)
});

app.post("/save-fcm-token", async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).send("Invalid request.");
  }

  try {
    // Save FCM token to Firestore
    await firestore.collection("users").doc(userId).set(
      { fcmToken },
      { merge: true }
    );
    res.status(200).send("FCM token saved.");
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).send("Error saving FCM token.");
  }
});



const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
