import React from 'react';
import './Subscriptions.css';
import LoginButton from '../../components/Button/LoginButton';
import TitleText from '../../components/Text/TitleText';

function Subscriptions() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <div className="subscriptions">
      <TitleText text="구독" />
      <div className="subscriptions__content">
        {isLoggedIn ? (
          <p>구독한 채널의 동영상이 여기에 표시됩니다.</p>
        ) : (
          <div>
            <p>로그인 후 구독 내역을 확인해보세요.</p>
            <LoginButton className="subscriptions__login" isLoggedIn={isLoggedIn} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscriptions; 