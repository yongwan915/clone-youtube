import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';

function Login() {
  // 로그인 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    login_id: '',
    password: ''
  });

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.user_id);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = '/';
      } else {
        alert(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login">
      <h1>로그인</h1>

      <div className="login__box">
        <form onSubmit={handleSubmit}>
          <div className="id__input">
            <input 
              type="text" 
              name="login_id"
              value={formData.login_id}
              onChange={handleChange}
              placeholder="아이디" 
            />
          </div>
          <div className="pw__input">
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호" 
            />
          </div>
          <div className="login__button">
            <button type="submit">로그인</button>
          </div>
          <div className="signup__button">
            <Link to="/sign-up">회원가입</Link>
          </div>
          <div className="find__id__pw">
            <button type="button">아이디/비밀번호 찾기</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default Login;