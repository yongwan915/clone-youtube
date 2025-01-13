import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import './LikeButton.css';

function LikeButton({ videoId, initialLiked, onLikeChange }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  const handleLike = async () => {
    try {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.user_id })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setLiked(data.liked);
      if (onLikeChange) onLikeChange(data.liked);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert(error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={`like-button ${liked ? 'liked' : ''}`}
      onClick={handleLike}
      disabled={loading}
    >
      {liked ? '좋아요 취소' : '좋아요'}
    </button>
  );
}

export default LikeButton;