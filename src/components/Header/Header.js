import React, { useState } from 'react';
import './Header.css';
import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from '../SearchBar/SearchBar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';
import SettingBar from '../SettingBar/SettingBar';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

function Header({ onMenuClick }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="header">
      <div className="header__left">
        <MenuIcon className="header__menuIcon" onClick={onMenuClick} />
        <Link to="/">
          <img
            className="header__logo"
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="YouTube Logo"
          />
        </Link>
      </div>

      <div className="header__center">
        <SearchBar />
      </div>

      <div className="header__right">
        <SettingsIcon 
          className="header__icon" 
          onClick={() => setShowSettings(!showSettings)}
        />
        {!isLoggedIn ? (
          <Link to="/login" className="header__login">
            <AccountCircleIcon />
            로그인
          </Link>
        ) : (
          <div className="header__profile">
            <AccountCircleIcon 
              className="header__icon" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            />
            {showProfileMenu && (
              <ProfileDropdown onLogout={handleLogout} />
            )}
          </div>
        )}
        {showSettings && <SettingBar />}
      </div>
    </div>
  );
}

export default Header; 