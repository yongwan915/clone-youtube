import React from 'react';
import './History.css';
import TitleText from '../../components/Text/TitleText';

function History() {
  return (
    <div className="history">
      <TitleText text="시청 기록" />
      <div className="history__content">
        <p>시청한 동영상이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

export default History; 