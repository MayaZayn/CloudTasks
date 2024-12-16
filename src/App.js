import React, { useState } from "react";
import ChatApp from "./ChatApp"; // Import the ChatApp component
import NotificationChannels from "./NotificationChannels"; // Import the NotificationChannels component
import AuthApp from "./AuthApp"; // Import AuthApp component

const App = () => {
  const [currentPage, setCurrentPage] = useState("chat"); // "chat" or "notifications"
  const [user, setUser] = useState(null); // Store authenticated user

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };
  
  localStorage.setItem('debug_mode', 'true');
  return (
    <div>
      {/* If the user is not authenticated, show AuthApp */}
      {!user ? (
        <AuthApp onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          {/* Navigation Bar */}
          <nav
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
            }}
          >
            <button
              onClick={() => setCurrentPage("chat")}
              style={{
                backgroundColor: currentPage === "chat" ? "#0056b3" : "transparent",
                color: "white",
                border: "none",
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setCurrentPage("notifications")}
              style={{
                backgroundColor:
                  currentPage === "notifications" ? "#0056b3" : "transparent",
                color: "white",
                border: "none",
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Notifications
            </button>
          </nav>

          {/* Page Content */}
          <div>
            {currentPage === "chat" ? (
              <ChatApp user={user} /> // Pass user to ChatApp
            ) : (
              <NotificationChannels user={user} /> // Pass user to NotificationChannels
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
