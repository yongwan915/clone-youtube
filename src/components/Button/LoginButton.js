import React from 'react';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './LoginButton.css';

function LoginButton({ isLoggedIn, onClick, children }) {
  if (!isLoggedIn) {
    return (
      <Link to="/login" className="link__to__login">
        <AccountCircleIcon />
        로그인
      </Link>
    );
  }

  return (
    <div className="header__profile" onClick={onClick}>
      <AccountCircleIcon className="header__icon" />
      {children}
    </div>
  );
}

export default LoginButton;