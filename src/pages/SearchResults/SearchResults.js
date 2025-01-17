import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../../components/VideoCard/VideoCard';
import UserSearchCard from '../../components/UserSearchCard/UserSearchCard';
import './SearchResults.css';
import { API_BASE_URL } from '../../config';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        
        // 비디오 검색
        const videoResponse = await fetch(`${API_BASE_URL}/api/videos/search?q=${encodeURIComponent(query)}`);
        
        // 유저 검색
        const userResponse = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`);
        
        if (!videoResponse.ok || !userResponse.ok) {
          throw new Error('검색 결과를 가져오는데 실패했습니다.');
        }
        
        const videoData = await videoResponse.json();
        const userData = await userResponse.json();
        
        setVideos(videoData);
        setUsers(userData);
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
      
      {/* 유저 검색 결과 */}
      {users.length > 0 && (
        <div className="searchResults__users">
          <h3>채널</h3>
          {users.map((user) => (
            <UserSearchCard
              key={user.user_id}
              user_id={user.user_id}
              profileImage={user.profile_image_url 
                ? `${API_BASE_URL}${user.profile_image_url}` 
                : "https://yt3.ggpht.com/ytc/default-avatar.jpg"}
              userName={user.user_name}
              subscriberCount={user.subscriber_count}
              isSubscribed={user.is_subscribed}
            />
          ))}
        </div>
      )}

      {/* 비디오 검색 결과 */}
      <div className="searchResults__videos">
        <h3>동영상</h3>
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
