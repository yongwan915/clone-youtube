import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from '../SearchBar/SearchBar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';
import SettingBar from '../SettingBar/SettingBar';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import LoginButton from '../Button/LoginButton';
import CreateVideoButton from '../Button/CreateVideoButton';
import { useNavigate } from 'react-router-dom';
function Header({ onMenuClick }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 설정 메뉴 외부 클릭 감지
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      
      // 프로필 메뉴 외부 클릭 감지
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <div className="header">
      <div className="header__left">
        <MenuIcon className="header__menuIcon" onClick={onMenuClick} />
          <img
            className="header__logo"
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="YouTube Logo"
            onClick={() => navigate('/')}
          />
      </div>

      <div className="header__center">
        <SearchBar />
      </div>

      <div className="header__right">
        <CreateVideoButton isLoggedIn={isLoggedIn} />
        <div ref={settingsRef}>
          <SettingsIcon 
            className="header__icon" 
            onClick={() => setShowSettings(!showSettings)}
          />
          {showSettings && <SettingBar />}
        </div>
        <div ref={profileRef}>
          <LoginButton 
            isLoggedIn={isLoggedIn}
            onClick={handleProfileClick}
          >
            {showProfileMenu && (
              <ProfileDropdown onLogout={handleLogout} />
            )}
          </LoginButton>
        </div>
      </div>
    </div>
  );
}

export default Header; 