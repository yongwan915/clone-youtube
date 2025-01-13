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
app.post('/api/signup', async (req, res) => {
  try {
    const { login_id, password, user_name, email } = req.body;
    
    if (!login_id || !password || !user_name || !email) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const sql = 'INSERT INTO users (login_id, password, user_name, email) VALUES (?, ?, ?, ?)';
    
    const [result] = await db.query(sql, [login_id, password, user_name, email]);
    res.json({ message: '회원가입 성공' });
    
  } catch (err) {
    console.error('SQL 에러:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '이미 존재하는 아이디 또는 이메일입니다.' });
    }
    return res.status(500).json({ error: '회원가입 실패' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;
    
    if (!login_id || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const query = 'SELECT * FROM users WHERE login_id = ? AND password = ?';
    const [results] = await db.query(query, [login_id, password]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { 
        user_id: results[0].user_id,
        login_id: results[0].login_id,
        user_name: results[0].user_name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: '로그인 성공',
      token,
      user: {
        user_id: results[0].user_id,
        login_id: results[0].login_id,
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

    const query = `
      INSERT INTO videos (
        upload_user_id, title, description, 
        video_url, thumbnail_url, views,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 0, NOW())
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
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      timestamp: new Date(video.created_at).toLocaleDateString()
    }));

    res.json(videosWithUrls);
  } catch (error) {
    console.error('비디오 목록 조회 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 비디오 상세 정보 조회 API
app.get('/api/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const [videos] = await db.query(`
      SELECT 
        v.*,
        u.user_name as channel_name
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      WHERE v.video_id = ?
    `, [videoId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '비디오를 찾을 수 없습니다.' });
    }

    const video = videos[0];

    // 조회수 증가
    await db.query('UPDATE videos SET views = views + 1 WHERE video_id = ?', [videoId]);

    console.log('응답할 비디오 데이터:', video);
    res.json(video);
  } catch (error) {
    console.error('비디오 상세 정보 조회 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// 댓글 목록 조회 API
app.get('/api/videos/:videoId/comments', async (req, res) => {
  try {
    const { videoId } = req.params;
    console.log('댓글 조회 요청:', videoId);
    
    const [comments] = await db.query(`
      SELECT 
        c.comment_id,
        c.video_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.video_id = ?
      ORDER BY c.created_at DESC
    `, [videoId]);

    console.log('조회된 댓글 수:', comments.length);
    res.json(comments);

  } catch (error) {
    // 자세한 에러 로깅
    console.error('댓글 목록 조회 중 에러 발생:', {
      error: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });

    res.status(500).json({ 
      message: '서버 에러가 발생했습니다.',
      error: error.message 
    });
  }
});

// 댓글 작성 API
app.post('/api/videos/:videoId/comments', authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    console.log('댓글 작성 요청:', { videoId, content, user_id });

    // 비디오 존재 여부 확인
    const [video] = await db.query('SELECT video_id FROM videos WHERE video_id = ?', [videoId]);
    
    if (video.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 비디오입니다.' });
    }

    const [result] = await db.query(`
      INSERT INTO comments 
      (video_id, user_id, content, created_at) 
      VALUES (?, ?, ?, NOW())
    `, [videoId, user_id, content]);

    // 새로 작성된 댓글 정보 조회 (profile_image 필드 제거)
    const [newComment] = await db.query(`
      SELECT 
        c.comment_id,
        c.video_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);

    console.log('생성된 댓글:', newComment[0]);
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('댓글 작성 에러:', error);
    res.status(500).json({ 
      message: '서버 에러가 발생했습니다.',
      error: error.message 
    });
  }
});

// 댓글 수정 API
app.put('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    const [comment] = await db.query(
      'SELECT user_id FROM comments WHERE comment_id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    await db.query(`
      UPDATE comments 
      SET content = ?, updated_at = NOW() 
      WHERE comment_id = ?
    `, [content, commentId]);

    res.json({ message: '댓글이 수정되었습니다.' });
  } catch (error) {
    console.error('댓글 수정 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 댓글 삭제 API
app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.user_id;

    // 댓글 작성자 확인
    const [comment] = await db.query(
      'SELECT user_id FROM comments WHERE comment_id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    await db.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ message: '서버 에러가 발생했습니다.' });
});

// 서버 시작
const port = 3001;  // 이 부분만 확인

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행중입니다.`);
});
