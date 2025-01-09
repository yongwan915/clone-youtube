const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();

// 미들웨어 설정
app.use(cors());  // CORS 활성화
app.use(express.json());  // JSON 파싱
app.use(express.urlencoded({ extended: true }));  // URL-encoded 파싱

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql1234',
  database: 'youtube_clone',
  port: 3306
});

// MySQL 연결 확인
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 에러:', err);
    return;
  }
  console.log('MySQL 연결 성공!');
});

// JWT 비밀키 설정
const JWT_SECRET = 'your-secret-key';  // 실제로는 환경변수로 관리해야 함

// 회원가입 API
app.post('/api/signup', (req, res) => {
  const { userId, password, user_name, email } = req.body;
  
  if (!userId || !password || !user_name || !email) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  const sql = 'INSERT INTO users (user_id, password, user_name, email) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [userId, password, user_name, email], (err, result) => {
    if (err) {
      console.error('SQL 에러:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: '이미 존재하는 아이디 또는 이메일입니다.' });
      }
      return res.status(500).json({ error: '회원가입 실패' });
    }
    res.json({ message: '회원가입 성공' });
  });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  // 클라이언트에서 보낸 로그인 정보
  const { userId, password } = req.body;
  
  // 필수 입력값 검증
  if (!userId || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
  }

  // 로그인 SQL 쿼리
  const sql = 'SELECT * FROM users WHERE user_id = ? AND password = ?';
  
  // 데이터베이스에서 사용자 확인
  db.query(sql, [userId, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '로그인 실패' });
    }
    
    // 일치하는 사용자가 없는 경우
    if (results.length === 0) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: results[0].id,
        userId: results[0].user_id,
        user_name: results[0].user_name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }  // 토큰 유효기간 24시간
    );

    // 토큰과 함께 응답
    res.json({ 
      message: '로그인 성공',
      token,
      user: {
        id: results[0].id,
        userId: results[0].user_id,
        user_name: results[0].user_name
      }
    });
  });
});

    
// 에러 핸들링
app.use((err, req, res, next) => {
  console.error

});

app.listen(8000, () => {
  console.log('서버 실행중 (포트: 8000)');
});
