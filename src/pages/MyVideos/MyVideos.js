import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config';
import './MyVideos.css';
import LoginButton from '../../components/Button/LoginButton';
import VideoCard from '../../components/VideoCard/VideoCard';

function MyVideos() {
  const { checkAuth } = useAuth();
  const isLoggedIn = checkAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        if (!isLoggedIn) return;
        
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_BASE_URL}/api/videos/liked/${user.user_id}`);
        
        if (!response.ok) {
          throw new Error('좋아요한 동영상을 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('좋아요한 동영상 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, [isLoggedIn]);

  const displayedVideos = showAll ? videos : videos.slice(0, 5);

  if (loading && isLoggedIn) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="myVideos">
      <div className="myVideos__header">
        <h2>저장한 동영상</h2>
        {isLoggedIn && videos.length > 5 && !showAll && (
          <button 
            className="myVideos__showMore"
            onClick={() => setShowAll(true)}
          >
            더보기
          </button>
        )}
      </div>
      <div className="myVideos__content">
        {isLoggedIn ? (
          <div className="myVideos__content__list">
            {videos.length > 0 ? (
              <>
                {displayedVideos.map((video) => (
                  <VideoCard
                    key={video.video_id}
                    video_id={video.video_id}
                    image={`${API_BASE_URL}${video.thumbnail_url}`}
                    title={video.title}
                    channel={video.user_name}
                    views={`조회수 ${video.views}회`}
                    timestamp={new Date(video.created_at).toLocaleDateString()}
                    channelImage={video.profile_image_url 
                      ? `${API_BASE_URL}${video.profile_image_url}` 
                      : "https://yt3.ggpht.com/ytc/default-avatar.jpg"}
                    user_id={video.upload_user_id}
                    likes={video.likes_count}
                  />
                ))}
              </>
            ) : (
              <p>좋아요 표시한 동영상이 없습니다.</p>
            )}
          </div>
        ) : (
          <div>
            <p>로그인 후 저장한 동영상을 확인해보세요.</p>
            <LoginButton isLoggedIn={isLoggedIn} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MyVideos; 