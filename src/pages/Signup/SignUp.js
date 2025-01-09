import React, { useState } from 'react';
import './SignUp.css';

function Signup() {
  const [formData, setFormData] = useState({
    userId: '',
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
    console.log('입력 값 변경:', name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('폼 제출 데이터:', formData);
    
    try {
      console.log('API 요청 시작');
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('서버 응답:', data);

      if (response.ok) {
        console.log('회원가입 성공');
        alert('회원가입이 완료되었습니다!');
        window.location.href = '/login';
      } else {
        console.error('회원가입 실패:', data.error);
        alert(`회원가입에 실패했습니다: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('API 호출 에러:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signup">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit} className="signup__box">
        <div className="id__input">
          <input 
            type="text" 
            name="userId"
            value={formData.userId}
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