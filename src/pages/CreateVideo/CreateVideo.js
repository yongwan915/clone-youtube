import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import './CreateVideo.css';
import { API_BASE_URL } from '../../config';

function CreateVideo() {
  const [searchParams] = useSearchParams();
  const user = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user'))
    : null;
  const user_id = user ? user.user_id : null;
  const isLoggedIn = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnailFile: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.videoFile || !formData.thumbnailFile) {
        throw new Error('비디오와 썸네일을 모두 선택해주세요.');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('video', formData.videoFile);
      formDataToSend.append('thumbnail', formData.thumbnailFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('upload_user_id', user_id);

      const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('동영상 업로드에 실패했습니다.');
      }

      const data = await response.json();
      alert('동영상이 성공적으로 업로드되었습니다!');
      window.location.href = '/';
      
    } catch (error) {
      console.error('업로드 에러:', error);
      alert(error.message);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="createVideo">
      <h2>동영상 업로드</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목"
            required
          />
        </div>
        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="설명"
          />
        </div>
        <div>
          <input
            type="file"
            name="videoFile"
            onChange={handleFileChange}
            accept="video/*"
            required
          />
        </div>
        <div>
          <input
            type="file"
            name="thumbnailFile"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <button type="submit">업로드</button>
      </form>
    </div>
  );
}

export default CreateVideo;