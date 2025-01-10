import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Watch.css';

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log('비디오 ID:', id);
        const response = await fetch(`http://localhost:8000/api/videos/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '비디오를 가져오는데 실패했습니다.');
        }
        
        console.log('받은 비디오 데이터:', data);
        setVideo(data);
      } catch (error) {
        console.error('비디오 정보 가져오기 실패:', error);
        setError(error.message);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  if (error) return <div>에러: {error}</div>;
  if (!video) return <div>로딩중...</div>;

  return (
    <div className="watch">
      <div className="watch__video">
        <video 
          controls 
          autoPlay
          className="video-player"
          src={video.video_url}
        >
          <source src={video.video_url} type="video/mp4" />
          브라우저가 비디오 재생을 지원하지 않습니다.
        </video>
      </div>
      <div className="watch__info">
        <h1>{video.title}</h1>
        <div className="watch__stats">
          <span>조회수 {video.views}회</span>
          <span>• {video.timestamp}</span>
        </div>
        <div className="watch__channel">
          <h3>{video.channel_name}</h3>
          <p>{video.description}</p>
        </div>
      </div>
    </div>
  );
}

export default Watch;
