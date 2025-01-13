import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Channel.css';
import { API_BASE_URL } from '../../config';

function Channel() {
  const { userId } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        console.log('Fetching channel info for userId:', userId);
        const response = await fetch(`${API_BASE_URL}/api/channels/${userId}`);
        
        // 응답 타입 확인
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

    if (userId) {
      fetchChannelInfo();
    }
  }, [userId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!channelInfo) return <div>채널 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="channel">
      <div className="channel__header">
        <h2>{channelInfo.user_name}의 채널</h2>
        <div className="channel__stats">
          <span>구독자 {channelInfo.subscriber_count}명</span>
          <span>동영상 {channelInfo.video_count}개</span>
        </div>
      </div>
      <div className="channel__info">
        <p>가입일: {new Date(channelInfo.created_at).toLocaleDateString()}</p>
        <p>이메일: {channelInfo.email}</p>
      </div>
      {/* 추후 채널의 동영상 목록 등 추가 컨텐츠 */}
    </div>
  );
}

export default Channel;

