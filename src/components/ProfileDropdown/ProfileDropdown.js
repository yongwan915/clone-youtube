import React from 'react';
import './ProfileDropdown.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

function ProfileDropdown({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="profileDropdown">
      <div className="profileDropdown__header">
        <AccountCircleIcon />
        <span>{user?.user_name || '사용자'}</span>
      </div>
      <div 
        className="profileDropdown__option" 
        onClick={onLogout}
      >
        <LogoutIcon />
        <span>로그아웃</span>
      </div>
    </div>
  );
}

export default ProfileDropdown; 