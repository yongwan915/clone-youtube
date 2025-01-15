import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Watch.css';
import Comments from '../../components/Comments/Comments';
import { API_BASE_URL } from '../../config';
import LikeButton from '../../components/LikeButton/LikeButton';
import SubscribeButton from '../../components/SubscribeButton/SubscribeButton';

function Watch() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [likesCount, setLikesCount] = useState(0);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log('현재 videoId:', videoId);
        const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '비디오를 가져오는데 실패했습니다.');
        }
        
        console.log('서버 응답:', data);
        setVideo(data);
      } catch (error) {
        console.error('비디오 정보 가져오기 실패:', error);
        setError(error.message);
      }
    };

    if (videoId) {
      console.log('fetchVideo 실행, videoId:', videoId);
      fetchVideo();
    }
  }, [videoId]);

  useEffect(() => {
    if (video) {
      setLikesCount(video.likes_count);
    }
  }, [video]);

  console.log('Watch 컴포넌트 렌더링:', { videoId, video, error });

  if (!videoId) {
    return <div className="watch__error">잘못된 접근입니다.</div>;
  }
  if (error) return <div className="watch__error">에러: {error}</div>;
  if (!video) return <div className="watch__loading">로딩중...</div>;

  const fullVideoUrl = `${API_BASE_URL}${video.video_url}`;

  const handleLikeChange = (liked) => {
    console.log('좋아요 상태:', liked);
    setLikesCount(prevCount => liked ? prevCount + 1 : prevCount - 1);
  };

  const handleVideoPlay = async () => {
    if (viewCounted) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/videos/${videoId}/view`, {
        method: 'POST'
      });
      setViewCounted(true);
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  };

  return (
    <div className="watch">
      <div className="watch__video">
        <video 
          controls 
          autoPlay
          className="video-player"
          src={fullVideoUrl}
          onPlay={handleVideoPlay}
        >
          <source src={fullVideoUrl} type="video/mp4" />
          브라우저가 비디오 재생을 지원하지 않습니다.
        </video>
      </div>
      <div className="watch__info">
        <h1>{video.title}</h1>
        <div className="watch__stats">
          <span>조회수 {video.views}회</span>
          <div className="watch__likes">
            {isLoggedIn ? (
              <>
                <LikeButton 
                  videoId={video.video_id} 
                  initialLiked={video.is_liked}
                  onLikeChange={handleLikeChange}
                />
                <span className="likes-count">좋아요 {likesCount}개</span>
              </>
            ) : (
              <>
                <button onClick={() => alert('로그인이 필요합니다.')}>좋아요</button>
                <span className="likes-count">좋아요 {likesCount}개</span>
              </>
            )}
          </div>
        </div>
        <div className="watch__channel">
          <h3>{video.user_name}</h3>
          {isLoggedIn ? (
            <SubscribeButton 
              channelUserId={video.upload_user_id}
              initialSubscribed={video.is_subscribed}
              onSubscribeChange={(subscribed) => console.log('구독 상태:', subscribed)}
            />
          ) : (
            <button onClick={() => alert('로그인이 필요합니다.')}>구독</button>
          )}
          <p>{video.description}</p>
        </div>
      </div>
      <Comments videoId={videoId} />
    </div>
  );
}

export default Watch;
