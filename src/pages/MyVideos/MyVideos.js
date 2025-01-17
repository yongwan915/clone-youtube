import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config';
import './MyVideos.css';
import LoginButton from '../../components/Button/LoginButton';
import VideoCard from '../../components/VideoCard/VideoCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function MyVideos() {
  const { checkAuth } = useAuth();
  const isLoggedIn = checkAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videosPerPage, setVideosPerPage] = useState(4); // 기본값 설정
  const containerRef = useRef(null);

  // 화면 크기에 따라 보여줄 비디오 수 계산
  useEffect(() => {
    const calculateVideosPerPage = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const videoWidth = 270; // VideoCard의 너비
        const gap = 16; // gap 크기
        const count = Math.floor((containerWidth + gap) / (videoWidth + gap));
        setVideosPerPage(Math.max(1, count)); // 최소 1개는 보이도록
      }
    };

    // 초기 계산
    calculateVideosPerPage();

    // 윈도우 크기 변경 시 다시 계산
    window.addEventListener('resize', calculateVideosPerPage);

    return () => {
      window.removeEventListener('resize', calculateVideosPerPage);
    };
  }, []);

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

  const handlePrevClick = () => {
    setCurrentIndex(prev => Math.max(0, prev - videosPerPage));
  };

  const handleNextClick = () => {
    setCurrentIndex(prev => Math.min(videos.length - videosPerPage, prev + videosPerPage));
  };

  // 현재 페이지에 보여줄 비디오들만 필터링
  const displayedVideos = videos.slice(currentIndex, currentIndex + videosPerPage);

  if (loading && isLoggedIn) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="myVideos">
      <div className="myVideos__container">
        <div className="myVideos__header">
          <h2>좋아요한 동영상</h2>
        </div>
        
        <div className="myVideos__content">
          {isLoggedIn ? (
            videos.length > 0 ? (
              <>
                <button 
                  className="myVideos__nav-button myVideos__nav-button--prev"
                  onClick={handlePrevClick}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeftIcon className="myVideos__nav-icon" />
                </button>
                <div className="myVideos__content__list" ref={containerRef}>
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
                </div>
                <button 
                  className="myVideos__nav-button myVideos__nav-button--next"
                  onClick={handleNextClick}
                  disabled={currentIndex >= videos.length - videosPerPage}
                >
                  <ChevronRightIcon className="myVideos__nav-icon" />
                </button>
              </>
            ) : (
              <p>좋아요 표시한 동영상이 없습니다.</p>
            )
          ) : (
            <div className="myVideos__login">
              <p>로그인 후 저장한 동영상을 확인해보세요.</p>
              <LoginButton isLoggedIn={isLoggedIn} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyVideos; 