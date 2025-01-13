import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import './SubscribeButton.css';

function SubscribeButton({ channelUserId, initialSubscribed, onSubscribeChange }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  const handleSubscribe = async () => {
    try {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${channelUserId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.user_id })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSubscribed(data.subscribed);
      if (onSubscribeChange) onSubscribeChange(data.subscribed);
    } catch (error) {
      console.error('구독 처리 실패:', error);
      alert(error.message || '구독 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={`subscribe-button ${subscribed ? 'subscribed' : ''}`}
      onClick={handleSubscribe}
      disabled={loading}
    >
      {subscribed ? '구독중' : '구독'}
    </button>
  );
}

export default SubscribeButton;