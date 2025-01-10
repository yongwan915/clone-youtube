import React, { useState, useEffect } from 'react';
import VideoCard from '../../components/VideoCard/VideoCard';
import './Home.css';

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/videos');
        if (!response.ok) {
          throw new Error('서버 에러');
        }
        const data = await response.json();
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
            key={video.id}
            id={video.id}
            image={video.thumbnail_url}
            title={video.title}
            channel={video.channel_name}
            views={`조회수 ${video.views}회`}
            timestamp={video.timestamp}
            channelImage="https://yt3.ggpht.com/ytc/default-avatar.jpg"
          />
        ))}
      </div>
    </div>
  );
}

export default Home; 