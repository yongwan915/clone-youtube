import React, { useState, useEffect } from 'react';
import VideoCard from '../../components/VideoCard/VideoCard';
import './Home.css';
import { API_BASE_URL } from '../../config';
import TitleText from '../../components/Text/TitleText';
function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos`);
        if (!response.ok) {
          throw new Error('서버 에러');
        }
        const data = await response.json();
        console.log('받은 비디오 데이터:', data);
        setVideos(data);
      } catch (error) {
        console.error('비디오 목록 가져오기 실패:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="home">
      <TitleText className="home__title" text="추천 동영상" />
      <div className="home__videos">
        {videos.map((video) => (
          <VideoCard
            key={video.video_id}
            video_id={video.video_id}
            image={`${API_BASE_URL}${video.thumbnail_url}`}
            title={video.title}
            channel={video.channel_name || video.user_name}
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
    </div>
  );
}

export default Home; 