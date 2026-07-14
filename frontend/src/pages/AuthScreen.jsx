import { useState } from 'react';
import LoginPage from './LoginPage';
import ForgotPassword from './ForgotPassword';
import VerifyOtp from './VerifyOtp';
import ResetPassword from './ResetPassword';
import ResetSuccess from './ResetSuccess';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Pre-authentication flow controller. Swaps between the login screen and the
 * password-recovery sequence (forgot → otp → reset → success) with a small
 * local state machine. Once AuthContext reports authentication, App's gate
 * unmounts this whole tree.
 */
const AuthScreen = () => {
  const [view,  setView]  = useState('login'); // login | forgot | otp | reset | success
  const [email, setEmail] = useState('');

  const goLogin = () => setView('login');

  const renderView = () => {
    switch (view) {
      case 'forgot':
        return (
          <ForgotPassword
            initialEmail={email}
            onSent={(e) => { setEmail(e); setView('otp'); }}
            onBack={goLogin}
          />
        );
      case 'otp':
        return (
          <VerifyOtp
            email={email}
            onVerified={() => setView('reset')}
            onBack={goLogin}
          />
        );
      case 'reset':
        return <ResetPassword onReset={() => setView('success')} />;
      case 'success':
        return <ResetSuccess onDone={goLogin} />;
      default:
        return <LoginPage onForgotPassword={() => setView('forgot')} />;
    }
  };

  return (
    <>
      <ThemeToggle floating />
      {renderView()}
    </>
  );
};

export default AuthScreen;
