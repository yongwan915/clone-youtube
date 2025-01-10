import React from 'react';
import './Home.css';
import VideoCard from '../../components/VideoCard/VideoCard';

function Home() {
  return (
    <div className="home">
      <h2 className="home__title">추천 동영상</h2>
      <div className="home__videos">
        <VideoCard
          title="프로그래밍 기초 강좌"
          views="2.3만회 시청"
          timestamp="3일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample"
          channel="코딩채널"
          image="https://i.ytimg.com/vi/sample/maxresdefault.jpg"
        />
        <VideoCard
          title="리액트 완벽 가이드"
          views="1.5만회 시청"
          timestamp="1주일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        <VideoCard
          title="리액트 완벽 가이드"
          views="1.5만회 시청"
          timestamp="1주일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        <VideoCard
          title="김정훈 가이드"
          views="11.5만회 시청"
          timestamp="5일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        <VideoCard
          title="리액트 완벽 가이드"
          views="1.5만회 시청"
          timestamp="1주일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        <VideoCard
          title="리액트 완벽 가이드"
          views="1.5만회 시청"
          timestamp="1주일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        <VideoCard
          title="리액트 완벽 가이드"
          views="1.5만회 시청"
          timestamp="1주일 전"
          channelImage="https://yt3.ggpht.com/ytc/sample2"
          channel="웹개발 채널"
          image="https://i.ytimg.com/vi/sample2/maxresdefault.jpg"
        />
        {/* 더 많은 VideoCard 컴포넌트를 추가할 수 있습니다 */}
      </div>
    </div>
  );
}

export default Home; 