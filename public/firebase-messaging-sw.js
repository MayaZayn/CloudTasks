 // Scripts for firebase and firebase messaging
 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

 const firebaseConfig = {
  apiKey: "AIzaSyBwYLRw2quQcOaXG7-9inUUq9fPxpPF8Ns",
  authDomain: "cloudtasks-d57eb.firebaseapp.com",
  projectId: "cloudtasks-d57eb",
  databaseURL: "https://cloudtasks-d57eb-default-rtdb.firebaseio.com/",
  storageBucket: "cloudtasks-d57eb.firebasestorage.app",
  messagingSenderId: "1013980382270",
  appId: "1:1013980382270:web:f8058060e4561972d47d6f"
};

 firebase.initializeApp(firebaseConfig);

 // Retrieve firebase messaging
 const messaging = firebase.messaging();

 messaging.onBackgroundMessage(function(payload) {
   console.log("Received background message ", payload);

   const notificationTitle = payload.notification.title;
   const notificationOptions = {
     body: payload.notification.body,
   };

   self.registration.showNotification(notificationTitle, notificationOptions);
 });

 if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Registration successful, scope is:', registration.scope);
    }).catch(function(err) {
      console.log('Service worker registration failed, error:', err);
    });
  }