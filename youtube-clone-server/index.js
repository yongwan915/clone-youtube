const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));  // CORS 활성화
app.use(express.json());  // JSON 파싱
app.use(express.urlencoded({ extended: true }));  // URL-encoded 파싱
app.use('/public', express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// MySQL 연결 설정
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql1234',
  database: 'youtube_clone',
  port: 3306
});

// DB 연결 테스트
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('MySQL 연결 성공!');
    connection.release();
  } catch (err) {
    console.error('MySQL 연결 에러:', err);
  }
};

testConnection();

// 업로드 디렉토리 생성 함수
const createUploadDirectories = () => {
  const directories = [
    path.join(__dirname, 'public', 'videos'),
    path.join(__dirname, 'public', 'thumbnails')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`디렉토리 생성 완료: ${dir}`);
    }
  });
};

// 서버 시작 시 디렉토리 생성
createUploadDirectories();

// 비디오와 썸네일 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'video' ? 'videos' : 'thumbnails';
    cb(null, `public/${dest}/`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${file.fieldname}_${uniqueSuffix}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
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
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const query = 'SELECT * FROM users WHERE user_id = ? AND password = ?';
    const [results] = await db.query(query, [userId, password]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { 
        id: results[0].id,
        userId: results[0].user_id,
        user_name: results[0].user_name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: '로그인 성공',
      token,
      user: {
        id: results[0].id,
        userId: results[0].user_id,
        user_name: results[0].user_name
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// 비디오 업로드 API
app.post('/api/videos/upload', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, upload_user_id } = req.body;
    const videoPath = `/videos/${req.files.video[0].filename}`;
    const thumbnailPath = `/thumbnails/${req.files.thumbnail[0].filename}`;

    // DB에 비디오 정보 저장 (프로미스 방식으로 수정)
    const query = `
      INSERT INTO videos (
        upload_user_id, title, description, 
        video_url, thumbnail_url, views, likes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, NOW())
    `;

    const [result] = await db.query(query, [
      upload_user_id,
      title,
      description,
      videoPath,
      thumbnailPath
    ]);

    res.status(200).json({ 
      message: '업로드 성공',
      videoPath,
      thumbnailPath
    });
  } catch (error) {
    console.error('업로드 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 비디오 목록 조회 API
app.get('/api/videos', async (req, res) => {
  try {
    const query = `
      SELECT v.*, u.user_name as channel_name
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      ORDER BY v.created_at DESC
    `;
    
    const [videos] = await db.query(query);
    
    const videosWithUrls = videos.map(video => ({
      ...video,
      thumbnail_url: `http://localhost:8000/public${video.thumbnail_url}`,
      video_url: `http://localhost:8000/public${video.video_url}`,
      timestamp: new Date(video.created_at).toLocaleDateString()
    }));

    res.json(videosWithUrls);
  } catch (error) {
    console.error('비디오 목록 조회 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 비디오 상세 정보 API
app.get('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('요청된 비디오 ID:', id);  // ID 확인

    const query = `
      SELECT v.*, u.user_name as channel_name
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      WHERE v.id = ?
    `;
    
    const [videos] = await db.query(query, [id]);
    console.log('조회된 비디오:', videos);  // 쿼리 결과 확인
    
    if (videos.length === 0) {
      return res.status(404).json({ message: '비디오를 찾을 수 없습니다.' });
    }

    const video = {
      ...videos[0],
      video_url: `http://localhost:8000/public${videos[0].video_url}`,
      thumbnail_url: `http://localhost:8000/public${videos[0].thumbnail_url}`,
      timestamp: new Date(videos[0].created_at).toLocaleDateString()
    };

    // 조회수 증가
    await db.query('UPDATE videos SET views = views + 1 WHERE id = ?', [id]);

    console.log('응답할 비디오 데이터:', video);  // 최종 응답 데이터 확인
    res.json(video);
  } catch (error) {
    console.error('비디오 상세 정보 조회 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ message: '서버 에러가 발생했습니다.' });
});

// 서버 시작
app.listen(8000, () => {
  console.log('서버 실행중 (포트: 8000)');
});
