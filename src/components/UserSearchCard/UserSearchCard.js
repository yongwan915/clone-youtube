import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscribeButton from '../SubscribeButton/SubscribeButton';
import './UserSearchCard.css';

function UserSearchCard({ user_id, profileImage, userName, subscriberCount, isSubscribed }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/channel/${user_id}`);
  };

  return (
    <div className="userSearchCard">
      <div className="userSearchCard__left" onClick={handleClick}>
        <img 
          src={profileImage} 
          alt={userName} 
          className="userSearchCard__avatar"
        />
        <div className="userSearchCard__info">
          <h3>{userName}</h3>
          <span className="userSearchCard__subscribers">
            구독자 {subscriberCount}명
          </span>
        </div>
      </div>
      <div className="userSearchCard__right">
        <SubscribeButton 
          channelUserId={user_id}
          initialSubscribed={isSubscribed}
          onSubscribeChange={() => {}}
        />
      </div>
    </div>
  );
}

export default UserSearchCard; 