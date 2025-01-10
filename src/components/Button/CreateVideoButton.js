import React from 'react';
import { Link } from 'react-router-dom';
import './CreateVideoButton.css';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

function CreateVideoButton({ isLoggedIn }) {
  const userId = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')).userId 
    : '';

  return isLoggedIn ? (
    <Link to={`/create-video?userId=${userId}`} className="create-video-button">
      <VideoLibraryIcon />
      동영상 업로드
    </Link>
  ) : null;
}

export default CreateVideoButton;