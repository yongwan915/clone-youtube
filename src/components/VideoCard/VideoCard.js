import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';

function VideoCard({ video_id, image, title, channel, views, timestamp, channelImage }) {
  console.log('VideoCard props:', { video_id, image, title, channel, views, timestamp });
  
  return (
    <Link to={`/watch/${video_id}`} className="videoCard">
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
    </Link>
  );
}

VideoCard.propTypes = {
  video_id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  views: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  channelImage: PropTypes.string.isRequired
};

export default VideoCard; 