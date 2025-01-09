import React from 'react';
import './LikedVideos.css';

function LikedVideos() {
  return (
    <div className="likedVideos">
      <h2>좋아요 표시한 동영상</h2>
      <div className="likedVideos__content">
        <p>좋아요 표시한 동영상이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

export default LikedVideos; 