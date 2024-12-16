import AuthComponent from './AuthComponent';  // Import AuthComponent

const AuthApp = ({ onAuthSuccess }) => {
  const handleAuthSuccess = (user) => {
    onAuthSuccess(user);
  };

  return (
    <div>
      <div id="sign-in-button"></div>
      <AuthComponent onAuthSuccess={handleAuthSuccess} />
    </div>
  );
};

export default AuthApp;
