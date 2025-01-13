import React from 'react';
import { Link } from 'react-router-dom';
import './CreateVideoButton.css';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

function CreateVideoButton({ isLoggedIn }) {
  const user_id = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')).user_id 
    : '';

  return isLoggedIn ? (
    <Link to={`/create-video?user_id=${user_id}`} className="create-video-button">
      <VideoLibraryIcon />
      동영상 업로드
    </Link>
  ) : null;
}

export default CreateVideoButton;