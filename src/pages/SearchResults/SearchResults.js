import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../../components/VideoCard/VideoCard';
import './SearchResults.css';
import { API_BASE_URL } from '../../config';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        console.log('검색 요청 URL:', `${API_BASE_URL}/api/videos/search?q=${encodeURIComponent(query)}`);
        
        const response = await fetch(`${API_BASE_URL}/api/videos/search?q=${encodeURIComponent(query)}`);
        console.log('서버 응답 상태:', response.status);
        console.log('서버 응답 헤더:', [...response.headers.entries()]);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('서버 에러 응답:', errorData);
          throw new Error(errorData.error || '검색 결과를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('검색 결과 데이터:', data);
        setVideos(data);
      } catch (error) {
        console.error('검색 실패:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  if (loading) return <div className="searchResults__loading">검색 중...</div>;
  if (error) return <div className="searchResults__error">에러: {error}</div>;

  return (
    <div className="searchResults">
      <div className="searchResults__filter">
        <h2>"{query}" 검색 결과</h2>
      </div>
      <div className="searchResults__videos">
        {videos.length === 0 ? (
          <p className="searchResults__noResults">검색 결과가 없습니다.</p>
        ) : (
          videos.map((video) => (
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
              description={video.description}
              likes={video.likes_count}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default SearchResults;
