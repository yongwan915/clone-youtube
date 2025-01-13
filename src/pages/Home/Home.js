import React, { useState, useEffect } from 'react';
import VideoCard from '../../components/VideoCard/VideoCard';
import './Home.css';

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/videos');
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
      <h2 className="home__title">추천 동영상</h2>
      <div className="home__videos">
        {videos.map((video) => (
          <VideoCard
            key={video.video_id}
            video_id={video.video_id}
            image={`http://localhost:3001/public${video.thumbnail_url}`}
            title={video.title}
            channel={video.channel_name || video.user_name}
            views={`조회수 ${video.views}회`}
            timestamp={new Date(video.created_at).toLocaleDateString()}
            channelImage="https://yt3.ggpht.com/ytc/default-avatar.jpg"
          />
        ))}
      </div>
    </div>
  );
}

export default Home; 