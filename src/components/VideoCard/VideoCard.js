import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';

function VideoCard({ id, image, title, channel, views, timestamp, channelImage }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${id}`);
  };

  return (
    <div className="videoCard" onClick={handleClick}>
      <img className="videoCard__thumbnail" src={image} alt={title} />
      <div className="videoCard__info">
        <Avatar 
          className="videoCard__avatar" 
          alt={channel} 
          src={channelImage}
        />
        <div className="videoCard__text">
          <h4>{title}</h4>
          <p>{channel}</p>
          <p>{views} • {timestamp}</p>
        </div>
      </div>
    </div>
  );
}

VideoCard.propTypes = {
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  views: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  channelImage: PropTypes.string.isRequired
};

export default VideoCard; 