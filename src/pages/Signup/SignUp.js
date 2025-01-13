import React, { useState } from 'react';
import './SignUp.css';

function Signup() {
  const [formData, setFormData] = useState({
    login_id: '',
    password: '',
    user_name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        window.location.replace('/login');
      } else {
        throw new Error(data.error || '회원가입 실패');
      }
    } catch (error) {
      alert(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signup">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit} className="signup__box">
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
        <div className="user__name__input">
          <input 
            type="text" 
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="닉네임" 
          />
        </div>
        <div className="user__email__input">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일" 
          />
        </div>
        
        <div className="signup__button">
          <button type="submit">회원가입</button>
        </div>
      </form>
    </div>
  );
}

export default Signup;