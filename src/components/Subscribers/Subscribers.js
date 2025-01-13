import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Subscribers.css';

function Subscribers({ subscribers = [], onClose }) {
    const navigate = useNavigate();

    const handleModalClick = (e) => {
        // 모달 바깥 영역 클릭 시 닫기
        if (e.target.className === 'subscribers__modal') {
            onClose();
        }
    };

    return (
        <div className="subscribers__modal" onClick={handleModalClick}>
            <div className="subscribers__content">
                <div className="subscribers__header">
                    <h2>구독자 목록</h2>
                    <button 
                        className="subscribers__close-btn" 
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <hr />
                <div className="subscribers__list">
                    {subscribers?.length > 0 ? (
                        subscribers.map(subscriber => (
                            <div 
                                key={subscriber.user_id} 
                                className="subscriber"
                                onClick={() => navigate(`/channel/${subscriber.user_id}`)}
                            >
                             <img 
                                    src={subscriber.profile_image_url || '/default-profile.png'} 
                                    alt={subscriber.user_name} 
                                />
                                <span>{subscriber.user_name}</span>
                            </div>
                        ))
                    ) : (
                        <p>구독자가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Subscribers;