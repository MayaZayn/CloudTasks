import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Assuming firebase config exists
import { getAnalytics, logEvent } from "firebase/analytics";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase"; // Ensure messaging is initialized in firebase.js
import { onMessage } from "firebase/messaging";

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

const analytics = getAnalytics();

const AuthComponent = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone', or 'google'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);



  useEffect(() => {
    // More robust Recaptcha initialization
    const initRecaptcha = () => {
      if (recaptchaVerifier) return; // Avoid reinitializing if already set
      try {
        const verifier = new RecaptchaVerifier(auth, 'sign-in-button', {
          size: 'invisible',
          callback: (response) => {
            console.log("Recaptcha Success", response);
          },
          'error-callback': (error) => {
            console.error("Recaptcha Error", error);
          }
        });
  
        verifier.render().catch((renderError) => {
          console.error("Recaptcha Render Error", renderError);
        });
  
        setRecaptchaVerifier(verifier);
      } catch (initError) {
        console.error("Recaptcha Init Error", initError);
      }
    };
  
    if (typeof window !== 'undefined') {
      initRecaptcha();
    }
  }, [recaptchaVerifier]); // Add recaptchaVerifier to the dependency array
  
  
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let userCredential;

      if (isLogin) {
        // Sign In
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
  
      const user = userCredential.user;
  
      // Check for first-time login
      if (user.metadata.lastSignInTime === user.metadata.creationTime) {
        logEvent(analytics, "first_time_login", {
          user_id: user.uid,
          email: user.email,
          login_method: "email",
        });
      }
  
      // Handle successful authentication
      fcmMessages(user);
      onAuthSuccess(user);
    } catch (error) {
      // More informative error handling
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError('This user account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/email-already-in-use':
          setError('Email is already registered. Try logging in.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
      console.error('Authentication error:', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check for first-time login      
      if (result.user.metadata.lastSignInTime === result.user.metadata.creationTime) {
        logEvent(analytics, "first_time_login", {
          user_id: result.user.uid,
          email: result.user.email,
          login_method: "google",
        });
      }
      fcmMessages(result.user);
      onAuthSuccess(result.user);
    } catch (error) {
      setError('Google sign-in failed');
      console.error('Error with Google sign-in:', error.message);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }
    if (!recaptchaVerifier) {
      setError('reCAPTCHA not initialized');
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log(confirmationResult);
      setConfirmationResult(confirmationResult);
      setError(null);
      setAuthMethod('phone');
    } catch (error) {
      setError(error.message || 'Error sending OTP');
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      
      // Check for first-time login
      if (result.user.metadata.lastSignInTime === result.user.metadata.creationTime) {
        logEvent(analytics, "first_time_login", {
          user_id: result.user.uid,
          phone_number: result.user.phoneNumber,
          login_method: "phone",
        });
      }
      fcmMessages(result.user);
      onAuthSuccess(result.user);
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error("Error verifying OTP:", error);
    }
  };


const fcmMessages = async (user) => {
  try {
    const fcmToken = await getToken(messaging, { 
      vapidKey: "BGAHGNKLBU6fIdqxGsI8hWBEBJsz9FrJM8-xgVC7pA6Ojenb9Q2snBe2eTZz1oXmAV9uqvKmXEV8i-_vP7N8SJ4",
    });
    console.log('fcmtoken',fcmToken);
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
    });
    
  } catch (error) {
    console.error("Error fetching FCM token:", error);
  }
};

  const renderAuthMethodSwitch = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      marginBottom: '15px' 
    }}>
      <button 
        onClick={() => setAuthMethod('email')}
        style={{
          backgroundColor: authMethod === 'email' ? '#4CAF50' : '#2196F3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Email
      </button>
      <button 
        onClick={() => setAuthMethod('phone')}
        style={{
          backgroundColor: authMethod === 'phone' ? '#4CAF50' : '#2196F3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Phone
      </button>
      <button 
        onClick={() => setAuthMethod('google')}
        style={{
          backgroundColor: authMethod === 'google' ? '#4CAF50' : '#DB4437',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Google
      </button>
    </div>
  );

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* <div id="sign-in-button"></div> */}
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        {authMethod === 'email' ? (isLogin ? 'Log In' : 'Sign Up') : 
         authMethod === 'phone' ? 'Phone Authentication' : 
         'Continue with Google'}
      </h2>

      {error && (
        <div style={{
          backgroundColor: '#ffdddd',
          color: '#f44336',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {renderAuthMethodSwitch()}

      {/* Email Authentication */}
      {authMethod === 'email' && (
        <form onSubmit={handleEmailAuth}>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '15px' 
          }}>
            <button 
              type="submit"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>

            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Switch to {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
      )}

      {/* Phone Authentication */}
      {authMethod === 'phone' && (
        <div>
          <div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            {!confirmationResult ? (
              <div>
              <button 
                onClick={handleSendOtp}
                style={{
                  width: '100%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Send OTP
              </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <button 
                  onClick={handleVerifyOtp}
                  style={{
                    width: '100%',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Verify OTP
                </button>
              </>
            )}
          </div>
          <div id="recaptcha-container"></div>
        </div>
      )}

      {/* Google Authentication */}
      {authMethod === 'google' && (
        <button 
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            backgroundColor: '#DB4437',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continue with Google
        </button>
      )}
    </div>
  );
};

export default AuthComponent;