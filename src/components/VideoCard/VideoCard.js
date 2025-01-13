import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VideoCard.css';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';

function VideoCard({ video_id, image, title, channel, views, timestamp, channelImage, user_id }) {
  const navigate = useNavigate();

  // 채널 클릭 이벤트 핸들러
  const handleChannelClick = (e) => {
    e.preventDefault(); // 비디오 카드 전체 클릭 이벤트 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    navigate(`/channel/${user_id}`);
  };

  console.log('VideoCard props:', { video_id, image, title, channel, views, timestamp });
  
  return (
    <Link to={`/watch/${video_id}`} className="videoCard">
      <img className="videoCard__thumbnail" src={image} alt={title} />
      <div className="videoCard__info">
        <Avatar 
          className="videoCard__avatar" 
          alt={channel} 
          src={channelImage}
          onClick={handleChannelClick}
          style={{ cursor: 'pointer' }}
        />
        <div className="videoCard__text">
          <h4>{title}</h4>
          <p 
            className="videoCard__channel" 
            onClick={handleChannelClick}
            style={{ cursor: 'pointer' }}
          >
            {channel}
          </p>
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
  channelImage: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired
};

export default VideoCard; 