import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import './CreateVideo.css';

function CreateVideo() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const isLoggedIn = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      videoFile: e.target.files[0]
    }));
  };

  const handleThumbnailChange = (e) => {
    setFormData(prev => ({
      ...prev,
      thumbnailFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 여기에 업로드 로직 추가
    console.log('업로드할 데이터:', formData);
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="create-video">
      <h2>동영상 업로드</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>동영상 파일</label>
          <input 
            type="file" 
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="form-group">
          <label>썸네일 파일</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleThumbnailChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>제목</label>
          <input 
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="동영상 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label>설명</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="동영상 설명을 입력하세요"
            rows="4"
          />
        </div>

        <button type="submit" className="upload-button">
          업로드
        </button>
      </form>
    </div>
  );
}

export default CreateVideo;