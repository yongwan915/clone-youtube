import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Channel.css';
import { API_BASE_URL } from '../../config';
import SubscribeButton from '../../components/SubscribeButton/SubscribeButton';
import Subscribers from '../../components/Subscribers/Subscribers';

function Channel() {
  const { userId } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [isMyChannel, setIsMyChannel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');

  const fetchChannelInfo = async () => {
    try {
      console.log('Fetching channel info for userId:', userId);
      const response = await fetch(`${API_BASE_URL}/api/channels/${userId}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버에서 잘못된 응답 형식이 반환되었습니다.');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || '채널 정보를 불러오는데 실패했습니다.');
      }

      setChannelInfo(data);
    } catch (error) {
      console.error('채널 정보 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChannelInfo();
      const user = JSON.parse(localStorage.getItem('user'));
      setIsMyChannel(user && user.user_id === parseInt(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (channelInfo) {
      setDescription(channelInfo.description || '');
    }
  }, [channelInfo]);

  const handleShowSubscribers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/channels/${userId}/subscribers`);
      if (!response.ok) {
        throw new Error('구독자 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setSubscribers(data);
      setShowSubscribers(true);
    } catch (error) {
      console.error('구독자 목록 조회 실패:', error);
      alert(error.message);
    }
  };

  const handleImageUpload = async (type, e) => {
    if (!isMyChannel) return;
    
    const file = e.target.files[0];
    if (!file) return;

    console.log('파일 선택됨:', file);
    console.log('파일 타입:', type);

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/channels/${userId}/image/${type}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      console.log('서버 응답 상태:', response.status);
      
      const contentType = response.headers.get('content-type');
      let responseData;
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('서버 응답 데이터:', responseData);
      }

      if (!response.ok) {
        throw new Error((responseData && responseData.error) || '이미지 업로드 실패');
      }

      await fetchChannelInfo();
    } catch (error) {
      console.error('이미지 업로드 중 에러:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    }
  };

  const handleDescriptionUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('설명 업데이트 시도:', description);
      console.log('토큰:', token);

      const response = await fetch(`${API_BASE_URL}/api/channels/${userId}/description`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description }),
      });

      console.log('서버 응답 상태:', response.status);
      const responseData = await response.json();
      console.log('서버 응답 데이터:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || '채널 설명 업데이트 실패');
      }

      await fetchChannelInfo();
      setIsEditing(false);
    } catch (error) {
      console.error('채널 설명 업데이트 중 에러:', error);
      alert('채널 설명 업데이트에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!channelInfo) return <div>채널 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="channel">
      <div className={`channel__banner ${isMyChannel ? 'uploadable' : ''}`}>
        <img 
          src={channelInfo.banner_image_url ? 
            `${API_BASE_URL}${channelInfo.banner_image_url}` : 
            '/default-banner.png'} 
          alt="채널 배너" 
          onError={(e) => {
            console.log('배너 이미지 URL:', e.target.src);
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('channelInfo:', channelInfo);
            e.target.src = '/default-banner.png';
            e.target.onerror = null; // 무한 루프 방지
          }}
        />
        {isMyChannel && (
          <label className="upload-overlay">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('banner', e)}
              hidden
            />
            <span>배너 이미지 업로드</span>
          </label>
        )}
      </div>
      
      <div className="channel__container">
        <div className="channel__header">
          <div className="channel__info-section">
            <div className={`channel__profile ${isMyChannel ? 'uploadable' : ''}`}>
              <img 
                src={channelInfo.profile_image_url ? 
                  `${API_BASE_URL}${channelInfo.profile_image_url}` : 
                  '/default-profile.png'} 
                alt="프로필 이미지" 
                onError={(e) => {
                  console.log('프로필 이미지 URL:', e.target.src);
                  e.target.src = '/default-profile.png';
                  e.target.onerror = null;
                }}
              />
              {isMyChannel && (
                <label className="upload-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('profile', e)}
                    hidden
                  />
                  <span>프로필 이미지 업로드</span>
                </label>
              )}
            </div>
            <div className="channel__details">
              <h2>{channelInfo.user_name}</h2>
              <div className="channel__meta">
                <span onClick={handleShowSubscribers}>
                  구독자 {channelInfo.subscriber_count}명
                </span>
                <span>•</span>
                <span>동영상 {channelInfo.video_count}개</span>
              </div>
              {isMyChannel ? (
                <div className="channel__description-edit">
                  {isEditing ? (
                    <>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="채널 설명을 입력하세요"
                        maxLength={1000}
                      />
                      <div className="description-actions">
                        <button onClick={handleDescriptionUpdate}>저장</button>
                        <button onClick={() => {
                          setIsEditing(false);
                          setDescription(channelInfo.description || '');
                        }}>취소</button>
                      </div>
                    </>
                  ) : (
                    <div className="channel__description" onClick={() => setIsEditing(true)}>
                      {channelInfo.description || '채널 설명 추가'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="channel__description">
                  {channelInfo.description}
                </div>
              )}
              <div className="channel__actions">
                <SubscribeButton 
                  channelUserId={channelInfo.user_id}
                  initialSubscribed={channelInfo.subscribed}
                  onSubscribeChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="channel__nav">
          <div className="channel__nav-list">
            <span className="active">홈</span>
            <span>동영상</span>
            <span>커뮤니티</span>
          </div>
        </div>
      </div>

      {showSubscribers && (
        <Subscribers 
          subscribers={subscribers} 
          onClose={() => setShowSubscribers(false)} 
        />
      )}
    </div>
  );
}

export default Channel;

